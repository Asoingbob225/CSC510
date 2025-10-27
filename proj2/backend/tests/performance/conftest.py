"""Fixtures for performance tests."""

import pytest
from sqlalchemy.orm import Session

from src.eatsential.models.models import UserDB
from src.eatsential.utils.auth_util import create_access_token


@pytest.fixture
def test_user(db: Session) -> UserDB:
    """Create a test user for performance tests."""
    user = UserDB(
        id="performance_test_user_id",
        email="performance_test@example.com",
        username="performance_test_user",
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
