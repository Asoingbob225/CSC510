"""Shared fixtures for router API tests."""

from __future__ import annotations

import json
from collections.abc import Iterator
from typing import Any

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


class _MockLLMResponse:
    """Mock response object for LLM API calls in router tests."""

    def __init__(self, items: list[MenuItem] | list[Restaurant]) -> None:
        # Generate mock recommendations based on items
        recommendations = [
            {
                "item_id": str(item.id),
                "name": item.name,
                "score": 0.9 - (i * 0.1),
                "explanation": f"Recommended: {item.name}",
            }
            for i, item in enumerate(items[:5])
        ]
        self.text = json.dumps(recommendations)


class _MockLLMClient:
    """Mock LLM client for router tests."""

    def __init__(self) -> None:
        self.models = _MockModels()


class _MockModels:
    """Mock models interface."""

    def generate_content(
        self, *, model: str, contents: Any, config: Any = None
    ) -> _MockLLMResponse:
        # Return empty mock response - will trigger baseline fallback
        return _MockLLMResponse([])


@pytest.fixture(autouse=True)
def mock_llm_client_for_routers(monkeypatch: pytest.MonkeyPatch) -> None:
    """Automatically mock LLM client for all router tests to avoid API calls.

    This fixture runs automatically for all router tests, ensuring that:
    1. Tests don't require a real GEMINI_API_KEY
    2. Tests don't make actual API calls to Google Gemini
    3. LLM mode tests will fallback to baseline (empty LLM response)
    4. GitHub CI can run tests without API key secrets
    """
    from src.eatsential.services.engine import RecommendationService

    def mock_get_llm_client(self: RecommendationService) -> _MockLLMClient:
        return _MockLLMClient()

    monkeypatch.setattr(
        RecommendationService,
        "_get_llm_client",
        mock_get_llm_client,
    )


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
