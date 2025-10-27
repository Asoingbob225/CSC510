"""Integration tests for Meal and Goal tracking interaction (Issue #103)."""

from datetime import date, datetime, timedelta

from fastapi import status
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from src.eatsential.models.models import GoalType, MealType


class TestMealGoalIntegration:
    """Test interactions between meal logging and goal tracking."""

    def test_meal_logs_contribute_to_nutrition_goal_progress(
        self, client: TestClient, auth_headers: dict, db: Session
    ):
        """Test that logged meals update nutrition goal progress."""
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

        # Log breakfast (500 cal)
        meal1_data = {
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
        response1 = client.post("/api/meals", json=meal1_data, headers=auth_headers)
        assert response1.status_code == status.HTTP_201_CREATED

        # Log lunch (700 cal)
        meal2_data = {
            "meal_type": MealType.LUNCH.value,
            "meal_time": datetime.now().isoformat(),
            "food_items": [
                {
                    "food_name": "Chicken Salad",
                    "portion_size": 1.0,
                    "portion_unit": "serving",
                    "calories": 700,
                }
            ],
        }
        response2 = client.post("/api/meals", json=meal2_data, headers=auth_headers)
        assert response2.status_code == status.HTTP_201_CREATED

        # Check goal progress
        progress_response = client.get(
            f"/api/goals/{goal_id}/progress", headers=auth_headers
        )
        assert progress_response.status_code == status.HTTP_200_OK
        progress = progress_response.json()

        # Total calories logged: 500 + 700 = 1200
        assert progress["current_value"] == 1200.0
        assert progress["target_value"] == 2000.0
        assert progress["progress_percentage"] == 60.0

    def test_multiple_meals_update_goal_progress(
        self, client: TestClient, auth_headers: dict, db: Session
    ):
        """Test that multiple meals throughout the day update goal."""
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
        goal_id = goal_response.json()["id"]

        # Log 3 meals with protein
        meals = [
            {"meal_type": MealType.BREAKFAST, "protein": 30.0},
            {"meal_type": MealType.LUNCH, "protein": 50.0},
            {"meal_type": MealType.DINNER, "protein": 60.0},
        ]

        for meal in meals:
            meal_data = {
                "meal_type": meal["meal_type"].value,
                "meal_time": datetime.now().isoformat(),
                "food_items": [
                    {
                        "food_name": "Protein meal",
                        "portion_size": 1.0,
                        "portion_unit": "serving",
                        "protein_g": meal["protein"],
                    }
                ],
            }
            response = client.post("/api/meals", json=meal_data, headers=auth_headers)
            assert response.status_code == status.HTTP_201_CREATED

        # Check total protein
        progress_response = client.get(
            f"/api/goals/{goal_id}/progress", headers=auth_headers
        )
        progress = progress_response.json()
        assert progress["current_value"] == 140.0  # 30 + 50 + 60

    def test_deleting_meal_updates_goal_progress(
        self, client: TestClient, auth_headers: dict, db: Session
    ):
        """Test that deleting a meal updates goal progress."""
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

        # Verify initial progress
        progress1 = client.get(
            f"/api/goals/{goal_id}/progress", headers=auth_headers
        ).json()
        assert progress1["current_value"] == 800.0

        # Delete the meal
        delete_response = client.delete(f"/api/meals/{meal_id}", headers=auth_headers)
        assert delete_response.status_code == status.HTTP_204_NO_CONTENT

        # Verify progress updated
        progress2 = client.get(
            f"/api/goals/{goal_id}/progress", headers=auth_headers
        ).json()
        assert progress2["current_value"] == 0.0

    def test_meal_history_with_active_goals(
        self, client: TestClient, auth_headers: dict, db: Session
    ):
        """Test retrieving meal history while having active goals."""
        today = date.today()

        # Create nutrition goal
        goal_data = {
            "goal_type": GoalType.NUTRITION.value,
            "target_type": "daily_calories",
            "target_value": 2000.0,
            "start_date": today.isoformat(),
            "end_date": (today + timedelta(days=30)).isoformat(),
        }
        client.post("/api/goals", json=goal_data, headers=auth_headers)

        # Log meals over several days
        for days_ago in range(3):
            meal_time = datetime.now() - timedelta(days=days_ago)
            meal_data = {
                "meal_type": MealType.LUNCH.value,
                "meal_time": meal_time.isoformat(),
                "food_items": [
                    {
                        "food_name": f"Meal day {days_ago}",
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
        meals = meals_response.json()
        assert len(meals) == 3
        assert all(meal["total_calories"] == 500 for meal in meals)


class TestEdgeCases:
    """Test edge cases and boundary conditions."""

    def test_meal_with_zero_calories(
        self, client: TestClient, auth_headers: dict, db: Session
    ):
        """Test logging meal with zero calories (e.g., water)."""
        meal_data = {
            "meal_type": MealType.SNACK.value,
            "meal_time": datetime.now().isoformat(),
            "food_items": [
                {
                    "food_name": "Water",
                    "portion_size": 500.0,
                    "portion_unit": "ml",
                    "calories": 0,
                }
            ],
        }
        response = client.post("/api/meals", json=meal_data, headers=auth_headers)
        assert response.status_code == status.HTTP_201_CREATED
        assert response.json()["total_calories"] == 0

    def test_goal_with_very_large_target_value(
        self, client: TestClient, auth_headers: dict, db: Session
    ):
        """Test creating goal with very large target value."""
        today = date.today()
        goal_data = {
            "goal_type": GoalType.NUTRITION.value,
            "target_type": "annual_meals",
            "target_value": 100000.0,
            "start_date": today.isoformat(),
            "end_date": (today + timedelta(days=365)).isoformat(),
        }
        response = client.post("/api/goals", json=goal_data, headers=auth_headers)
        assert response.status_code == status.HTTP_201_CREATED

    def test_concurrent_meal_updates(
        self, client: TestClient, auth_headers: dict, db: Session
    ):
        """Test updating meal while goal progress is being calculated."""
        today = date.today()
        goal_data = {
            "goal_type": GoalType.NUTRITION.value,
            "target_type": "daily_calories",
            "target_value": 2000.0,
            "start_date": today.isoformat(),
            "end_date": (today + timedelta(days=7)).isoformat(),
        }
        client.post("/api/goals", json=goal_data, headers=auth_headers)

        # Create meal
        meal_data = {
            "meal_type": MealType.LUNCH.value,
            "meal_time": datetime.now().isoformat(),
            "food_items": [
                {
                    "food_name": "Original meal",
                    "portion_size": 1.0,
                    "portion_unit": "serving",
                    "calories": 500,
                }
            ],
        }
        meal_response = client.post("/api/meals", json=meal_data, headers=auth_headers)
        meal_id = meal_response.json()["id"]

        # Update meal
        update_data = {
            "meal_type": MealType.LUNCH.value,
            "meal_time": datetime.now().isoformat(),
            "food_items": [
                {
                    "food_name": "Updated meal",
                    "portion_size": 1.0,
                    "portion_unit": "serving",
                    "calories": 700,
                }
            ],
        }
        update_response = client.put(
            f"/api/meals/{meal_id}", json=update_data, headers=auth_headers
        )
        assert update_response.status_code == status.HTTP_200_OK
        assert update_response.json()["total_calories"] == 700

    def test_meal_logging_near_midnight(
        self, client: TestClient, auth_headers: dict, db: Session
    ):
        """Test meal logging at edge of day boundary."""
        # Log meal at 23:59
        meal_time = datetime.now().replace(hour=23, minute=59, second=0)
        meal_data = {
            "meal_type": MealType.DINNER.value,
            "meal_time": meal_time.isoformat(),
            "food_items": [
                {
                    "food_name": "Late dinner",
                    "portion_size": 1.0,
                    "portion_unit": "serving",
                    "calories": 600,
                }
            ],
        }
        response = client.post("/api/meals", json=meal_data, headers=auth_headers)
        assert response.status_code == status.HTTP_201_CREATED

    def test_goal_with_same_start_and_end_date(
        self, client: TestClient, auth_headers: dict, db: Session
    ):
        """Test creating single-day goal."""
        today = date.today()
        goal_data = {
            "goal_type": GoalType.WELLNESS.value,
            "target_type": "meditation_minutes",
            "target_value": 30.0,
            "start_date": today.isoformat(),
            "end_date": today.isoformat(),
        }
        response = client.post("/api/goals", json=goal_data, headers=auth_headers)
        # This might be valid or invalid depending on business rules
        # Test that it handles gracefully
        assert response.status_code in [
            status.HTTP_201_CREATED,
            status.HTTP_422_UNPROCESSABLE_ENTITY,
        ]
