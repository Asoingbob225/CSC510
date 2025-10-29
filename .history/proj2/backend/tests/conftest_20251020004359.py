"""
Test configuration and fixtures
"""
import os

# Set test mode to disable rate limiting
os.environ["TEST_MODE"] = "true"
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from src.eatsential.database import Base, get_db
from src.eatsential.index import app

# Create in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite://"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db():
    """
    Create a fresh database for each test function
    """
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db):
    """
    Create a test client using the test database
    """
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture(scope="function")
def test_smtp_server(monkeypatch):
    """
    Mock SMTP server for email testing
    """
    sent_emails = []
    
    async def mock_send_email(*args, **kwargs):
        sent_emails.append((args, kwargs))
        return True
    
    monkeypatch.setattr(
        "src.eatsential.emailer.send_verification_email",
        mock_send_email
    )
    
    return sent_emails