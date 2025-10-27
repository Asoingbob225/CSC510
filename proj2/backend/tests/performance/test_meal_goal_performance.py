"""Performance tests for Meal and Goal tracking (Issue #103)."""

import time
from datetime import date, datetime, timedelta

from fastapi import status
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from src.eatsential.models.models import GoalType, MealType


class TestPerformance:
    """Performance tests for meal and goal operations."""

    def test_create_meal_performance(
        self, client: TestClient, auth_headers: dict, db: Session
    ):
        """Test that meal creation completes within 2 seconds."""
        meal_data = {
            "meal_type": MealType.BREAKFAST.value,
            "meal_time": datetime.now().isoformat(),
            "food_items": [
                {
                    "food_name": "Test Meal",
                    "portion_size": 1.0,
                    "portion_unit": "serving",
                    "calories": 500,
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
        """Test that retrieving meals list completes within 2 seconds."""
        # Create some meals first
        for i in range(10):
            meal_data = {
                "meal_type": MealType.SNACK.value,
                "meal_time": datetime.now().isoformat(),
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
            "end_date": (today + timedelta(days=7)).isoformat(),
        }

        start_time = time.time()
        response = client.post("/api/goals", json=goal_data, headers=auth_headers)
        end_time = time.time()

        assert response.status_code == status.HTTP_201_CREATED
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
        response = client.get("/api/meals?skip=0&limit=20", headers=auth_headers)
        end_time = time.time()

        assert response.status_code == status.HTTP_200_OK
        response_data = response.json()
        assert len(response_data["meals"]) == 20
        response_time = end_time - start_time
        assert response_time < 2.0, f"Response time {response_time}s exceeds 2s limit"


class TestDataValidation:
    """Additional data validation tests."""

    def test_meal_with_decimal_portions(
        self, client: TestClient, auth_headers: dict, db: Session
    ):
        """Test meal with decimal portion sizes."""
        meal_data = {
            "meal_type": MealType.LUNCH.value,
            "meal_time": datetime.now().isoformat(),
            "food_items": [
                {
                    "food_name": "Pasta",
                    "portion_size": 1.5,
                    "portion_unit": "cup",
                    "calories": 300,
                }
            ],
        }
        response = client.post("/api/meals", json=meal_data, headers=auth_headers)
        assert response.status_code == status.HTTP_201_CREATED

    def test_goal_with_decimal_target(
        self, client: TestClient, auth_headers: dict, db: Session
    ):
        """Test goal with decimal target value."""
        today = date.today()
        goal_data = {
            "goal_type": GoalType.NUTRITION.value,
            "target_type": "daily_protein",
            "target_value": 155.5,
            "start_date": today.isoformat(),
            "end_date": (today + timedelta(days=7)).isoformat(),
        }
        response = client.post("/api/goals", json=goal_data, headers=auth_headers)
        assert response.status_code == status.HTTP_201_CREATED

    def test_meal_update_partial_fields(
        self, client: TestClient, auth_headers: dict, db: Session
    ):
        """Test updating meal with partial data."""
        # Create meal
        meal_data = {
            "meal_type": MealType.DINNER.value,
            "meal_time": datetime.now().isoformat(),
            "food_items": [
                {
                    "food_name": "Original meal",
                    "portion_size": 1.0,
                    "portion_unit": "serving",
                    "calories": 600,
                }
            ],
        }
        create_response = client.post(
            "/api/meals", json=meal_data, headers=auth_headers
        )
        meal_id = create_response.json()["id"]

        # Update meal
        update_data = {
            "meal_type": MealType.DINNER.value,
            "meal_time": datetime.now().isoformat(),
            "food_items": [
                {
                    "food_name": "Updated meal",
                    "portion_size": 1.5,
                    "portion_unit": "serving",
                    "calories": 700,
                }
            ],
        }
        update_response = client.put(
            f"/api/meals/{meal_id}", json=update_data, headers=auth_headers
        )
        assert update_response.status_code == status.HTTP_200_OK

    def test_goal_date_range_validation(
        self, client: TestClient, auth_headers: dict, db: Session
    ):
        """Test goal with various date ranges."""
        today = date.today()

        # One week goal
        goal_data = {
            "goal_type": GoalType.NUTRITION.value,
            "target_type": "daily_calories",
            "target_value": 2000.0,
            "start_date": today.isoformat(),
            "end_date": (today + timedelta(days=7)).isoformat(),
        }
        response = client.post("/api/goals", json=goal_data, headers=auth_headers)
        assert response.status_code == status.HTTP_201_CREATED

        # One month goal
        goal_data2 = {
            "goal_type": GoalType.NUTRITION.value,
            "target_type": "daily_protein",
            "target_value": 150.0,
            "start_date": today.isoformat(),
            "end_date": (today + timedelta(days=30)).isoformat(),
        }
        response2 = client.post("/api/goals", json=goal_data2, headers=auth_headers)
        assert response2.status_code == status.HTTP_201_CREATED
