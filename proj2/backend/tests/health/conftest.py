"""Fixtures for health profile tests"""

import pytest
from sqlalchemy.orm import Session

from src.eatsential.models import AllergenDB, UserDB
from src.eatsential.utils.auth_util import create_access_token


@pytest.fixture
def test_user(db: Session) -> UserDB:
    """Create a test user"""
    user = UserDB(
        id="test_user_id",
        email="health_test@example.com",
        username="health_test_user",
        password_hash="hashed_password",
        email_verified=True,
    )
    db.add(user)
    db.commit()
    return user


@pytest.fixture
def auth_headers(test_user: UserDB) -> dict[str, str]:
    """Get authentication headers for a test user"""
    access_token = create_access_token(data={"sub": test_user.id})
    return {"Authorization": f"Bearer {access_token}"}


@pytest.fixture
def milk_allergen(db: Session) -> AllergenDB:
    """Create a milk allergen"""
    allergen = AllergenDB(
        id="milk_id",
        name="milk",
        category="food",
        is_major_allergen=True,
    )
    db.add(allergen)
    db.commit()
    return allergen
