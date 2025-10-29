"""
Tests for authentication functionality
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from ..database import Base, get_db
from ..index import app
from ..models import UserDB

# Create in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite://"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    """Override database session for testing"""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture
def client():
    """Create test client"""
    Base.metadata.create_all(bind=engine)
    yield TestClient(app)
    Base.metadata.drop_all(bind=engine)

def test_register_user_success(client):
    """Test successful user registration"""
    response = client.post(
        "/api/auth/register",
        json={
            "email": "test@example.com",
            "username": "testuser",
            "password": "StrongPass123!"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert data["username"] == "testuser"
    assert data["email"] == "test@example.com"
    assert "message" in data

def test_register_duplicate_email(client):
    """Test registration with duplicate email"""
    # Create first user
    client.post(
        "/api/auth/register",
        json={
            "email": "test@example.com",
            "username": "testuser1",
            "password": "StrongPass123!"
        }
    )
    
    # Try to create second user with same email
    response = client.post(
        "/api/auth/register",
        json={
            "email": "test@example.com",
            "username": "testuser2",
            "password": "StrongPass123!"
        }
    )
    assert response.status_code == 400
    assert "Email already registered" in response.json()["detail"]

def test_register_invalid_email(client):
    """Test registration with invalid email format"""
    response = client.post(
        "/api/auth/register",
        json={
            "email": "invalid-email",
            "username": "testuser",
            "password": "StrongPass123!"
        }
    )
    assert response.status_code == 422

def test_register_short_username(client):
    """Test registration with username that's too short"""
    response = client.post(
        "/api/auth/register",
        json={
            "email": "test@example.com",
            "username": "te",  # Too short
            "password": "StrongPass123!"
        }
    )
    assert response.status_code == 422

def test_password_validation(client):
    """Test password validation rules"""
    test_cases = [
        {
            "password": "short",  # Too short
            "detail": "ensure this value has at least 8 characters"
        },
        {
            "password": "nouppercase123!",  # Missing uppercase
            "detail": "string does not match regex"
        },
        {
            "password": "NOLOWERCASE123!",  # Missing lowercase
            "detail": "string does not match regex"
        },
        {
            "password": "NoSpecialChar123",  # Missing special character
            "detail": "string does not match regex"
        },
        {
            "password": "NoNumber@abcABC",  # Missing number
            "detail": "string does not match regex"
        },
        {
            "password": "a" * 49,  # Too long
            "detail": "ensure this value has at most 48 characters"
        }
    ]

    for test_case in test_cases:
        response = client.post(
            "/api/auth/register",
            json={
                "email": "test@example.com",
                "username": "testuser",
                "password": test_case["password"]
            }
        )
        assert response.status_code == 422
        assert test_case["detail"] in str(response.json())
