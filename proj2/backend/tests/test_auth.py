"""Tests for authentication functionality"""

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from src.eatsential.models import AccountStatus, UserDB


def test_register_user_success(client: TestClient, mock_send_email: list):
    """Test successful user registration with valid complex password"""
    response = client.post(
        "/api/auth/register",
        json={
            "email": "test@example.com",
            "username": "testuser",
            "password": "SecureP@ss123",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["username"] == "testuser"
    assert data["email"] == "test@example.com"
    assert "message" in data
    assert len(mock_send_email) > 0


def test_register_duplicate_email(
    client: TestClient, db: Session, mock_send_email: list
):
    """Test registration with duplicate email (case-insensitive)"""
    # Create first user
    response = client.post(
        "/api/auth/register",
        json={
            "email": "test@example.com",
            "username": "testuser1",
            "password": "StrongPass123!",
        },
    )
    assert response.status_code == 201

    # Try to create second user with same email (different case)
    response = client.post(
        "/api/auth/register",
        json={
            "email": "Test@Example.com",
            "username": "testuser2",
            "password": "StrongPass123!",
        },
    )
    assert response.status_code == 422
    errors = response.json()["detail"]
    assert any("already registered" in error["msg"].lower() for error in errors)


def test_login_success(client: TestClient, db: Session, mock_send_email: list):
    """Test successful login with valid credentials and JWT token"""
    # First register a user
    register_data = {
        "email": "logintest@example.com",
        "username": "loginuser",
        "password": "SecureP@ss123",
    }
    response = client.post("/api/auth/register", json=register_data)
    assert response.status_code == 201

    # Get the user from database and manually verify email
    user = db.query(UserDB).filter(UserDB.email == "logintest@example.com").first()
    user.email_verified = True
    user.account_status = AccountStatus.VERIFIED
    db.commit()

    # Now test login
    login_data = {
        "email": "logintest@example.com",
        "password": "SecureP@ss123",
    }
    response = client.post("/api/auth/login", json=login_data)
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert data["username"] == "loginuser"
    assert data["email"] == "logintest@example.com"
    assert data["message"] == "Login successful"
    # Check JWT token fields
    assert "access_token" in data
    assert "token_type" in data
    assert data["token_type"] == "bearer"  # noqa: S105
    assert isinstance(data["access_token"], str)
    assert len(data["access_token"]) > 0
    # Check wizard completion status
    assert "has_completed_wizard" in data
    assert isinstance(data["has_completed_wizard"], bool)
    assert data["has_completed_wizard"] is False  # No health profile created yet
