import io
import asyncio
from types import SimpleNamespace
import pytest
from PIL import Image
from fastapi import FastAPI
from fastapi.testclient import TestClient
from app.api import document_ocr as ocr
from app.api.auth import get_current_user
from app.services.handwriting_worker import normalize_name

def image(width=600,height=65):
    stream=io.BytesIO();Image.new('RGB',(width,height),'white').save(stream,'JPEG');return stream.getvalue()

@pytest.fixture
def client(monkeypatch):
    app=FastAPI();app.include_router(ocr.router)
    app.dependency_overrides[get_current_user]=lambda:SimpleNamespace(role='recruiter',is_active=True)
    monkeypatch.setattr(ocr,'ready',lambda:True)
    async def recognize(data):
        assert data==image()
        return 'Alex Example'
    monkeypatch.setattr(ocr,'recognize',recognize)
    return TestClient(app)

def test_memory_crop_response_requires_review_and_never_cache(client):
    r=client.post('/drug-screen-name',content=image(),headers={'Content-Type':'image/jpeg'})
    assert r.status_code==200
    assert r.json()=={'name':'Alex Example','review_required':True}
    assert r.headers['cache-control']=='no-store'

def test_authentication_and_roles(client):
    client.app.dependency_overrides[get_current_user]=lambda:SimpleNamespace(role='user',is_active=True)
    assert client.post('/drug-screen-name',content=image(),headers={'Content-Type':'image/jpeg'}).status_code==403
    client.app.dependency_overrides.clear()
    assert client.post('/drug-screen-name',content=image(),headers={'Content-Type':'image/jpeg'}).status_code==401

def test_reject_full_document_and_oversized_or_invalid_images(client):
    for body,expected in [(image(600,800),422),(b'not an image',422),(b'x'*262145,413)]:
        assert client.post('/drug-screen-name',content=body,headers={'Content-Type':'image/jpeg'}).status_code==expected
    assert client.post('/drug-screen-name',content=b'%PDF',headers={'Content-Type':'application/pdf'}).status_code==415

def test_busy_and_model_preparing_are_recoverable(client,monkeypatch):
    ocr._gate.acquire()
    try:
        assert client.post('/drug-screen-name',content=image(),headers={'Content-Type':'image/jpeg'}).status_code==429
    finally:ocr._gate.release()
    monkeypatch.setattr(ocr,'ready',lambda:False)
    assert client.post('/drug-screen-name',content=image(),headers={'Content-Type':'image/jpeg'}).status_code==503

def test_timeout_releases_concurrency_slot(client,monkeypatch):
    async def timeout(data):raise asyncio.TimeoutError()
    monkeypatch.setattr(ocr,'recognize',timeout)
    assert client.post('/drug-screen-name',content=image(),headers={'Content-Type':'image/jpeg'}).status_code==504
    assert ocr._gate.acquire(blocking=False)
    ocr._gate.release()

def test_names_are_not_guessed_from_numbers_or_instructions():
    assert normalize_name('  Alex   Example. ')=='Alex Example'
    assert normalize_name("Ana-María O’Neill")=="Ana-María O’Neill"
    for value in ['','Alex','1234','Alex Example /tmp','<script>test</script>']:
        assert normalize_name(value)==''

def test_ocr_copy_removes_slanted_table_rule_and_trims_empty_space():
    from PIL import ImageDraw
    from app.services.name_strip import clean_name_strip
    original=Image.new('RGB',(600,80),'white')
    draw=ImageDraw.Draw(original)
    # Fictitious ink strokes and a separate tilted table rule.
    draw.rectangle((20,15,32,50),fill='black')
    draw.rectangle((55,18,70,48),fill='black')
    draw.line((0,73,599,55),fill='black',width=3)
    draw.line((597,0,597,79),fill='black',width=2)
    before=original.tobytes()
    cleaned=clean_name_strip(original)
    assert original.tobytes()==before
    assert cleaned.width<100 and cleaned.height<60
    assert cleaned.getextrema()[0][0]==0


def test_ocr_copy_preserves_strips_without_confirmed_table_rule():
    from PIL import ImageDraw
    from app.services.name_strip import clean_name_strip
    for blank in [True,False]:
        source=Image.new('RGB',(400,70),'white')
        if not blank:ImageDraw.Draw(source).text((20,20),'Alex Example',fill='black')
        assert clean_name_strip(source) is source
    rule_only=Image.new('RGB',(400,70),'white')
    ImageDraw.Draw(rule_only).line((0,60,399,60),fill='black',width=3)
    assert clean_name_strip(rule_only) is rule_only


def test_rule_cleanup_keeps_letter_strokes_crossing_the_rule():
    from PIL import ImageDraw
    from app.services.name_strip import clean_name_strip
    source=Image.new('RGB',(600,80),'white')
    draw=ImageDraw.Draw(source)
    draw.line((0,65,599,65),fill='black',width=3)
    draw.rectangle((25,20,36,70),fill='black')
    draw.rectangle((65,20,76,70),fill='black')
    cleaned=clean_name_strip(source)
    # Strokes below the rule survive in the trimmed OCR copy.
    assert cleaned.height>=60
    assert cleaned.width<100
