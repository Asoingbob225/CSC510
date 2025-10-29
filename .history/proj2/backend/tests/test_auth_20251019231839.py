import os
import pytest
from fastapi.testclient import TestClient

from ..index import app
from .. import models
from ..emailer import sent_emails


@pytest.fixture(autouse=True)
def setup_db(tmp_path, monkeypatch):
    # use a temp sqlite file for isolation
    dbfile = tmp_path / "test.db"
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{dbfile}")
    # re-import models to pick up env change - in this minimal example we'll call init_db directly
    models.init_db()
    yield
    # teardown: remove file if exists
    try:
        os.remove(dbfile)
    except Exception:
        pass


client = TestClient(app)


def test_successful_registration():
    sent_emails.clear()
    resp = client.post("/api/auth/register", json={
        "username": "alice123",
        "email": "alice@example.com",
        "password": "StrongPass1"
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["username"] == "alice123"
    assert data["email"] == "alice@example.com"
    assert len(sent_emails) == 1


def test_invalid_email():
    resp = client.post("/api/auth/register", json={
        "username": "bob123",
        "email": "not-an-email",
        "password": "StrongPass1"
    })
    assert resp.status_code == 400


def test_conflict_email_username():
    sent_emails.clear()
    # create first
    r1 = client.post("/api/auth/register", json={
        "username": "charlie",
        "email": "charlie@example.com",
        "password": "StrongPass1"
    })
    assert r1.status_code == 201
    # try again with same email
    r2 = client.post("/api/auth/register", json={
        "username": "charlie2",
        "email": "charlie@example.com",
        "password": "StrongPass1"
    })
    assert r2.status_code == 409
    # try again with same username
    r3 = client.post("/api/auth/register", json={
        "username": "charlie",
        "email": "charlie2@example.com",
        "password": "StrongPass1"
    })
    assert r3.status_code == 409


def test_weak_password():
    resp = client.post("/api/auth/register", json={
        "username": "dave",
        "email": "dave@example.com",
        "password": "weak"
    })
    assert resp.status_code == 422 or resp.status_code == 400


def test_rate_limit_placeholder():
    # rate-limiting not implemented in this minimal demo; we assert endpoint exists
    resp = client.post("/api/auth/register", json={
        "username": "eve",
        "email": "eve@example.com",
        "password": "StrongPass1"
    })
    assert resp.status_code in (201, 409)
