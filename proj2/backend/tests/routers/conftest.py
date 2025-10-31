"""Shared fixtures for router API tests."""

from collections.abc import Iterator

import pytest
from sqlalchemy.orm import Session

from src.eatsential.models.models import (
    ActivityLevel,
    AllergenDB,
    AllergySeverity,
    DietaryPreferenceDB,
    HealthProfileDB,
    MenuItem,
    PreferenceType,
    Restaurant,
    UserAllergyDB,
    UserDB,
)
from src.eatsential.utils.auth_util import create_access_token


def create_auth_headers(user: UserDB) -> dict[str, str]:
    """Create authentication headers for any user."""
    token = create_access_token(data={"sub": user.id})
    return {"Authorization": f"Bearer {token}"}


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
def rec_test_user(db: Session) -> Iterator[UserDB]:
    """Create a test user for recommendation API tests."""
    user = UserDB(
        id="rec_test_user",
        email="rec_test@example.com",
        username="rec_test_user",
        password_hash="hashed",
        email_verified=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    yield user


@pytest.fixture
def rec_user_with_profile(db: Session, rec_test_user: UserDB) -> Iterator[UserDB]:
    """Create a user with health profile, allergies, and dietary preferences."""
    allergen = AllergenDB(
        id="rec_test_allergen",
        name="Gluten",
        category="Grains",
        description="Gluten allergen",
    )
    db.add(allergen)
    db.flush()

    profile = HealthProfileDB(
        id="rec_test_profile",
        user_id=rec_test_user.id,
        height_cm=180.0,
        weight_kg=75.0,
        activity_level=ActivityLevel.ACTIVE,
        metabolic_rate=2200,
    )
    db.add(profile)
    db.flush()

    db.add(
        UserAllergyDB(
            id="rec_test_allergy",
            health_profile_id=profile.id,
            allergen_id=allergen.id,
            severity=AllergySeverity.MODERATE,
        )
    )
    db.add(
        DietaryPreferenceDB(
            id="rec_test_preference",
            health_profile_id=profile.id,
            preference_type=PreferenceType.DIET,
            preference_name="Vegan",
            is_strict=True,
        )
    )
    db.commit()
    yield rec_test_user


@pytest.fixture
def rec_test_menu_items(db: Session) -> Iterator[list[MenuItem]]:
    """Create a sample restaurant with menu items for recommendation tests."""
    restaurant = Restaurant(
        id="rec_test_restaurant",
        name="Test Restaurant",
        cuisine="Healthy",
        is_active=True,
    )
    db.add(restaurant)
    db.flush()

    items = [
        MenuItem(
            id="rec_item_light",
            restaurant_id=restaurant.id,
            name="Light Salad",
            description="Fresh garden salad",
            calories=250.0,
            price=10.99,
        ),
        MenuItem(
            id="rec_item_protein",
            restaurant_id=restaurant.id,
            name="Protein Bowl",
            description="High protein bowl",
            calories=500.0,
            price=14.99,
        ),
        MenuItem(
            id="rec_item_heavy",
            restaurant_id=restaurant.id,
            name="Heavy Meal",
            description="Large calorie meal",
            calories=1000.0,
            price=19.99,
        ),
        MenuItem(
            id="rec_item_budget",
            restaurant_id=restaurant.id,
            name="Budget Meal",
            description="Affordable option",
            calories=300.0,
            price=None,
        ),
    ]
    db.add_all(items)
    db.commit()
    yield items


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
