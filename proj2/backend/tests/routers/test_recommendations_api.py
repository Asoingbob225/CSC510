"""Integration tests for the LLM-enabled recommendation API."""

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


def _auth_headers(user: UserDB) -> dict[str, str]:
    token = create_access_token(data={"sub": user.id})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def api_user(db: Session) -> Iterator[UserDB]:
    """Create a baseline user for API recommendation tests."""
    user = UserDB(
        id="rec_api_user",
        email="rec_api@example.com",
        username="rec_api",
        password_hash="hashed",
        email_verified=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    yield user


@pytest.fixture
def api_user_with_profile(db: Session, api_user: UserDB) -> Iterator[UserDB]:
    """Attach a health profile with allergies and preferences to the base user."""
    allergen = AllergenDB(
        id="rec_api_allergen",
        name="Gluten",
        category="Grains",
        description="Gluten allergen",
    )
    db.add(allergen)
    db.flush()

    profile = HealthProfileDB(
        id="rec_api_profile",
        user_id=api_user.id,
        height_cm=180.0,
        weight_kg=75.0,
        activity_level=ActivityLevel.ACTIVE,
        metabolic_rate=2200,
    )
    db.add(profile)
    db.flush()

    db.add(
        UserAllergyDB(
            id="rec_api_user_allergy",
            health_profile_id=profile.id,
            allergen_id=allergen.id,
            severity=AllergySeverity.MODERATE,
        )
    )
    db.add(
        DietaryPreferenceDB(
            id="rec_api_preference",
            health_profile_id=profile.id,
            preference_type=PreferenceType.DIET,
            preference_name="Vegan",
            is_strict=True,
        )
    )
    db.commit()
    yield api_user


@pytest.fixture
def api_menu_items(db: Session) -> Iterator[list[MenuItem]]:
    """Provision a sample restaurant menu for recommendation tests."""
    restaurant = Restaurant(
        id="rec_api_restaurant",
        name="API Test Restaurant",
        cuisine="Mixed",
        is_active=True,
    )
    db.add(restaurant)
    db.flush()

    items = [
        MenuItem(
            id="rec_api_item_light",
            restaurant_id=restaurant.id,
            name="Light Salad",
            description="Fresh garden salad",
            calories=250.0,
            price=10.99,
        ),
        MenuItem(
            id="rec_api_item_protein",
            restaurant_id=restaurant.id,
            name="Protein Bowl",
            description="High protein bowl",
            calories=500.0,
            price=14.99,
        ),
        MenuItem(
            id="rec_api_item_heavy",
            restaurant_id=restaurant.id,
            name="Heavy Meal",
            description="Large calorie meal",
            calories=1000.0,
            price=19.99,
        ),
    ]
    db.add_all(items)
    db.commit()
    yield items


def test_recommend_meal_api_success(client, api_user, api_menu_items):
    """Ensure the endpoint returns results for an authenticated request."""
    response = client.post(
        "/api/recommend/meal",
        headers=_auth_headers(api_user),
        json={},
    )

    assert response.status_code == 200
    payload = response.json()
    assert "items" in payload
    assert len(payload["items"]) > 0


def test_recommend_meal_api_with_health_profile(
    client, api_user_with_profile, api_menu_items
):
    """Verify recommendations remain sorted when user health context is present."""
    response = client.post(
        "/api/recommend/meal",
        headers=_auth_headers(api_user_with_profile),
        json={},
    )

    assert response.status_code == 200
    items = response.json()["items"]
    assert items
    assert items == sorted(items, key=lambda item: item["score"], reverse=True)


def test_recommend_meal_api_price_filter(client, api_user, api_menu_items):
    """Ensure price filters exclude higher-cost items when using the baseline mode."""
    response = client.post(
        "/api/recommend/meal",
        headers=_auth_headers(api_user),
        json={"mode": "baseline", "filters": {"price_range": "$"}},
    )

    assert response.status_code == 200
    assert response.json()["items"] == []


def test_recommend_meal_api_cuisine_filter(client, api_user, api_menu_items):
    """Confirm cuisine filters keep relevant results."""
    response = client.post(
        "/api/recommend/meal",
        headers=_auth_headers(api_user),
        json={"filters": {"cuisine": ["mixed"]}},
    )

    assert response.status_code == 200
    items = response.json()["items"]
    assert items
    assert all(isinstance(item["explanation"], str) for item in items)
