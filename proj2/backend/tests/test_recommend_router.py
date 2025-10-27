"""Unit tests for meal recommendation API router."""

import pytest
from sqlalchemy.orm import Session

from src.eatsential.models.models import (
    ActivityLevel,
    AllergenDB,
    AllergySeverity,
    DietaryPreferenceDB,
    HealthProfileDB,
    PreferenceType,
    UserAllergyDB,
    UserDB,
)
from src.eatsential.models.restaurant import MenuItem, Restaurant


@pytest.fixture
def test_user_rec_api(db: Session) -> UserDB:
    """Create a test user for API tests."""
    user = UserDB(
        id="test_user_api_rec",
        email="test_api_rec@example.com",
        username="testuser_api_rec",
        password_hash="hashed_password",
        email_verified=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def test_user_with_profile_api(db: Session, test_user_rec_api: UserDB):
    """Create test user with health profile for API tests."""
    # Create allergen
    allergen = AllergenDB(
        id="allergen_gluten_api",
        name="Gluten",
        category="Grains",
        description="Gluten allergen",
    )
    db.add(allergen)
    db.flush()

    # Create health profile
    health_profile = HealthProfileDB(
        id="health_profile_api",
        user_id=test_user_rec_api.id,
        height_cm=180.0,
        weight_kg=75.0,
        activity_level=ActivityLevel.ACTIVE,
        metabolic_rate=2200,
    )
    db.add(health_profile)
    db.flush()

    # Add allergy
    allergy = UserAllergyDB(
        id="allergy_api",
        health_profile_id=health_profile.id,
        allergen_id=allergen.id,
        severity=AllergySeverity.MODERATE,
    )
    db.add(allergy)

    # Add dietary preference
    preference = DietaryPreferenceDB(
        id="pref_api",
        health_profile_id=health_profile.id,
        preference_type=PreferenceType.DIET,
        preference_name="Vegan",
        is_strict=True,
    )
    db.add(preference)

    db.commit()
    return test_user_rec_api, health_profile


@pytest.fixture
def test_menu_items_api(db: Session):
    """Create test restaurants and menu items for API tests."""
    # Create restaurants
    restaurant = Restaurant(
        id="rest_api_healthy",
        name="API Test Restaurant",
        cuisine="Mixed",
        is_active=True,
    )
    db.add(restaurant)
    db.flush()

    # Add menu items
    items = [
        MenuItem(
            id="item_api_1",
            restaurant_id="rest_api_healthy",
            name="Light Salad",
            description="Fresh garden salad",
            calories=250.0,
            price=10.99,
        ),
        MenuItem(
            id="item_api_2",
            restaurant_id="rest_api_healthy",
            name="Protein Bowl",
            description="High protein bowl",
            calories=500.0,
            price=14.99,
        ),
        MenuItem(
            id="item_api_3",
            restaurant_id="rest_api_healthy",
            name="Heavy Meal",
            description="Large calorie meal",
            calories=1000.0,
            price=19.99,
        ),
    ]
    for item in items:
        db.add(item)

    db.commit()
    return items


def test_recommend_meal_api_success(
    client, test_user_rec_api, test_menu_items_api
):
    """Test successful meal recommendation API request."""
    response = client.post(
        "/api/recommend/meal",
        json={"user_id": test_user_rec_api.id},
    )

    assert response.status_code == 200
    data = response.json()

    assert "user_id" in data
    assert data["user_id"] == test_user_rec_api.id
    assert "recommendations" in data
    assert isinstance(data["recommendations"], list)
    assert len(data["recommendations"]) > 0

    # Verify recommendation structure
    first_rec = data["recommendations"][0]
    assert "menu_item_id" in first_rec
    assert "score" in first_rec
    assert "explanation" in first_rec
    assert isinstance(first_rec["score"], float)
    assert 0 <= first_rec["score"] <= 1
    assert isinstance(first_rec["explanation"], str)
    assert len(first_rec["explanation"]) > 0


def test_recommend_meal_api_with_health_profile(
    client, test_user_with_profile_api, test_menu_items_api
):
    """Test meal recommendation for user with health profile."""
    test_user, _ = test_user_with_profile_api
    response = client.post(
        "/api/recommend/meal",
        json={"user_id": test_user.id},
    )

    assert response.status_code == 200
    data = response.json()

    assert data["user_id"] == test_user.id
    assert len(data["recommendations"]) > 0

    # Recommendations should be sorted by score
    scores = [rec["score"] for rec in data["recommendations"]]
    assert scores == sorted(scores, reverse=True)


def test_recommend_meal_api_with_constraints(
    client, test_user_rec_api, test_menu_items_api
):
    """Test meal recommendation with constraints."""
    response = client.post(
        "/api/recommend/meal",
        json={
            "user_id": test_user_rec_api.id,
            "constraints": {"max_calories": 600, "max_price": 15.00},
        },
    )

    assert response.status_code == 200
    data = response.json()

    assert len(data["recommendations"]) > 0
    # Should exclude the heavy meal with 1000 calories
    menu_item_ids = [rec["menu_item_id"] for rec in data["recommendations"]]
    assert "item_api_3" not in menu_item_ids


def test_recommend_meal_api_user_not_found(client, test_menu_items_api):
    """Test recommendation request with non-existent user."""
    response = client.post(
        "/api/recommend/meal",
        json={"user_id": "nonexistent_user"},
    )

    assert response.status_code == 404
    assert "User not found" in response.json()["detail"]


def test_recommend_meal_api_empty_constraints(
    client, test_user_rec_api, test_menu_items_api
):
    """Test recommendation with empty constraints object."""
    response = client.post(
        "/api/recommend/meal",
        json={"user_id": test_user_rec_api.id, "constraints": {}},
    )

    assert response.status_code == 200
    data = response.json()
    assert len(data["recommendations"]) > 0


def test_recommend_meal_api_no_constraints(
    client, test_user_rec_api, test_menu_items_api
):
    """Test recommendation without constraints field."""
    response = client.post(
        "/api/recommend/meal",
        json={"user_id": test_user_rec_api.id},
    )

    assert response.status_code == 200
    data = response.json()
    assert len(data["recommendations"]) > 0


def test_recommend_meal_api_calorie_constraint_only(
    client, test_user_rec_api, test_menu_items_api
):
    """Test recommendation with only calorie constraint."""
    response = client.post(
        "/api/recommend/meal",
        json={
            "user_id": test_user_rec_api.id,
            "constraints": {"max_calories": 400},
        },
    )

    assert response.status_code == 200
    data = response.json()
    # Should only include Light Salad (250 cal)
    assert len(data["recommendations"]) >= 1
    menu_item_ids = [rec["menu_item_id"] for rec in data["recommendations"]]
    assert "item_api_1" in menu_item_ids
    assert "item_api_2" not in menu_item_ids  # 500 cal
    assert "item_api_3" not in menu_item_ids  # 1000 cal


def test_recommend_meal_api_price_constraint_only(
    client, test_user_rec_api, test_menu_items_api
):
    """Test recommendation with only price constraint."""
    response = client.post(
        "/api/recommend/meal",
        json={
            "user_id": test_user_rec_api.id,
            "constraints": {"max_price": 12.00},
        },
    )

    assert response.status_code == 200
    data = response.json()
    # Should only include Light Salad (10.99)
    assert len(data["recommendations"]) >= 1
    menu_item_ids = [rec["menu_item_id"] for rec in data["recommendations"]]
    assert "item_api_1" in menu_item_ids
    assert "item_api_2" not in menu_item_ids  # 14.99
    assert "item_api_3" not in menu_item_ids  # 19.99


def test_recommend_meal_api_invalid_request_missing_user_id(client):
    """Test recommendation request without user_id."""
    response = client.post(
        "/api/recommend/meal",
        json={"constraints": {}},
    )

    assert response.status_code == 422  # Validation error


def test_recommend_meal_api_response_limit(
    client, db: Session, test_user_rec_api, test_menu_items_api
):
    """Test that API returns at most 10 recommendations."""
    # Add more menu items to test limit
    restaurant_id = "rest_api_healthy"
    for i in range(15):
        item = MenuItem(
            id=f"item_api_extra_{i}",
            restaurant_id=restaurant_id,
            name=f"Extra Item {i}",
            calories=300.0 + i * 10,
            price=10.0 + i,
        )
        db.add(item)
    db.commit()

    response = client.post(
        "/api/recommend/meal",
        json={"user_id": test_user_rec_api.id},
    )

    assert response.status_code == 200
    data = response.json()
    assert len(data["recommendations"]) <= 10


def test_recommend_meal_api_no_menu_items(client, test_user_rec_api):
    """Test recommendation when no menu items exist."""
    response = client.post(
        "/api/recommend/meal",
        json={"user_id": test_user_rec_api.id},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["recommendations"] == []


def test_recommend_meal_api_explanation_contains_restaurant(
    client, test_user_rec_api, test_menu_items_api
):
    """Test that explanation includes restaurant name."""
    response = client.post(
        "/api/recommend/meal",
        json={"user_id": test_user_rec_api.id},
    )

    assert response.status_code == 200
    data = response.json()
    assert len(data["recommendations"]) > 0

    # All explanations should contain restaurant name
    for rec in data["recommendations"]:
        assert "API Test Restaurant" in rec["explanation"]
