"""
Tests for email verification functionality
"""
from datetime import datetime, timedelta
import uuid
import pytest
from src.eatsential.models import UserDB, AccountStatus

def test_verify_email_success(client, db):
    """Test successful email verification"""
    # Create user with verification token
    user = UserDB(
        id=str(uuid.uuid4()),
        email="test@example.com",
        username="testuser",
        password_hash="hashed",
        verification_token=str(uuid.uuid4()),
        verification_token_expires=datetime.utcnow() + timedelta(hours=24),
        account_status=AccountStatus.PENDING
    )
    db.add(user)
    db.commit()
    
    response = client.get(f"/api/auth/verify-email/{user.verification_token}")
    assert response.status_code == 200
    assert "Email verified successfully" in response.json()["message"]
    
    # Check database updates
    db.refresh(user)
    assert user.email_verified is True
    assert user.account_status == AccountStatus.VERIFIED
    assert user.verification_token is None
    assert user.verification_token_expires is None

def test_verify_email_invalid_token(client):
    """Test verification with invalid token"""
    response = client.get(f"/api/auth/verify-email/{uuid.uuid4()}")
    assert response.status_code == 400
    assert "Invalid or expired verification token" in response.json()["detail"]

def test_verify_email_expired_token(client, db):
    """Test verification with expired token"""
    # Create user with expired verification token
    user = UserDB(
        id=str(uuid.uuid4()),
        email="test@example.com",
        username="testuser",
        password_hash="hashed",
        verification_token=str(uuid.uuid4()),
        verification_token_expires=datetime.utcnow() - timedelta(hours=1),
        account_status=AccountStatus.PENDING
    )
    db.add(user)
    db.commit()
    
    response = client.get(f"/api/auth/verify-email/{user.verification_token}")
    assert response.status_code == 400
    assert "Invalid or expired verification token" in response.json()["detail"]

def test_resend_verification_success(client, db):
    """Test successful resend of verification email"""
    # Create unverified user
    user = UserDB(
        id=str(uuid.uuid4()),
        email="test@example.com",
        username="testuser",
        password_hash="hashed",
        account_status=AccountStatus.PENDING
    )
    db.add(user)
    db.commit()
    
    response = client.post(
        "/api/auth/resend-verification",
        json={"email": user.email}
    )
    assert response.status_code == 200
    assert "Verification email sent" in response.json()["message"]
    
    # Check that new token was generated
    db.refresh(user)
    assert user.verification_token is not None
    assert user.verification_token_expires > datetime.utcnow()

def test_resend_verification_user_not_found(client):
    """Test resend verification for non-existent user"""
    response = client.post(
        "/api/auth/resend-verification",
        json={"email": "nonexistent@example.com"}
    )
    assert response.status_code == 404
    assert "User not found" in response.json()["detail"]

def test_resend_verification_already_verified(client, db):
    """Test resend verification for already verified user"""
    # Create verified user
    user = UserDB(
        id=str(uuid.uuid4()),
        email="test@example.com",
        username="testuser",
        password_hash="hashed",
        account_status=AccountStatus.VERIFIED,
        email_verified=True
    )
    db.add(user)
    db.commit()
    
    response = client.post(
        "/api/auth/resend-verification",
        json={"email": user.email}
    )
    assert response.status_code == 400
    assert "Email already verified" in response.json()["detail"]