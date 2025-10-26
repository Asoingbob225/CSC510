"""Fixtures for meal API tests."""

import pytest
from sqlalchemy.orm import Session

from src.eatsential.models.models import UserDB
from src.eatsential.utils.auth_util import create_access_token


@pytest.fixture
def test_user(db: Session) -> UserDB:
    """Create a test user for meal API tests."""
    user = UserDB(
        id="meal_test_user_id",
        email="meal_test@example.com",
        username="meal_test_user",
        password_hash="hashed_password",
        email_verified=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def test_user_2(db: Session) -> UserDB:
    """Create a second test user for isolation tests."""
    user = UserDB(
        id="meal_test_user_2_id",
        email="meal_test2@example.com",
        username="meal_test_user_2",
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


@pytest.fixture
def auth_headers_2(test_user_2: UserDB) -> dict[str, str]:
    """Get authentication headers for the second test user."""
    access_token = create_access_token(data={"sub": test_user_2.id})
    return {"Authorization": f"Bearer {access_token}"}
