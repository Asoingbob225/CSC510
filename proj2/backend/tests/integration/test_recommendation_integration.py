"""Integration tests for recommendation system (Issue #109)."""

import pytest
from sqlalchemy.orm import Session

from src.eatsential.models.models import UserDB
from src.eatsential.models.restaurant import MenuItem, Restaurant


@pytest.fixture
def integration_test_user(db: Session) -> UserDB:
    """Create a test user for integration tests."""
    user = UserDB(
        id="integration_rec_user",
        email="integration@recommendation.com",
        username="integrationuser",
        password_hash="hashed_password",
        email_verified=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def multiple_restaurants(db: Session):
    """Create multiple restaurants with menu items."""
    restaurants = []
    menu_items = []

    # Restaurant 1: Healthy Options
    rest1 = Restaurant(
        id="rest_healthy",
        name="Healthy Eats",
        cuisine="Healthy",
        is_active=True,
    )
    db.add(rest1)
    restaurants.append(rest1)

    # Restaurant 2: Fast Food
    rest2 = Restaurant(
        id="rest_fastfood",
        name="Quick Bites",
        cuisine="Fast Food",
        is_active=True,
    )
    db.add(rest2)
    restaurants.append(rest2)

    # Restaurant 3: Inactive (should not appear in recommendations)
    rest3 = Restaurant(
        id="rest_inactive",
        name="Closed Restaurant",
        cuisine="Various",
        is_active=False,
    )
    db.add(rest3)
    restaurants.append(rest3)

    db.flush()

    # Add menu items to each restaurant
    items_data = [
        # Healthy restaurant items
        ("item_h1", "rest_healthy", "Grilled Salmon", 450.0, 18.99),
        ("item_h2", "rest_healthy", "Quinoa Salad", 320.0, 12.50),
        ("item_h3", "rest_healthy", "Smoothie Bowl", 280.0, 9.99),
        # Fast food items
        ("item_f1", "rest_fastfood", "Burger", 650.0, 8.99),
        ("item_f2", "rest_fastfood", "Fries", 380.0, 3.99),
        ("item_f3", "rest_fastfood", "Milkshake", 520.0, 5.99),
        # Inactive restaurant item (should not appear)
        ("item_i1", "rest_inactive", "Mystery Meal", 400.0, 10.00),
    ]

    for item_id, rest_id, name, calories, price in items_data:
        item = MenuItem(
            id=item_id,
            restaurant_id=rest_id,
            name=name,
            calories=calories,
            price=price,
        )
        db.add(item)
        menu_items.append(item)

    db.commit()
    return restaurants, menu_items


class TestEndToEndRecommendationFlow:
    """Test complete recommendation flow from request to response."""

    def test_full_recommendation_flow(
        self, client, integration_test_user, multiple_restaurants
    ):
        """Test complete end-to-end recommendation flow."""
        response = client.post(
            "/api/recommend/meal",
            json={"user_id": integration_test_user.id, "constraints": {}},
        )

        assert response.status_code == 200
        data = response.json()

        # Verify response structure
        assert "user_id" in data
        assert data["user_id"] == integration_test_user.id
        assert "recommendations" in data
        assert isinstance(data["recommendations"], list)

        # Should have recommendations
        assert len(data["recommendations"]) > 0

        # Each recommendation should have required fields
        for rec in data["recommendations"]:
            assert "menu_item_id" in rec
            assert "score" in rec
            assert "explanation" in rec
            assert isinstance(rec["score"], (int, float))
            assert isinstance(rec["explanation"], str)
            assert len(rec["explanation"]) > 0

    def test_inactive_restaurants_excluded(
        self, client, integration_test_user, multiple_restaurants
    ):
        """Test that items from inactive restaurants are excluded."""
        response = client.post(
            "/api/recommend/meal",
            json={"user_id": integration_test_user.id, "constraints": {}},
        )

        assert response.status_code == 200
        recommendations = response.json()["recommendations"]

        # Should not contain items from inactive restaurant
        item_ids = [rec["menu_item_id"] for rec in recommendations]
        assert "item_i1" not in item_ids

        # Should contain items from active restaurants
        active_items = ["item_h1", "item_h2", "item_h3", "item_f1", "item_f2", "item_f3"]
        for item_id in active_items:
            assert item_id in item_ids

    def test_top_10_sorting_accuracy(
        self, client, db: Session, integration_test_user, multiple_restaurants
    ):
        """Test that top 10 items are correctly sorted by score."""
        # Add more items to test the top-10 limit
        restaurant_id = "rest_healthy"
        for i in range(15):
            item = MenuItem(
                id=f"extra_item_{i}",
                restaurant_id=restaurant_id,
                name=f"Extra Item {i}",
                calories=300.0 + i * 10,
                price=10.0 + i,
            )
            db.add(item)
        db.commit()

        response = client.post(
            "/api/recommend/meal",
            json={"user_id": integration_test_user.id, "constraints": {}},
        )

        assert response.status_code == 200
        recommendations = response.json()["recommendations"]

        # Should be limited to 10 items
        assert len(recommendations) == 10

        # Should be sorted by score in descending order
        scores = [rec["score"] for rec in recommendations]
        assert scores == sorted(scores, reverse=True)

        # All items should have score of 1.0 (complete nutrition info)
        for rec in recommendations:
            assert rec["score"] == pytest.approx(1.0)


class TestUserContextRetrieval:
    """Test user context retrieval for recommendations."""

    def test_user_verification(self, client, multiple_restaurants):
        """Test that user existence is verified before recommendations."""
        response = client.post(
            "/api/recommend/meal",
            json={"user_id": "nonexistent_user_12345", "constraints": {}},
        )

        assert response.status_code == 404
        assert "User not found" in response.json()["detail"]

    def test_correct_user_context(
        self, client, db: Session, integration_test_user, multiple_restaurants
    ):
        """Test that recommendations are generated for correct user."""
        # Create another user
        user2 = UserDB(
            id="integration_rec_user2",
            email="user2@test.com",
            username="testuser2",
            password_hash="hashed",
            email_verified=True,
        )
        db.add(user2)
        db.commit()

        # Request for first user
        response1 = client.post(
            "/api/recommend/meal",
            json={"user_id": integration_test_user.id, "constraints": {}},
        )
        # Request for second user
        response2 = client.post(
            "/api/recommend/meal",
            json={"user_id": user2.id, "constraints": {}},
        )

        assert response1.status_code == 200
        assert response2.status_code == 200

        # Both should return user-specific IDs
        assert response1.json()["user_id"] == integration_test_user.id
        assert response2.json()["user_id"] == user2.id


class TestPerformance:
    """Test recommendation system performance."""

    def test_response_time_with_many_items(
        self, client, db: Session, integration_test_user, multiple_restaurants
    ):
        """Test response time with large number of menu items."""
        import time

        # Add 100 menu items
        restaurant_id = "rest_healthy"
        for i in range(100):
            item = MenuItem(
                id=f"perf_item_{i}",
                restaurant_id=restaurant_id,
                name=f"Performance Test Item {i}",
                calories=300.0 + i,
                price=10.0 + (i * 0.5),
            )
            db.add(item)
        db.commit()

        start_time = time.time()
        response = client.post(
            "/api/recommend/meal",
            json={"user_id": integration_test_user.id, "constraints": {}},
        )
        end_time = time.time()

        assert response.status_code == 200
        response_time = end_time - start_time

        # Should respond within 5 seconds as per requirements
        assert response_time < 5.0, f"Response time {response_time}s exceeds 5s limit"

        # Should still return top 10
        recommendations = response.json()["recommendations"]
        assert len(recommendations) == 10

    def test_consistency_across_concurrent_requests(
        self, client, integration_test_user, multiple_restaurants
    ):
        """Test that multiple concurrent requests produce consistent results."""
        # Make multiple requests
        responses = []
        for _ in range(5):
            response = client.post(
                "/api/recommend/meal",
                json={"user_id": integration_test_user.id, "constraints": {}},
            )
            responses.append(response)

        # All should succeed
        for response in responses:
            assert response.status_code == 200

        # Extract recommendation lists
        rec_lists = [r.json()["recommendations"] for r in responses]

        # All should have same length
        lengths = [len(rec_list) for rec_list in rec_lists]
        assert all(length == lengths[0] for length in lengths)

        # Item IDs should be in same order (deterministic sorting)
        first_ids = [rec["menu_item_id"] for rec in rec_lists[0]]
        for rec_list in rec_lists[1:]:
            ids = [rec["menu_item_id"] for rec in rec_list]
            assert ids == first_ids


class TestEmptyAndEdgeCases:
    """Test edge cases and empty data scenarios."""

    def test_empty_food_database(self, client, db: Session, integration_test_user):
        """Test recommendation with no menu items available."""
        # Create a restaurant with no menu items
        restaurant = Restaurant(
            id="empty_rest",
            name="Empty Restaurant",
            cuisine="None",
            is_active=True,
        )
        db.add(restaurant)
        db.commit()

        response = client.post(
            "/api/recommend/meal",
            json={"user_id": integration_test_user.id, "constraints": {}},
        )

        assert response.status_code == 200
        data = response.json()

        # Should return empty recommendations list
        assert data["user_id"] == integration_test_user.id
        assert data["recommendations"] == []

    def test_all_restaurants_inactive(
        self, client, db: Session, integration_test_user
    ):
        """Test behavior when all restaurants are inactive."""
        # Create inactive restaurant with items
        restaurant = Restaurant(
            id="inactive_rest",
            name="Inactive Restaurant",
            cuisine="Various",
            is_active=False,
        )
        db.add(restaurant)
        db.flush()

        item = MenuItem(
            id="inactive_item",
            restaurant_id="inactive_rest",
            name="Inactive Item",
            calories=400.0,
            price=10.0,
        )
        db.add(item)
        db.commit()

        response = client.post(
            "/api/recommend/meal",
            json={"user_id": integration_test_user.id, "constraints": {}},
        )

        assert response.status_code == 200
        recommendations = response.json()["recommendations"]

        # Should return empty list (no active restaurants)
        assert recommendations == []

    def test_single_item_recommendation(
        self, client, db: Session, integration_test_user
    ):
        """Test recommendation with only one menu item."""
        restaurant = Restaurant(
            id="single_item_rest",
            name="Single Item Restaurant",
            cuisine="Minimal",
            is_active=True,
        )
        db.add(restaurant)
        db.flush()

        item = MenuItem(
            id="only_item",
            restaurant_id="single_item_rest",
            name="Only Item",
            calories=500.0,
            price=12.0,
        )
        db.add(item)
        db.commit()

        response = client.post(
            "/api/recommend/meal",
            json={"user_id": integration_test_user.id, "constraints": {}},
        )

        assert response.status_code == 200
        recommendations = response.json()["recommendations"]

        # Should return the single item
        assert len(recommendations) == 1
        assert recommendations[0]["menu_item_id"] == "only_item"
        assert recommendations[0]["score"] == pytest.approx(1.0)
