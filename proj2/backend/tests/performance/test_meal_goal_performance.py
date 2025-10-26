"""Performance tests for Meal and Goal APIs (Issue #103)."""

import time
from datetime import date, datetime, timedelta

from fastapi import status
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from src.eatsential.models.models import GoalType, MealType


class TestPerformance:
    """Performance tests to ensure API response times meet requirements."""

    def test_create_meal_performance(
        self, client: TestClient, auth_headers: dict, db: Session
    ):
        """Test that meal creation completes within 2 seconds."""
        meal_data = {
            "meal_type": MealType.LUNCH.value,
            "meal_time": datetime.now().isoformat(),
            "food_items": [
                {
                    "food_name": "Performance test meal",
                    "portion_size": 1.0,
                    "portion_unit": "serving",
                    "calories": 500,
                    "protein_g": 25.0,
                    "carbs_g": 60.0,
                    "fat_g": 15.0,
                }
            ],
        }

        start_time = time.time()
        response = client.post("/api/meals", json=meal_data, headers=auth_headers)
        end_time = time.time()

        assert response.status_code == status.HTTP_201_CREATED
        response_time = end_time - start_time
        assert response_time < 2.0, f"Response time {response_time}s exceeds 2s limit"

    def test_get_meals_list_performance(
        self, client: TestClient, auth_headers: dict, db: Session
    ):
        """Test that fetching meal list completes within 2 seconds."""
        # Create 10 meals
        for i in range(10):
            meal_data = {
                "meal_type": MealType.SNACK.value,
                "meal_time": (datetime.now() - timedelta(hours=i)).isoformat(),
                "food_items": [
                    {
                        "food_name": f"Snack {i}",
                        "portion_size": 1.0,
                        "portion_unit": "item",
                        "calories": 100,
                    }
                ],
            }
            client.post("/api/meals", json=meal_data, headers=auth_headers)

        start_time = time.time()
        response = client.get("/api/meals", headers=auth_headers)
        end_time = time.time()

        assert response.status_code == status.HTTP_200_OK
        response_time = end_time - start_time
        assert response_time < 2.0, f"Response time {response_time}s exceeds 2s limit"

    def test_create_goal_performance(
        self, client: TestClient, auth_headers: dict, db: Session
    ):
        """Test that goal creation completes within 2 seconds."""
        today = date.today()
        goal_data = {
            "goal_type": GoalType.NUTRITION.value,
            "target_type": "daily_calories",
            "target_value": 2000.0,
            "start_date": today.isoformat(),
            "end_date": (today + timedelta(days=30)).isoformat(),
        }

        start_time = time.time()
        response = client.post("/api/goals", json=goal_data, headers=auth_headers)
        end_time = time.time()

        assert response.status_code == status.HTTP_201_CREATED
        response_time = end_time - start_time
        assert response_time < 2.0, f"Response time {response_time}s exceeds 2s limit"

    def test_goal_progress_calculation_performance(
        self, client: TestClient, auth_headers: dict, db: Session
    ):
        """Test that goal progress calculation completes within 2 seconds."""
        today = date.today()
        goal_data = {
            "goal_type": GoalType.NUTRITION.value,
            "target_type": "daily_calories",
            "target_value": 2000.0,
            "start_date": today.isoformat(),
            "end_date": (today + timedelta(days=7)).isoformat(),
        }
        goal_response = client.post("/api/goals", json=goal_data, headers=auth_headers)
        goal_id = goal_response.json()["id"]

        # Log 5 meals
        for i in range(5):
            meal_data = {
                "meal_type": MealType.SNACK.value,
                "meal_time": datetime.now().isoformat(),
                "food_items": [
                    {
                        "food_name": f"Food {i}",
                        "portion_size": 1.0,
                        "portion_unit": "serving",
                        "calories": 200,
                    }
                ],
            }
            client.post("/api/meals", json=meal_data, headers=auth_headers)

        start_time = time.time()
        response = client.get(f"/api/goals/{goal_id}/progress", headers=auth_headers)
        end_time = time.time()

        assert response.status_code == status.HTTP_200_OK
        response_time = end_time - start_time
        assert response_time < 2.0, f"Response time {response_time}s exceeds 2s limit"

    def test_bulk_meal_retrieval_performance(
        self, client: TestClient, auth_headers: dict, db: Session
    ):
        """Test performance with large number of meals."""
        # Create 50 meals
        for i in range(50):
            meal_data = {
                "meal_type": MealType.SNACK.value,
                "meal_time": (datetime.now() - timedelta(hours=i)).isoformat(),
                "food_items": [
                    {
                        "food_name": f"Bulk test meal {i}",
                        "portion_size": 1.0,
                        "portion_unit": "item",
                        "calories": 100,
                    }
                ],
            }
            client.post("/api/meals", json=meal_data, headers=auth_headers)

        # Test paginated retrieval
        start_time = time.time()
        response = client.get(
            "/api/meals?skip=0&limit=20", headers=auth_headers
        )
        end_time = time.time()

        assert response.status_code == status.HTTP_200_OK
        assert len(response.json()) == 20
        response_time = end_time - start_time
        assert response_time < 2.0, f"Response time {response_time}s exceeds 2s limit"


class TestDataValidation:
    """Additional data validation tests."""

    def test_meal_with_decimal_portions(
        self, client: TestClient, auth_headers: dict, db: Session
    ):
        """Test meal logging with decimal portion sizes."""
        meal_data = {
            "meal_type": MealType.BREAKFAST.value,
            "meal_time": datetime.now().isoformat(),
            "food_items": [
                {
                    "food_name": "Banana",
                    "portion_size": 1.5,
                    "portion_unit": "pieces",
                    "calories": 120,
                    "carbs_g": 30.5,
                }
            ],
        }
        response = client.post("/api/meals", json=meal_data, headers=auth_headers)
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["food_items"][0]["portion_size"] == 1.5

    def test_goal_with_decimal_target(
        self, client: TestClient, auth_headers: dict, db: Session
    ):
        """Test goal with decimal target value."""
        today = date.today()
        goal_data = {
            "goal_type": GoalType.NUTRITION.value,
            "target_type": "daily_protein",
            "target_value": 125.5,
            "start_date": today.isoformat(),
            "end_date": (today + timedelta(days=30)).isoformat(),
        }
        response = client.post("/api/goals", json=goal_data, headers=auth_headers)
        assert response.status_code == status.HTTP_201_CREATED
        assert response.json()["target_value"] == 125.5

    def test_meal_update_partial_fields(
        self, client: TestClient, auth_headers: dict, db: Session
    ):
        """Test updating meal with only some fields changed."""
        # Create meal
        meal_data = {
            "meal_type": MealType.LUNCH.value,
            "meal_time": datetime.now().isoformat(),
            "notes": "Original notes",
            "food_items": [
                {
                    "food_name": "Original food",
                    "portion_size": 1.0,
                    "portion_unit": "serving",
                    "calories": 400,
                }
            ],
        }
        create_response = client.post(
            "/api/meals", json=meal_data, headers=auth_headers
        )
        meal_id = create_response.json()["id"]

        # Update only notes
        update_data = {
            "meal_type": MealType.LUNCH.value,
            "meal_time": datetime.now().isoformat(),
            "notes": "Updated notes",
            "food_items": [
                {
                    "food_name": "Original food",
                    "portion_size": 1.0,
                    "portion_unit": "serving",
                    "calories": 400,
                }
            ],
        }
        update_response = client.put(
            f"/api/meals/{meal_id}", json=update_data, headers=auth_headers
        )
        assert update_response.status_code == status.HTTP_200_OK
        assert update_response.json()["notes"] == "Updated notes"
        assert update_response.json()["total_calories"] == 400

    def test_goal_date_range_validation(
        self, client: TestClient, auth_headers: dict, db: Session
    ):
        """Test various date range scenarios for goals."""
        today = date.today()

        # Short-term goal (1 day)
        goal_data_short = {
            "goal_type": GoalType.WELLNESS.value,
            "target_type": "daily_steps",
            "target_value": 10000.0,
            "start_date": today.isoformat(),
            "end_date": (today + timedelta(days=1)).isoformat(),
        }
        response_short = client.post(
            "/api/goals", json=goal_data_short, headers=auth_headers
        )
        assert response_short.status_code == status.HTTP_201_CREATED

        # Long-term goal (1 year)
        goal_data_long = {
            "goal_type": GoalType.NUTRITION.value,
            "target_type": "annual_calories",
            "target_value": 730000.0,
            "start_date": today.isoformat(),
            "end_date": (today + timedelta(days=365)).isoformat(),
        }
        response_long = client.post(
            "/api/goals", json=goal_data_long, headers=auth_headers
        )
        assert response_long.status_code == status.HTTP_201_CREATED
