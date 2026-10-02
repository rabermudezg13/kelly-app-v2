"""Run from backend with: python -m pytest tests/test_nho_history.py"""
from datetime import datetime, timezone
from types import SimpleNamespace

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.api.auth import get_current_user
from app.api.new_hire_orientation import router
from app.models.visit import NewHireOrientation


@pytest.fixture
def client():
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(engine)
    session = sessionmaker(bind=engine)()
    rows = [
        (1780, "Taylor", "Example", "2026-09-23T17:05:19"),
        (1781, "Taylor", "Example", "2026-09-24T03:59:59"),
        (1782, "Taylor", "Example", "2026-09-24T04:00:00"),
        (1783, "Taylor", "Example", "2026-09-23T03:59:59"),
        (1784, "Other", "Person", "2026-09-23T18:00:00"),
        (1785, "DST", "Boundary", "2026-11-02T04:59:59"),
        (1786, "DST", "Boundary", "2026-11-02T05:00:00"),
        (1787, "Weekly", "Attendee", datetime.now(timezone.utc).replace(tzinfo=None).isoformat()),
    ]
    for ident, first, last, created in rows:
        session.add(NewHireOrientation(id=ident, first_name=first, last_name=last,
            email=f"test{ident}@example.com", phone="000", time_slot="1:30",
            status="completed", created_at=datetime.fromisoformat(created)))
    session.commit()
    app = FastAPI()
    app.include_router(router, prefix="/api/new-hire-orientation")
    app.dependency_overrides[get_db] = lambda: session
    app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(role="recruiter")
    with TestClient(app) as test_client:
        yield test_client
    session.close()
    engine.dispose()


def history(client, **params):
    return client.get("/api/new-hire-orientation/history", params=params)


def test_name_and_miami_date_boundaries(client):
    response = history(client, q="  EXAMPLE tayl  ", date_from="2026-09-23", date_to="2026-09-23")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 2
    assert [r["id"] for r in data["items"]] == [1781, 1780]
    assert data["items"][1]["status"] == "completed"


def test_pagination_and_literal_wildcards(client):
    first = history(client, q="example", limit=2).json()
    second = history(client, q="example", limit=2, offset=2).json()
    assert first["total"] == second["total"] == 4
    assert len({r["id"] for r in first["items"] + second["items"]}) == 4
    assert history(client, q="%").json()["total"] == 0
    assert history(client, q="_").json()["total"] == 0
    assert history(client, q="Missing person").json()["total"] == 0


def test_date_only_dst_and_open_range(client):
    data = history(client, date_from="2026-11-01", date_to="2026-11-01").json()
    assert [r["id"] for r in data["items"]] == [1785]
    assert history(client, q="DST", date_from="2026-11-02").json()["total"] == 1


@pytest.mark.parametrize("params", [{}, {"q": " "}, {"q":"a", "limit":101},
    {"q":"a", "offset":-1}, {"q":"a", "date_from":"invalid"},
    {"date_from":"2026-09-24", "date_to":"2026-09-23"}])
def test_invalid_filters(client, params):
    assert history(client, **params).status_code == 422


def test_weekly_and_detail_routes_unchanged(client):
    url = "/api/new-hire-orientation/?current_week=true"
    before = client.get(url).json()
    assert 1787 in [r["id"] for r in before]
    assert 1780 not in [r["id"] for r in before]
    history(client, q="Taylor")
    assert client.get(url).json() == before
    assert client.get("/api/new-hire-orientation/1780").json()["id"] == 1780


def test_history_requires_staff_login(client):
    client.app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(role="user")
    assert history(client, q="Taylor").status_code == 403
    del client.app.dependency_overrides[get_current_user]
    assert history(client, q="Taylor").status_code == 401

