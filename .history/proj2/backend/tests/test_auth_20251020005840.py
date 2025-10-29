"""
Tests for authentication functionality
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from src.eatsential.database import Base, get_db
from src.eatsential.index import app
from src.eatsential.models import UserDB

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

import sys
from unittest.mock import AsyncMock, patch

@pytest.fixture
def mock_send_email():
    """Mock email sending for tests"""
    with patch('src.eatsential.auth.send_verification_email', new_callable=AsyncMock) as mock:
        mock.return_value = True
        yield mock

@pytest.fixture
def client(mock_send_email):
    """Create test client"""
    Base.metadata.create_all(bind=engine)
    yield TestClient(app)
    Base.metadata.drop_all(bind=engine)

def test_register_user_success(client):
    """Test successful user registration with valid complex password"""
    valid_passwords = [
        "SecureP@ss123",  # Basic valid password
        "C0mpl3x!Pass",   # Mixed case, numbers, special char
        "Str0ng@P@ssw0rd", # Multiple special chars
        "P@ssw0rd!2025"    # With numbers at end
    ]
    
    test_count = 1
    for password in valid_passwords:
        response = client.post(
            "/api/auth/register",
            json={
                "email": f"test{test_count}@example.com",
                "username": f"testuser{test_count}",
                "password": password
            }
        )
        test_count += 1
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["username"].startswith("testuser")
        assert data["email"].endswith("@example.com")
        assert "message" in data

def test_register_duplicate_email(client, mock_send_email):
    """Test registration with duplicate email (case-insensitive)"""
    # Create first user
    response = client.post(
        "/api/auth/register",
        json={
            "email": "test@example.com",
            "username": "testuser1",
            "password": "StrongPass123!"
        }
    )
    assert response.status_code == 200
    
    # Try to create second user with same email (different case)
    response = client.post(
        "/api/auth/register",
        json={
            "email": "Test@Example.com",
            "username": "testuser2",
            "password": "StrongPass123!"
        }
    )
    assert response.status_code == 422
    errors = response.json()["detail"]
    assert any("already registered" in error["msg"].lower() for error in errors)

def test_register_reserved_username(client):
    """Test registration with reserved username"""
    response = client.post(
        "/api/auth/register",
        json={
            "email": "test@example.com",
            "username": "admin",
            "password": "StrongPass123!"
        }
    )
    assert response.status_code == 422
    errors = response.json()["detail"]
    assert any("reserved" in error["msg"].lower() for error in errors)

def test_register_invalid_username_format(client):
    """Test registration with invalid username format"""
    response = client.post(
        "/api/auth/register",
        json={
            "email": "test@example.com",
            "username": "user@name",  # Contains invalid character
            "password": "StrongPass123!"
        }
    )
    assert response.status_code == 422
    errors = response.json()["detail"]
    assert any("failed pattern validation" in error["msg"].lower() for error in errors)

def test_register_email_format(client):
    """Test registration with various email formats"""
    invalid_emails = [
        "notanemail",
        "@nodomain.com",
        "no spaces@domain.com",
        "missing.domain@",
        "@",
        "email@.com",
        "email@domain.",
    ]
    
    for email in invalid_emails:
        response = client.post(
            "/api/auth/register",
            json={
                "email": email,
                "username": "testuser",
                "password": "StrongPass123!"
            }
        )
        assert response.status_code == 422
        errors = response.json()["detail"]
        assert any("email" in error["msg"].lower() for error in errors)

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
            "detail": "string should have at least 8 characters"
        },
        {
            "password": "nouppercase123!",  # Missing uppercase
            "detail": "uppercase letter"
        },
        {
            "password": "NOLOWERCASE123!",  # Missing lowercase
            "detail": "lowercase letter"
        },
        {
            "password": "NoSpecialChar123",  # Missing special character
            "detail": "special character"
        },
        {
            "password": "NoNumber@abcABC",  # Missing number
            "detail": "number"
        },
        {
            "password": "a" * 49,  # Too long
            "detail": "at most 48 characters"
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
        errors = response.json()["detail"]
        error_messages = [error["msg"].lower() for error in errors]
        print(f"Testing password: {test_case['password']}")
        print(f"Expected: {test_case['detail']}")
        print(f"Got messages: {error_messages}")
        assert any(test_case["detail"].lower() in msg.lower() for msg in error_messages)
