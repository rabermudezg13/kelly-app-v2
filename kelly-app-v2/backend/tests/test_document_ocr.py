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
