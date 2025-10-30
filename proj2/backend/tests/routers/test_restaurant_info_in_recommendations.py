"""Tests for restaurant info in recommendations (Issue #83)."""

import pytest
from sqlalchemy.orm import Session

from src.eatsential.models.models import MenuItem, Restaurant, UserDB


@pytest.fixture
def test_user(db: Session) -> UserDB:
    """Create a test user for recommendation tests."""
    user = UserDB(
        id="restaurant_info_test_user",
        email="test@restaurant.com",
        username="testuser",
        password_hash="hashed_password",
        email_verified=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def test_restaurant_with_details(db: Session) -> tuple[Restaurant, MenuItem]:
    """Create a test restaurant with detailed information."""
    restaurant = Restaurant(
        id="detailed_rest_001",
        name="Gourmet Bistro",
        cuisine="French",
        is_active=True,
    )
    db.add(restaurant)
    db.flush()

    menu_item = MenuItem(
        id="detailed_item_001",
        restaurant_id="detailed_rest_001",
        name="Salmon with Vegetables",
        description="Fresh Atlantic salmon with seasonal vegetables",
        calories=450.0,
        price=24.99,
    )
    db.add(menu_item)
    db.commit()
    db.refresh(restaurant)
    db.refresh(menu_item)
    return restaurant, menu_item


def test_recommendation_includes_restaurant_info(
    client, test_user, test_restaurant_with_details
):
    """Test that recommendations include restaurant information."""
    restaurant, menu_item = test_restaurant_with_details

    response = client.post(
        "/api/recommend/meal",
        json={"user_id": test_user.id, "constraints": {}},
    )

    assert response.status_code == 200
    data = response.json()

    assert "recommendations" in data
    assert len(data["recommendations"]) > 0

    # Check first recommendation has restaurant info
    recommendation = data["recommendations"][0]
    assert "restaurant" in recommendation
    assert recommendation["restaurant"] is not None

    # Verify restaurant fields
    restaurant_info = recommendation["restaurant"]
    assert restaurant_info["id"] == restaurant.id
    assert restaurant_info["name"] == restaurant.name
    assert restaurant_info["cuisine"] == restaurant.cuisine
    assert restaurant_info["is_active"] == restaurant.is_active


def test_recommendation_includes_menu_item_info(
    client, test_user, test_restaurant_with_details
):
    """Test that recommendations include menu item information."""
    restaurant, menu_item = test_restaurant_with_details

    response = client.post(
        "/api/recommend/meal",
        json={"user_id": test_user.id, "constraints": {}},
    )

    assert response.status_code == 200
    data = response.json()

    recommendation = data["recommendations"][0]
    assert "menu_item" in recommendation
    assert recommendation["menu_item"] is not None

    # Verify menu item fields
    item_info = recommendation["menu_item"]
    assert item_info["id"] == menu_item.id
    assert item_info["name"] == menu_item.name
    assert item_info["description"] == menu_item.description
    assert float(item_info["price"]) == float(menu_item.price)
    assert float(item_info["calories"]) == float(menu_item.calories)


def test_recommendation_includes_nutritional_info(
    client, test_user, test_restaurant_with_details
):
    """Test that nutritional information is properly included."""
    _, menu_item = test_restaurant_with_details

    response = client.post(
        "/api/recommend/meal",
        json={"user_id": test_user.id, "constraints": {}},
    )

    assert response.status_code == 200
    data = response.json()

    recommendation = data["recommendations"][0]
    item_info = recommendation["menu_item"]

    # Check nutritional values are numbers
    assert isinstance(item_info["calories"], (int, float))

    # Check values match expected
    assert item_info["calories"] == 450.0


def test_recommendation_with_partial_restaurant_info(client, db: Session, test_user):
    """Test recommendations with restaurants that have partial information."""
    # Create restaurant with minimal info
    restaurant = Restaurant(
        id="minimal_rest_001",
        name="Simple Cafe",
        cuisine=None,  # No cuisine specified
        is_active=True,
    )
    db.add(restaurant)
    db.flush()

    menu_item = MenuItem(
        id="minimal_item_001",
        restaurant_id="minimal_rest_001",
        name="Simple Sandwich",
        description=None,
        calories=300.0,
        price=8.99,
    )
    db.add(menu_item)
    db.commit()

    response = client.post(
        "/api/recommend/meal",
        json={"user_id": test_user.id, "constraints": {}},
    )

    assert response.status_code == 200
    data = response.json()

    # Should still work with partial data
    recommendation = data["recommendations"][0]
    assert recommendation["restaurant"] is not None
    assert recommendation["restaurant"]["name"] == "Simple Cafe"
    assert recommendation["restaurant"]["cuisine"] is None


def test_recommendation_response_structure(
    client, test_user, test_restaurant_with_details
):
    """Test the complete recommendation response structure."""
    response = client.post(
        "/api/recommend/meal",
        json={"user_id": test_user.id, "constraints": {}},
    )

    assert response.status_code == 200
    data = response.json()

    # Check top-level structure
    assert "user_id" in data
    assert "recommendations" in data
    assert isinstance(data["recommendations"], list)

    # Check recommendation structure
    recommendation = data["recommendations"][0]
    assert "menu_item_id" in recommendation
    assert "score" in recommendation
    assert "explanation" in recommendation
    assert "menu_item" in recommendation
    assert "restaurant" in recommendation

    # All required fields should be present
    assert isinstance(recommendation["menu_item_id"], str)
    assert isinstance(recommendation["score"], (int, float))
    assert isinstance(recommendation["explanation"], str)
    assert isinstance(recommendation["menu_item"], dict)
    assert isinstance(recommendation["restaurant"], dict)
