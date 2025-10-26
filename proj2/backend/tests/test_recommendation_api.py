"""Unit tests for Recommendation API (BE-S2-005)."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from src.eatsential.db.database import Base, get_db
from src.eatsential.index import app
from src.eatsential.models.models import UserDB
from src.eatsential.models.restaurant import MenuItem, Restaurant

# Test database setup
TEST_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    """Override DB dependency for testing."""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_database():
    """Create tables and seed test data before each test."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()

    # Create test user
    test_user = UserDB(
        id="test_user_123",
        username="testuser",
        email="test@example.com",
        password_hash="hashed_password",
    )
    db.add(test_user)

    # Create test restaurant and menu items
    test_restaurant = Restaurant(
        id="rest_001",
        name="Healthy Eats",
        cuisine="Healthy",
        is_active=True,
    )
    db.add(test_restaurant)
    db.flush()

    # Add menu items with varying nutritional info
    menu_items = [
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
    for item in menu_items:
        db.add(item)

    db.commit()
    db.close()

    yield

    Base.metadata.drop_all(bind=engine)


def test_recommend_meal_happy_path():
    """Test successful meal recommendation request."""
    response = client.post(
        "/api/recommend/meal",
        json={"user_id": "test_user_123", "constraints": {}},
    )

    assert response.status_code == 200
    data = response.json()

    assert "user_id" in data
    assert data["user_id"] == "test_user_123"
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


def test_recommend_meal_user_not_found():
    """Test recommendation request with non-existent user."""
    response = client.post(
        "/api/recommend/meal",
        json={"user_id": "nonexistent_user", "constraints": {}},
    )

    assert response.status_code == 404
    assert "User not found" in response.json()["detail"]


def test_recommend_meal_scoring():
    """Test that items with more nutritional info score higher."""
    response = client.post(
        "/api/recommend/meal",
        json={"user_id": "test_user_123", "constraints": {}},
    )

    assert response.status_code == 200
    recommendations = response.json()["recommendations"]

    # Items with both calories and price should score highest (1.0)
    # Items with only calories should score 0.8
    # Items with neither should score 0.5
    scores = [rec["score"] for rec in recommendations]

    # First two items have both calories and price, should score 1.0
    assert scores[0] == 1.0 or scores[0] == pytest.approx(1.0)

    # Mystery dish with no nutrition info should score lowest
    mystery_item = next(
        (rec for rec in recommendations if rec["menu_item_id"] == "item_003"), None
    )
    if mystery_item:
        assert mystery_item["score"] == 0.5


def test_recommend_meal_empty_constraints():
    """Test recommendation with empty constraints."""
    response = client.post(
        "/api/recommend/meal",
        json={"user_id": "test_user_123"},
    )

    assert response.status_code == 200
    data = response.json()
    assert len(data["recommendations"]) > 0


def test_recommend_meal_limit_top_10():
    """Test that recommendations are limited to top 10."""
    # Add more menu items to test limit
    db = TestingSessionLocal()
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
    db.close()

    response = client.post(
        "/api/recommend/meal",
        json={"user_id": "test_user_123", "constraints": {}},
    )

    assert response.status_code == 200
    recommendations = response.json()["recommendations"]
    assert len(recommendations) <= 10
