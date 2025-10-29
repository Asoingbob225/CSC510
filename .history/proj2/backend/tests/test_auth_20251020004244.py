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

@pytest.fixture
def client():
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
    
    for password in valid_passwords:
        response = client.post(
            "/api/auth/register",
            json={
                "email": f"test{password}@example.com",
                "username": f"testuser{password}",
                "password": password
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["username"].startswith("testuser")
        assert data["email"].endswith("@example.com")
        assert "message" in data

def test_register_duplicate_email(client):
    """Test registration with duplicate email (case-insensitive)"""
    # Create first user
    client.post(
        "/api/auth/register",
        json={
            "email": "test@example.com",
            "username": "testuser1",
            "password": "StrongPass123!"
        }
    )
    
    # Try to create second user with same email (different case)
    response = client.post(
        "/api/auth/register",
        json={
            "email": "Test@Example.com",
            "username": "testuser2",
            "password": "StrongPass123!"
        }
    )
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"].lower()

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
    assert response.status_code == 400
    assert "reserved" in response.json()["detail"].lower()

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
    assert "can only contain" in response.json()["detail"].lower()

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
        assert "email" in response.json()["detail"].lower()

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
