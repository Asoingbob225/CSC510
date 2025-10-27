"""Integration tests for Meal and Goal tracking interaction (Issue #103)."""

from datetime import date, datetime, timedelta

from fastapi import status
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from src.eatsential.models.models import GoalType, MealType


class TestMealGoalIntegration:
    """Test interactions between meal logging and goal tracking."""

    def test_create_goal_and_log_meals(
        self, client: TestClient, auth_headers: dict, db: Session
    ):
        """Test that goals and meals can be created together."""
        # Create a daily calorie goal
        today = date.today()
        goal_data = {
            "goal_type": GoalType.NUTRITION.value,
            "target_type": "daily_calories",
            "target_value": 2000.0,
            "start_date": today.isoformat(),
            "end_date": (today + timedelta(days=7)).isoformat(),
        }
        goal_response = client.post("/api/goals", json=goal_data, headers=auth_headers)
        assert goal_response.status_code == status.HTTP_201_CREATED
        goal_id = goal_response.json()["id"]

        # Log meals
        meal_data = {
            "meal_type": MealType.BREAKFAST.value,
            "meal_time": datetime.now().isoformat(),
            "food_items": [
                {
                    "food_name": "Oatmeal",
                    "portion_size": 1.0,
                    "portion_unit": "cup",
                    "calories": 500,
                }
            ],
        }
        meal_response = client.post("/api/meals", json=meal_data, headers=auth_headers)
        assert meal_response.status_code == status.HTTP_201_CREATED

        # Verify both exist
        goal_check = client.get(f"/api/goals/{goal_id}", headers=auth_headers)
        assert goal_check.status_code == status.HTTP_200_OK

        meals_check = client.get("/api/meals", headers=auth_headers)
        assert meals_check.status_code == status.HTTP_200_OK
        assert meals_check.json()["total"] >= 1

    def test_multiple_meals_with_goal(
        self, client: TestClient, auth_headers: dict, db: Session
    ):
        """Test logging multiple meals with an active goal."""
        today = date.today()
        goal_data = {
            "goal_type": GoalType.NUTRITION.value,
            "target_type": "daily_protein",
            "target_value": 150.0,
            "start_date": today.isoformat(),
            "end_date": (today + timedelta(days=30)).isoformat(),
        }
        goal_response = client.post("/api/goals", json=goal_data, headers=auth_headers)
        assert goal_response.status_code == status.HTTP_201_CREATED

        # Log 3 meals
        for meal_type in [MealType.BREAKFAST, MealType.LUNCH, MealType.DINNER]:
            meal_data = {
                "meal_type": meal_type.value,
                "meal_time": datetime.now().isoformat(),
                "food_items": [
                    {
                        "food_name": "Protein meal",
                        "portion_size": 1.0,
                        "portion_unit": "serving",
                        "protein_g": 30.0,
                    }
                ],
            }
            response = client.post("/api/meals", json=meal_data, headers=auth_headers)
            assert response.status_code == status.HTTP_201_CREATED

        # Verify meals were created
        meals_response = client.get("/api/meals", headers=auth_headers)
        assert meals_response.status_code == status.HTTP_200_OK
        assert meals_response.json()["total"] >= 3

    def test_delete_meal_with_active_goal(
        self, client: TestClient, auth_headers: dict, db: Session
    ):
        """Test that meals can be deleted when goals are active."""
        today = date.today()
        goal_data = {
            "goal_type": GoalType.NUTRITION.value,
            "target_type": "daily_calories",
            "target_value": 2000.0,
            "start_date": today.isoformat(),
            "end_date": (today + timedelta(days=7)).isoformat(),
        }
        client.post("/api/goals", json=goal_data, headers=auth_headers)

        # Log a meal
        meal_data = {
            "meal_type": MealType.LUNCH.value,
            "meal_time": datetime.now().isoformat(),
            "food_items": [
                {
                    "food_name": "Burger",
                    "portion_size": 1.0,
                    "portion_unit": "item",
                    "calories": 800,
                }
            ],
        }
        meal_response = client.post("/api/meals", json=meal_data, headers=auth_headers)
        meal_id = meal_response.json()["id"]

        # Delete meal
        delete_response = client.delete(f"/api/meals/{meal_id}", headers=auth_headers)
        assert delete_response.status_code == status.HTTP_204_NO_CONTENT

    def test_meal_history_retrieval(
        self, client: TestClient, auth_headers: dict, db: Session
    ):
        """Test retrieving meal history."""
        # Log meals
        for i in range(3):
            meal_data = {
                "meal_type": MealType.LUNCH.value,
                "meal_time": datetime.now().isoformat(),
                "food_items": [
                    {
                        "food_name": f"Meal {i}",
                        "portion_size": 1.0,
                        "portion_unit": "serving",
                        "calories": 500,
                    }
                ],
            }
            client.post("/api/meals", json=meal_data, headers=auth_headers)

        # Get meals
        meals_response = client.get("/api/meals", headers=auth_headers)
        assert meals_response.status_code == status.HTTP_200_OK
        meals_data = meals_response.json()
        assert "meals" in meals_data
        assert meals_data["total"] >= 3


class TestEdgeCases:
    """Test edge cases in meal and goal interaction."""

    def test_meal_with_zero_calories(
        self, client: TestClient, auth_headers: dict, db: Session
    ):
        """Test logging meal with zero calories."""
        meal_data = {
            "meal_type": MealType.SNACK.value,
            "meal_time": datetime.now().isoformat(),
            "food_items": [
                {
                    "food_name": "Water",
                    "portion_size": 1.0,
                    "portion_unit": "cup",
                    "calories": 0,
                }
            ],
        }
        response = client.post("/api/meals", json=meal_data, headers=auth_headers)
        assert response.status_code == status.HTTP_201_CREATED

    def test_goal_with_large_target_value(
        self, client: TestClient, auth_headers: dict, db: Session
    ):
        """Test creating goal with very large target."""
        today = date.today()
        goal_data = {
            "goal_type": GoalType.NUTRITION.value,
            "target_type": "daily_calories",
            "target_value": 10000.0,
            "start_date": today.isoformat(),
            "end_date": (today + timedelta(days=30)).isoformat(),
        }
        response = client.post("/api/goals", json=goal_data, headers=auth_headers)
        assert response.status_code == status.HTTP_201_CREATED

    def test_concurrent_meal_creation(
        self, client: TestClient, auth_headers: dict, db: Session
    ):
        """Test creating multiple meals rapidly."""
        for i in range(5):
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
            response = client.post("/api/meals", json=meal_data, headers=auth_headers)
            assert response.status_code == status.HTTP_201_CREATED

    def test_goal_with_same_start_and_end_date(
        self, client: TestClient, auth_headers: dict, db: Session
    ):
        """Test goal with same start and end date (should fail validation)."""
        today = date.today()
        goal_data = {
            "goal_type": GoalType.NUTRITION.value,
            "target_type": "daily_calories",
            "target_value": 2000.0,
            "start_date": today.isoformat(),
            "end_date": today.isoformat(),
        }
        # API validation requires end_date > start_date
        response = client.post("/api/goals", json=goal_data, headers=auth_headers)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
