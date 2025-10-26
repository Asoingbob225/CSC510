"""Fixtures for user management tests."""

import pytest
from sqlalchemy.orm import Session

from src.eatsential.models import UserDB, UserRole
from src.eatsential.utils.auth_util import create_access_token


@pytest.fixture
def regular_user(db: Session) -> UserDB:
    """Create a regular test user."""
    user = UserDB(
        id="regular_user_id",
        email="user@example.com",
        username="testuser",
        password_hash="hashed_password",
        email_verified=True,
        role=UserRole.USER,
    )
    db.add(user)
    db.commit()
    return user


@pytest.fixture
def admin_user(db: Session) -> UserDB:
    """Create an admin user."""
    user = UserDB(
        id="admin_user_id",
        email="admin@example.com",
        username="admin",
        password_hash="hashed_password",
        email_verified=True,
        role=UserRole.ADMIN,
    )
    db.add(user)
    db.commit()
    return user


@pytest.fixture
def user_auth_headers(regular_user: UserDB) -> dict[str, str]:
    """Get authentication headers for a regular user."""
    access_token = create_access_token(data={"sub": regular_user.id})
    return {"Authorization": f"Bearer {access_token}"}


@pytest.fixture
def admin_auth_headers(admin_user: UserDB) -> dict[str, str]:
    """Get authentication headers for an admin user."""
    access_token = create_access_token(data={"sub": admin_user.id})
    return {"Authorization": f"Bearer {access_token}"}
