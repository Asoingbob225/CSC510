"""Unit tests for recommendation scoring algorithm (Issue #109)."""

import pytest
from sqlalchemy.orm import Session

from src.eatsential.models.models import UserDB
from src.eatsential.models.restaurant import MenuItem, Restaurant


@pytest.fixture
def test_user(db: Session) -> UserDB:
    """Create a test user for scoring tests."""
    user = UserDB(
        id="scoring_test_user",
        email="scoring@test.com",
        username="scoringuser",
        password_hash="hashed_password",
        email_verified=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def test_restaurant(db: Session) -> Restaurant:
    """Create a test restaurant."""
    restaurant = Restaurant(
        id="scoring_rest_001",
        name="Test Restaurant",
        cuisine="Test Cuisine",
        is_active=True,
    )
    db.add(restaurant)
    db.commit()
    db.refresh(restaurant)
    return restaurant


class TestScoringAlgorithm:
    """Test scoring algorithm correctness."""

    def test_score_with_full_nutrition_info(
        self, client, db: Session, test_user, test_restaurant
    ):
        """Test scoring for items with complete nutritional information."""
        # Create item with both calories and price
        item = MenuItem(
            id="full_nutrition_item",
            restaurant_id=test_restaurant.id,
            name="Complete Info Meal",
            calories=500.0,
            price=15.99,
        )
        db.add(item)
        db.commit()

        response = client.post(
            "/api/recommend/meal",
            json={"user_id": test_user.id, "constraints": {}},
        )

        assert response.status_code == 200
        recommendations = response.json()["recommendations"]

        # Should have highest score (0.5 + 0.3 + 0.2 = 1.0)
        item_rec = next(
            (r for r in recommendations if r["menu_item_id"] == "full_nutrition_item"),
            None,
        )
        assert item_rec is not None
        assert item_rec["score"] == pytest.approx(1.0)

    def test_score_with_calories_only(
        self, client, db: Session, test_user, test_restaurant
    ):
        """Test scoring for items with calories but no price."""
        item = MenuItem(
            id="calories_only_item",
            restaurant_id=test_restaurant.id,
            name="Calories Only Meal",
            calories=450.0,
            price=None,
        )
        db.add(item)
        db.commit()

        response = client.post(
            "/api/recommend/meal",
            json={"user_id": test_user.id, "constraints": {}},
        )

        assert response.status_code == 200
        recommendations = response.json()["recommendations"]

        item_rec = next(
            (r for r in recommendations if r["menu_item_id"] == "calories_only_item"),
            None,
        )
        assert item_rec is not None
        # Should score 0.5 + 0.3 = 0.8
        assert item_rec["score"] == pytest.approx(0.8)

    def test_score_with_price_only(
        self, client, db: Session, test_user, test_restaurant
    ):
        """Test scoring for items with price but no calories."""
        item = MenuItem(
            id="price_only_item",
            restaurant_id=test_restaurant.id,
            name="Price Only Meal",
            calories=None,
            price=12.50,
        )
        db.add(item)
        db.commit()

        response = client.post(
            "/api/recommend/meal",
            json={"user_id": test_user.id, "constraints": {}},
        )

        assert response.status_code == 200
        recommendations = response.json()["recommendations"]

        item_rec = next(
            (r for r in recommendations if r["menu_item_id"] == "price_only_item"),
            None,
        )
        assert item_rec is not None
        # Should score 0.5 + 0.2 = 0.7
        assert item_rec["score"] == pytest.approx(0.7)

    def test_score_with_no_nutrition_info(
        self, client, db: Session, test_user, test_restaurant
    ):
        """Test scoring for items with no nutritional information."""
        item = MenuItem(
            id="no_info_item",
            restaurant_id=test_restaurant.id,
            name="No Info Meal",
            calories=None,
            price=None,
        )
        db.add(item)
        db.commit()

        response = client.post(
            "/api/recommend/meal",
            json={"user_id": test_user.id, "constraints": {}},
        )

        assert response.status_code == 200
        recommendations = response.json()["recommendations"]

        item_rec = next(
            (r for r in recommendations if r["menu_item_id"] == "no_info_item"),
            None,
        )
        assert item_rec is not None
        # Should have base score only (0.5)
        assert item_rec["score"] == pytest.approx(0.5)

    def test_score_comparison_ordering(
        self, client, db: Session, test_user, test_restaurant
    ):
        """Test that items are correctly ordered by score."""
        # Create items with different nutrition completeness
        items = [
            MenuItem(
                id="item_full",
                restaurant_id=test_restaurant.id,
                name="Full Info",
                calories=500.0,
                price=15.0,
            ),  # Score: 1.0
            MenuItem(
                id="item_calories",
                restaurant_id=test_restaurant.id,
                name="Calories Only",
                calories=400.0,
                price=None,
            ),  # Score: 0.8
            MenuItem(
                id="item_price",
                restaurant_id=test_restaurant.id,
                name="Price Only",
                calories=None,
                price=10.0,
            ),  # Score: 0.7
            MenuItem(
                id="item_none",
                restaurant_id=test_restaurant.id,
                name="No Info",
                calories=None,
                price=None,
            ),  # Score: 0.5
        ]
        for item in items:
            db.add(item)
        db.commit()

        response = client.post(
            "/api/recommend/meal",
            json={"user_id": test_user.id, "constraints": {}},
        )

        assert response.status_code == 200
        recommendations = response.json()["recommendations"]

        # Check scores are in descending order
        scores = [rec["score"] for rec in recommendations]
        assert scores == sorted(scores, reverse=True)

        # Verify specific ordering
        assert recommendations[0]["menu_item_id"] == "item_full"
        assert recommendations[0]["score"] == pytest.approx(1.0)

    def test_score_consistency(
        self, client, db: Session, test_user, test_restaurant
    ):
        """Test that scoring is consistent across multiple requests."""
        item = MenuItem(
            id="consistent_item",
            restaurant_id=test_restaurant.id,
            name="Consistent Meal",
            calories=550.0,
            price=14.99,
        )
        db.add(item)
        db.commit()

        # Make multiple requests
        scores = []
        for _ in range(3):
            response = client.post(
                "/api/recommend/meal",
                json={"user_id": test_user.id, "constraints": {}},
            )
            recommendations = response.json()["recommendations"]
            item_rec = next(
                (r for r in recommendations if r["menu_item_id"] == "consistent_item"),
                None,
            )
            scores.append(item_rec["score"])

        # All scores should be identical
        assert all(score == scores[0] for score in scores)
        assert scores[0] == pytest.approx(1.0)


class TestExplanationGeneration:
    """Test recommendation explanation text generation."""

    def test_explanation_includes_restaurant_name(
        self, client, db: Session, test_user, test_restaurant
    ):
        """Test that explanation includes restaurant name."""
        item = MenuItem(
            id="expl_item_1",
            restaurant_id=test_restaurant.id,
            name="Test Meal",
            calories=400.0,
            price=12.0,
        )
        db.add(item)
        db.commit()

        response = client.post(
            "/api/recommend/meal",
            json={"user_id": test_user.id, "constraints": {}},
        )

        recommendations = response.json()["recommendations"]
        item_rec = next(
            (r for r in recommendations if r["menu_item_id"] == "expl_item_1"),
            None,
        )
        assert item_rec is not None
        assert test_restaurant.name in item_rec["explanation"]

    def test_explanation_includes_calories_when_available(
        self, client, db: Session, test_user, test_restaurant
    ):
        """Test that explanation includes calorie information."""
        item = MenuItem(
            id="expl_item_2",
            restaurant_id=test_restaurant.id,
            name="Caloric Meal",
            calories=525.0,
            price=10.0,
        )
        db.add(item)
        db.commit()

        response = client.post(
            "/api/recommend/meal",
            json={"user_id": test_user.id, "constraints": {}},
        )

        recommendations = response.json()["recommendations"]
        item_rec = next(
            (r for r in recommendations if r["menu_item_id"] == "expl_item_2"),
            None,
        )
        assert item_rec is not None
        assert "525" in item_rec["explanation"] or "cal" in item_rec["explanation"]

    def test_explanation_format_without_calories(
        self, client, db: Session, test_user, test_restaurant
    ):
        """Test explanation format when calories are not available."""
        item = MenuItem(
            id="expl_item_3",
            restaurant_id=test_restaurant.id,
            name="No Calorie Meal",
            calories=None,
            price=8.0,
        )
        db.add(item)
        db.commit()

        response = client.post(
            "/api/recommend/meal",
            json={"user_id": test_user.id, "constraints": {}},
        )

        recommendations = response.json()["recommendations"]
        item_rec = next(
            (r for r in recommendations if r["menu_item_id"] == "expl_item_3"),
            None,
        )
        assert item_rec is not None
        # Should still have restaurant name
        assert test_restaurant.name in item_rec["explanation"]
        # Should not contain "cal"
        assert "cal" not in item_rec["explanation"].lower()


class TestEdgeCases:
    """Test edge cases and boundary conditions."""

    def test_zero_calorie_item(self, client, db: Session, test_user, test_restaurant):
        """Test handling of items with zero calories."""
        item = MenuItem(
            id="zero_cal_item",
            restaurant_id=test_restaurant.id,
            name="Zero Calorie Drink",
            calories=0.0,
            price=2.0,
        )
        db.add(item)
        db.commit()

        response = client.post(
            "/api/recommend/meal",
            json={"user_id": test_user.id, "constraints": {}},
        )

        assert response.status_code == 200
        recommendations = response.json()["recommendations"]
        item_rec = next(
            (r for r in recommendations if r["menu_item_id"] == "zero_cal_item"),
            None,
        )
        assert item_rec is not None
        # Zero is still a valid calorie value, should get calorie bonus
        assert item_rec["score"] == pytest.approx(1.0)

    def test_very_high_calorie_item(
        self, client, db: Session, test_user, test_restaurant
    ):
        """Test handling of items with very high calories."""
        item = MenuItem(
            id="high_cal_item",
            restaurant_id=test_restaurant.id,
            name="Super High Calorie Meal",
            calories=9999.0,
            price=50.0,
        )
        db.add(item)
        db.commit()

        response = client.post(
            "/api/recommend/meal",
            json={"user_id": test_user.id, "constraints": {}},
        )

        assert response.status_code == 200
        recommendations = response.json()["recommendations"]
        item_rec = next(
            (r for r in recommendations if r["menu_item_id"] == "high_cal_item"),
            None,
        )
        assert item_rec is not None
        # Should still score normally based on data completeness
        assert item_rec["score"] == pytest.approx(1.0)

    def test_negative_price_handling(
        self, client, db: Session, test_user, test_restaurant
    ):
        """Test system behavior with unusual price values."""
        # Note: This tests current behavior, not ideal behavior
        item = MenuItem(
            id="negative_price_item",
            restaurant_id=test_restaurant.id,
            name="Negative Price Item",
            calories=300.0,
            price=-5.0,
        )
        db.add(item)
        db.commit()

        response = client.post(
            "/api/recommend/meal",
            json={"user_id": test_user.id, "constraints": {}},
        )

        assert response.status_code == 200
        # System should handle gracefully without crashing
        recommendations = response.json()["recommendations"]
        assert isinstance(recommendations, list)

    def test_empty_restaurant_name(
        self, client, db: Session, test_user, test_restaurant
    ):
        """Test handling of restaurants with empty names."""
        restaurant = Restaurant(
            id="empty_name_rest",
            name="",
            cuisine="Unknown",
            is_active=True,
        )
        db.add(restaurant)
        db.flush()

        item = MenuItem(
            id="empty_rest_item",
            restaurant_id="empty_name_rest",
            name="Meal from No-Name Restaurant",
            calories=400.0,
            price=10.0,
        )
        db.add(item)
        db.commit()

        response = client.post(
            "/api/recommend/meal",
            json={"user_id": test_user.id, "constraints": {}},
        )

        assert response.status_code == 200
        # Should not crash, explanation should still be generated
        recommendations = response.json()["recommendations"]
        assert len(recommendations) > 0
