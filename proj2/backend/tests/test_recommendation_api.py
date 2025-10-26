"""Unit tests for Recommendation API (BE-S2-005)."""

import pytest
from sqlalchemy.orm import Session

from src.eatsential.models.models import UserDB
from src.eatsential.models.restaurant import MenuItem, Restaurant


@pytest.fixture
def test_user(db: Session) -> UserDB:
    """Create a test user for recommendation tests."""
    user = UserDB(
        id="test_user_123",
        email="test@example.com",
        username="testuser",
        password_hash="hashed_password",
        email_verified=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def test_restaurant_data(db: Session, test_user: UserDB):
    """Create test restaurant and menu items."""
    # Create test restaurant
    restaurant = Restaurant(
        id="rest_001",
        name="Healthy Eats",
        cuisine="Healthy",
        is_active=True,
    )
    db.add(restaurant)
    db.flush()

    # Add menu items with varying nutritional info
    items = [
        MenuItem(
            id="item_001",
            restaurant_id="rest_001",
            name="Grilled Chicken Salad",
            calories=350.0,
            price=12.99,
        ),
        MenuItem(
            id="item_002",
            restaurant_id="rest_001",
            name="Quinoa Bowl",
            calories=420.0,
            price=10.50,
        ),
        MenuItem(
            id="item_003",
            restaurant_id="rest_001",
            name="Mystery Dish",
            calories=None,
            price=None,
        ),
    ]
    for item in items:
        db.add(item)

    db.commit()
    return restaurant, items


def test_recommend_meal_happy_path(client, test_user, test_restaurant_data):
    """Test successful meal recommendation request."""
    response = client.post(
        "/api/recommend/meal",
        json={"user_id": test_user.id, "constraints": {}},
    )

    assert response.status_code == 200
    data = response.json()

    assert "user_id" in data
    assert data["user_id"] == test_user.id
    assert "recommendations" in data
    assert isinstance(data["recommendations"], list)
    assert len(data["recommendations"]) > 0

    # Check first recommendation structure
    first_rec = data["recommendations"][0]
    assert "menu_item_id" in first_rec
    assert "score" in first_rec
    assert "explanation" in first_rec
    assert isinstance(first_rec["score"], float)
    assert isinstance(first_rec["explanation"], str)
    assert len(first_rec["explanation"]) > 0


def test_recommend_meal_user_not_found(client):
    """Test recommendation request with non-existent user."""
    response = client.post(
        "/api/recommend/meal",
        json={"user_id": "nonexistent_user", "constraints": {}},
    )

    assert response.status_code == 404
    assert "User not found" in response.json()["detail"]


def test_recommend_meal_scoring(client, test_user, test_restaurant_data):
    """Test that items with more nutritional info score higher."""
    response = client.post(
        "/api/recommend/meal",
        json={"user_id": test_user.id, "constraints": {}},
    )

    assert response.status_code == 200
    recommendations = response.json()["recommendations"]

    # Items with both calories and price should score highest (1.0)
    # Items with only calories should score 0.8
    # Items with neither should score 0.5
    scores = [rec["score"] for rec in recommendations]

    # First two items have both calories and price, should score 1.0
    assert scores[0] == pytest.approx(1.0)

    # Mystery dish with no nutrition info should score lowest
    mystery_item = next(
        (rec for rec in recommendations if rec["menu_item_id"] == "item_003"), None
    )
    if mystery_item:
        assert mystery_item["score"] == 0.5


def test_recommend_meal_empty_constraints(client, test_user, test_restaurant_data):
    """Test recommendation with empty constraints."""
    response = client.post(
        "/api/recommend/meal",
        json={"user_id": test_user.id},
    )

    assert response.status_code == 200
    data = response.json()
    assert len(data["recommendations"]) > 0


def test_recommend_meal_limit_top_10(client, db: Session, test_user, test_restaurant_data):
    """Test that recommendations are limited to top 10."""
    # Add more menu items to test limit
    for i in range(15):
        item = MenuItem(
            id=f"extra_item_{i}",
            restaurant_id="rest_001",
            name=f"Extra Item {i}",
            calories=300.0 + i * 10,
            price=8.0 + i,
        )
        db.add(item)
    db.commit()

    response = client.post(
        "/api/recommend/meal",
        json={"user_id": test_user.id, "constraints": {}},
    )

    assert response.status_code == 200
    recommendations = response.json()["recommendations"]
    assert len(recommendations) <= 10
