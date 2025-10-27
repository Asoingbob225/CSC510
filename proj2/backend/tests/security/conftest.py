"""Fixtures for security and privacy tests."""

import pytest
from sqlalchemy.orm import Session

from src.eatsential.models.models import UserDB
from src.eatsential.utils.auth_util import create_access_token


@pytest.fixture
def test_user(db: Session) -> UserDB:
    """Create a test user for security tests."""
    user = UserDB(
        id="security_test_user_id",
        email="security_test@example.com",
        username="security_test_user",
        password_hash="hashed_password",
        email_verified=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def test_user2(db: Session) -> UserDB:
    """Create a second test user for privacy isolation tests."""
    user = UserDB(
        id="security_test_user_2_id",
        email="security_test2@example.com",
        username="security_test_user_2",
        password_hash="hashed_password",
        email_verified=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def auth_headers(test_user: UserDB) -> dict[str, str]:
    """Get authentication headers for the test user."""
    access_token = create_access_token(data={"sub": test_user.id})
    return {"Authorization": f"Bearer {access_token}"}
