"""Authenticated, bounded in-memory name-strip OCR. No UploadFile/disk/DB writes."""
import asyncio
import io
import json
import sys
import threading
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from PIL import Image, UnidentifiedImageError
from app.api.auth import get_current_user
from app.services.handwriting_model import ready

router = APIRouter()
_gate = threading.Lock()
MAX_BYTES = 262144

def validate_crop(data):
    try:
        with Image.open(io.BytesIO(data)) as im:
            width, height = im.size
            if im.format not in {'JPEG', 'PNG'} or not (80 <= width <= 1800 and 16 <= height <= 320 and 2 <= width / height <= 30):
                raise ValueError()
            im.verify()
    except (UnidentifiedImageError, OSError, ValueError, Image.DecompressionBombError):
        raise HTTPException(422, 'Send only a cropped name line (JPEG or PNG).')

async def recognize(data):
    process = await asyncio.create_subprocess_exec(sys.executable, '-m', 'app.services.handwriting_worker',
        stdin=asyncio.subprocess.PIPE, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.DEVNULL)
    try:
        output, _ = await asyncio.wait_for(process.communicate(data), timeout=60)
        if process.returncode or len(output) > 2048:
            raise ValueError()
        return json.loads(output)['name']
    finally:
        if process.returncode is None:
            process.kill()
        await process.wait()

@router.post('/drug-screen-name')
async def drug_screen_name(request: Request, user=Depends(get_current_user)):
    role = getattr(user.role, 'value', user.role)
    if not user.is_active or role not in {'admin', 'recruiter', 'management', 'staff', 'frontdesk', 'talent'}:
        raise HTTPException(403, 'Staff access required.')
    if request.headers.get('content-type', '').split(';')[0] not in {'image/jpeg', 'image/png'}:
        raise HTTPException(415, 'Send a JPEG or PNG name crop.')
    if not ready():
        raise HTTPException(503, 'Name recognition is preparing. Enter the name manually or try again shortly.')
    if not _gate.acquire(blocking=False):
        raise HTTPException(429, 'Name recognition is busy. Please try again.')
    data = bytearray()
    try:
        async def read_body():
            async for chunk in request.stream():
                data.extend(chunk)
                if len(data) > MAX_BYTES:
                    raise HTTPException(413, 'Name crop is too large.')
        await asyncio.wait_for(read_body(), timeout=10)
        validate_crop(data)
        name = await recognize(bytes(data))
        return JSONResponse({'name': name, 'review_required': True}, headers={'Cache-Control': 'no-store', 'Pragma': 'no-cache'})
    except asyncio.TimeoutError:
        raise HTTPException(504, 'Recognition timed out. Enter the name manually or try again.')
    except (ValueError, KeyError, OSError):
        raise HTTPException(503, 'Name recognition unavailable. Enter the name manually.')
    finally:
        data.clear()
        _gate.release()
