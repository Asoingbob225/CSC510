"""Tests for authentication functionality"""

from unittest.mock import AsyncMock, patch

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from src.eatsential.database import Base, get_db
from src.eatsential.index import app
from src.eatsential.models import AccountStatus, UserDB

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
    db = None
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        if db is not None:
            db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture
def mock_send_email():
    """Mock email sending for tests"""
    with patch(
        "src.eatsential.services.user_service.send_verification_email",
        new_callable=AsyncMock,
    ) as mock:
        mock.return_value = True
        yield mock


@pytest.fixture
def client(mock_send_email):
    """Create test client"""
    Base.metadata.create_all(bind=engine)
    yield TestClient(app)
    Base.metadata.drop_all(bind=engine)


def test_register_user_success(client, mock_send_email):
    """Test successful user registration with valid complex password"""
    valid_passwords = [
        "SecureP@ss123",  # Basic valid password
        "C0mpl3x!Pass",  # Mixed case, numbers, special char
        "Str0ng@P@ssw0rd",  # Multiple special chars
        "P@ssw0rd!2025",  # With numbers at end
    ]

    test_count = 1
    for password in valid_passwords:
        request_data = {
            "email": f"test{test_count}@example.com",
            "username": f"testuser{test_count}",
            "password": password,
        }
        response = client.post("/api/auth/register", json=request_data)
        print(f"\nRequest data: {request_data}")
        print(f"Response status: {response.status_code}")
        print(f"Response content: {response.content}")
        test_count += 1
        assert response.status_code == 201
        data = response.json()
        assert "id" in data
        assert data["username"].startswith("testuser")
        assert data["email"].endswith("@example.com")
        assert "message" in data
        assert mock_send_email.called


def test_register_duplicate_email(client, mock_send_email):
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


def test_register_reserved_username(client):
    """Test registration with reserved username"""
    response = client.post(
        "/api/auth/register",
        json={
            "email": "test@example.com",
            "username": "admin",
            "password": "StrongPass123!",
        },
    )
    assert response.status_code == 422
    # Pydantic validation errors return array format
    errors = response.json()["detail"]
    assert any("reserved" in error["msg"].lower() for error in errors)


def test_register_invalid_username_format(client):
    """Test registration with invalid username format"""
    response = client.post(
        "/api/auth/register",
        json={
            "email": "test@example.com",
            "username": "user@name",  # Contains invalid character
            "password": "StrongPass123!",
        },
    )
    assert response.status_code == 422
    errors = response.json()["detail"]
    assert any("match pattern" in error["msg"].lower() for error in errors)


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
            json={"email": email, "username": "testuser", "password": "StrongPass123!"},
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
            "password": "StrongPass123!",
        },
    )
    assert response.status_code == 422


def test_register_short_username(client):
    """Test registration with username that's too short"""
    response = client.post(
        "/api/auth/register",
        json={
            "email": "test@example.com",
            "username": "te",  # Too short
            "password": "StrongPass123!",
        },
    )
    assert response.status_code == 422


def test_password_validation(client):
    """Test password validation rules"""
    test_cases = [
        {
            "password": "short",  # Too short
            "detail": "string should have at least 8 characters",
        },
        {
            "password": "nouppercase123!",  # Missing uppercase
            "detail": "uppercase letter",
        },
        {
            "password": "NOLOWERCASE123!",  # Missing lowercase
            "detail": "lowercase letter",
        },
        {
            "password": "NoSpecialChar123",  # Missing special character
            "detail": "special character",
        },
        {
            "password": "NoNumber@abcABC",  # Missing number
            "detail": "number",
        },
        {
            "password": "a" * 49,  # Too long
            "detail": "at most 48 characters",
        },
    ]

    for test_case in test_cases:
        response = client.post(
            "/api/auth/register",
            json={
                "email": "test@example.com",
                "username": "testuser",
                "password": test_case["password"],
            },
        )
        assert response.status_code == 422
        errors = response.json()["detail"]
        error_messages = [error["msg"].lower() for error in errors]
        print(f"Testing password: {test_case['password']}")
        print(f"Expected: {test_case['detail']}")
        print(f"Got messages: {error_messages}")
        assert any(test_case["detail"].lower() in msg.lower() for msg in error_messages)


def test_login_success(client, mock_send_email):
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
    db = TestingSessionLocal()
    try:
        user = db.query(UserDB).filter(UserDB.email == "logintest@example.com").first()
        user.email_verified = True
        user.account_status = AccountStatus.VERIFIED
        db.commit()
    finally:
        db.close()

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
    assert data["token_type"] == "bearer"
    assert isinstance(data["access_token"], str)
    assert len(data["access_token"]) > 0


def test_login_case_insensitive_email(client, mock_send_email):
    """Test login with case-insensitive email"""
    # Register a user
    register_data = {
        "email": "CaseTest@Example.com",
        "username": "caseuser",
        "password": "SecureP@ss123",
    }
    response = client.post("/api/auth/register", json=register_data)
    assert response.status_code == 201

    # Verify email
    db = TestingSessionLocal()
    try:
        user = (
            db.query(UserDB).filter(UserDB.email.ilike("CaseTest@Example.com")).first()
        )
        user.email_verified = True
        user.account_status = AccountStatus.VERIFIED
        db.commit()
    finally:
        db.close()

    # Try login with lowercase email
    login_data = {
        "email": "casetest@example.com",
        "password": "SecureP@ss123",
    }
    response = client.post("/api/auth/login", json=login_data)
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "caseuser"


def test_login_invalid_email(client, mock_send_email):
    """Test login with non-existent email"""
    login_data = {
        "email": "nonexistent@example.com",
        "password": "SecureP@ss123",
    }
    response = client.post("/api/auth/login", json=login_data)
    assert response.status_code == 401
    data = response.json()
    assert data["detail"] == "Invalid email"


def test_login_invalid_password(client, mock_send_email):
    """Test login with wrong password"""
    # First register a user
    register_data = {
        "email": "wrongpass@example.com",
        "username": "wrongpassuser",
        "password": "SecureP@ss123",
    }
    response = client.post("/api/auth/register", json=register_data)
    assert response.status_code == 201

    # Verify email
    db = TestingSessionLocal()
    try:
        user = db.query(UserDB).filter(UserDB.email == "wrongpass@example.com").first()
        user.email_verified = True
        user.account_status = AccountStatus.VERIFIED
        db.commit()
    finally:
        db.close()

    # Try login with wrong password
    login_data = {
        "email": "wrongpass@example.com",
        "password": "WrongP@ssword123",
    }
    response = client.post("/api/auth/login", json=login_data)
    assert response.status_code == 401
    data = response.json()
    assert data["detail"] == "Invalid password"


def test_login_unverified_email(client, mock_send_email):
    """Test login attempt with unverified email"""
    # Register a user but don't verify email
    register_data = {
        "email": "unverified@example.com",
        "username": "unverifieduser",
        "password": "SecureP@ss123",
    }
    response = client.post("/api/auth/register", json=register_data)
    assert response.status_code == 201

    # Try to login without verifying email
    login_data = {
        "email": "unverified@example.com",
        "password": "SecureP@ss123",
    }
    response = client.post("/api/auth/login", json=login_data)
    assert response.status_code == 403
    data = response.json()
    assert data["detail"] == "Email not verified"


def test_login_missing_email(client):
    """Test login with missing email field"""
    login_data = {
        "password": "SecureP@ss123",
    }
    response = client.post("/api/auth/login", json=login_data)
    assert response.status_code == 422
    errors = response.json()["detail"]
    assert any("email" in error["loc"] for error in errors)


def test_login_missing_password(client):
    """Test login with missing password field"""
    login_data = {
        "email": "test@example.com",
    }
    response = client.post("/api/auth/login", json=login_data)
    assert response.status_code == 422
    errors = response.json()["detail"]
    assert any("password" in error["loc"] for error in errors)


def test_login_invalid_email_format(client):
    """Test login with invalid email format"""
    login_data = {
        "email": "not-an-email",
        "password": "SecureP@ss123",
    }
    response = client.post("/api/auth/login", json=login_data)
    assert response.status_code == 422
    errors = response.json()["detail"]
    assert any("email" in error["msg"].lower() for error in errors)


def test_login_empty_credentials(client):
    """Test login with empty email and password"""
    login_data = {
        "email": "",
        "password": "",
    }
    response = client.post("/api/auth/login", json=login_data)
    assert response.status_code == 422


def test_protected_endpoint_without_token(client):
    """Test accessing protected endpoint without JWT token"""
    response = client.get("/users/me")
    assert response.status_code == 403  # Forbidden without token


def test_protected_endpoint_with_invalid_token(client):
    """Test accessing protected endpoint with invalid JWT token"""
    headers = {"Authorization": "Bearer invalid_token_here"}
    response = client.get("/users/me", headers=headers)
    assert response.status_code == 401  # Unauthorized with invalid token


def test_protected_endpoint_with_valid_token(client, mock_send_email):
    """Test accessing protected endpoint with valid JWT token"""
    # First register a user
    register_data = {
        "email": "protectedtest@example.com",
        "username": "protecteduser",
        "password": "SecureP@ss123",
    }
    response = client.post("/api/auth/register", json=register_data)
    assert response.status_code == 201

    # Verify the user's email
    db = TestingSessionLocal()
    try:
        user = (
            db.query(UserDB).filter(UserDB.email == "protectedtest@example.com").first()
        )
        user.email_verified = True
        user.account_status = AccountStatus.VERIFIED
        db.commit()
    finally:
        db.close()

    # Login to get token
    login_data = {
        "email": "protectedtest@example.com",
        "password": "SecureP@ss123",
    }
    response = client.post("/api/auth/login", json=login_data)
    assert response.status_code == 200
    data = response.json()
    access_token = data["access_token"]

    # Access protected endpoint with token
    headers = {"Authorization": f"Bearer {access_token}"}
    response = client.get("/users/me", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "protecteduser"
    assert data["email"] == "protectedtest@example.com"
