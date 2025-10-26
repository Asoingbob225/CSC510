"""Fixtures for health profile tests"""

import pytest
from sqlalchemy.orm import Session

from src.eatsential.models.models import AllergenDB, UserDB, UserRole
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
        role=UserRole.USER,
    )
    db.add(user)
    db.commit()
    return user


@pytest.fixture
def admin_user(db: Session) -> UserDB:
    """Create an admin user"""
    user = UserDB(
        id="admin_user_id",
        email="admin@example.com",
        username="admin_user",
        password_hash="hashed_password",
        email_verified=True,
        role=UserRole.ADMIN,
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
def user_auth_headers(test_user: UserDB) -> dict[str, str]:
    """Get authentication headers for a regular test user"""
    access_token = create_access_token(data={"sub": test_user.id})
    return {"Authorization": f"Bearer {access_token}"}


@pytest.fixture
def admin_auth_headers(admin_user: UserDB) -> dict[str, str]:
    """Get authentication headers for an admin user"""
    access_token = create_access_token(data={"sub": admin_user.id})
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
