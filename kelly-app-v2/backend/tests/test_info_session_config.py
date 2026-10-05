"""Regression coverage for native and legacy JSON configuration storage."""
import json

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.api.info_session_config import router
from app.models.info_session_config import InfoSessionConfig


@pytest.fixture
def config_client():
    engine = create_engine('sqlite://', connect_args={'check_same_thread': False}, poolclass=StaticPool)
    Base.metadata.create_all(engine)
    with sessionmaker(bind=engine)() as session:
        app = FastAPI()
        app.include_router(router, prefix='/config')
        app.dependency_overrides[get_db] = lambda: session
        with TestClient(app, raise_server_exceptions=False) as client:
            yield client, session
    engine.dispose()


@pytest.mark.parametrize('slots', [['10:00 AM'], json.dumps(['10:00 AM'])])
def test_load_existing_native_and_legacy_slots(config_client, slots):
    client, db = config_client
    db.add(InfoSessionConfig(max_sessions_per_day=3, time_slots=slots, is_active=True))
    db.commit()
    response = client.get('/config/')
    assert response.status_code == 200
    assert response.json()['time_slots'] == ['10:00 AM']
    assert response.json()['max_sessions_per_day'] == 3
    assert db.query(InfoSessionConfig).count() == 1
    assert client.get('/config/time-slots').json() == ['10:00 AM']


def test_save_and_reload_retains_selected_values(config_client):
    client, db = config_client
    old = InfoSessionConfig(max_sessions_per_day=2, time_slots=json.dumps(['8:30 AM']), is_active=True)
    db.add(old)
    db.commit()
    body = {'max_sessions_per_day': 4, 'time_slots': ['10:15 AM', '3:45 PM'], 'is_active': True}
    response = client.put('/config/', json=body)
    assert response.status_code == 200
    assert response.json()['time_slots'] == body['time_slots']
    assert client.get('/config/').json() == response.json()
    assert client.get('/config/time-slots').json() == body['time_slots']
    db.expire_all()
    assert not db.get(InfoSessionConfig, old.id).is_active
    active = db.query(InfoSessionConfig).filter_by(is_active=True).one()
    assert active.time_slots == body['time_slots']


def test_default_configuration_loads(config_client):
    client, db = config_client
    assert client.get('/config/').status_code == 200
    assert client.get('/config/').json()['time_slots'] == ['8:30 AM', '1:30 PM']
    assert db.query(InfoSessionConfig).count() == 1


def test_failed_save_keeps_previous_active_config(config_client, monkeypatch):
    client, db = config_client
    old = InfoSessionConfig(max_sessions_per_day=2, time_slots=['8:30 AM'], is_active=True)
    db.add(old)
    db.commit()
    def fail_commit():
        raise RuntimeError('simulated storage failure')
    with monkeypatch.context() as patch:
        patch.setattr(db, 'commit', fail_commit)
        assert client.put('/config/', json={'time_slots': ['12:00 PM']}).status_code == 500
    db.expire_all()
    assert db.query(InfoSessionConfig).filter_by(is_active=True).one().id == old.id
    assert db.query(InfoSessionConfig).count() == 1
