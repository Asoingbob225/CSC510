"""Integration tests for Goal Tracking API endpoints."""

from datetime import date, timedelta

from fastapi import status
from fastapi.testclient import TestClient

from src.eatsential.models.models import GoalStatus, GoalType
from src.eatsential.services.goal_service import GoalService


class TestCreateGoalEndpoint:
    """Tests for POST /api/goals endpoint."""

    def test_create_goal_success(self, client: TestClient, auth_headers: dict, db):
        """Test successful goal creation."""
        today = date.today()
        goal_data = {
            "goal_type": GoalType.NUTRITION.value,
            "target_type": "daily_calories",
            "target_value": 2000.0,
            "start_date": today.isoformat(),
            "end_date": (today + timedelta(days=30)).isoformat(),
            "notes": "Track daily calorie intake",
        }

        response = client.post("/api/goals", json=goal_data, headers=auth_headers)

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["goal_type"] == GoalType.NUTRITION.value
        assert data["target_type"] == "daily_calories"
        assert data["target_value"] == 2000.0
        assert data["current_value"] == 0.0
        assert data["status"] == GoalStatus.ACTIVE.value
        assert data["notes"] == "Track daily calorie intake"

    def test_create_goal_requires_authentication(self, client: TestClient):
        """Test that creating goal requires authentication."""
        today = date.today()
        goal_data = {
            "goal_type": GoalType.WELLNESS.value,
            "target_type": "daily_meditation",
            "target_value": 1.0,
            "start_date": today.isoformat(),
            "end_date": (today + timedelta(days=7)).isoformat(),
        }

        response = client.post("/api/goals", json=goal_data)

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_create_goal_validates_target_value_positive(
        self, client: TestClient, auth_headers: dict
    ):
        """Test that target_value must be positive."""
        today = date.today()
        goal_data = {
            "goal_type": GoalType.NUTRITION.value,
            "target_type": "daily_calories",
            "target_value": -100.0,
            "start_date": today.isoformat(),
            "end_date": (today + timedelta(days=7)).isoformat(),
        }

        response = client.post("/api/goals", json=goal_data, headers=auth_headers)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT

    def test_create_goal_validates_end_date_after_start(
        self, client: TestClient, auth_headers: dict
    ):
        """Test that end_date must be after start_date."""
        today = date.today()
        goal_data = {
            "goal_type": GoalType.NUTRITION.value,
            "target_type": "daily_calories",
            "target_value": 2000.0,
            "start_date": today.isoformat(),
            "end_date": (today - timedelta(days=1)).isoformat(),
        }

        response = client.post("/api/goals", json=goal_data, headers=auth_headers)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
        assert "after start_date" in response.json()["detail"][0]["msg"].lower()

    def test_create_goal_validates_start_date_not_too_old(
        self, client: TestClient, auth_headers: dict
    ):
        """Test that start_date cannot be more than 365 days in the past."""
        today = date.today()
        goal_data = {
            "goal_type": GoalType.WELLNESS.value,
            "target_type": "weekly_exercise",
            "target_value": 5.0,
            "start_date": (today - timedelta(days=400)).isoformat(),
            "end_date": (today - timedelta(days=370)).isoformat(),
        }

        response = client.post("/api/goals", json=goal_data, headers=auth_headers)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT


class TestGetGoalsEndpoint:
    """Tests for GET /api/goals endpoint."""

    def test_get_goals_list(
        self, client: TestClient, auth_headers: dict, test_user, db
    ):
        """Test retrieving list of goals."""
        today = date.today()

        # Create multiple goals
        for i in range(3):
            goal_data = {
                "goal_type": GoalType.NUTRITION.value,
                "target_type": f"goal_{i}",
                "target_value": float(2000 + i * 100),
                "start_date": today,
                "end_date": today + timedelta(days=30),
            }
            GoalService.create_goal(
                db,
                test_user.id,
                type("GoalCreate", (), goal_data)(),
            )

        response = client.get("/api/goals", headers=auth_headers)

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["total"] == 3
        assert len(data["goals"]) == 3
        assert data["page"] == 1
        assert data["page_size"] == 20

    def test_get_goals_pagination(
        self, client: TestClient, auth_headers: dict, test_user, db
    ):
        """Test pagination of goals list."""
        today = date.today()

        # Create 5 goals
        for i in range(5):
            goal_data = {
                "goal_type": GoalType.NUTRITION.value,
                "target_type": f"goal_{i}",
                "target_value": float(2000 + i * 100),
                "start_date": today,
                "end_date": today + timedelta(days=30),
            }
            GoalService.create_goal(
                db,
                test_user.id,
                type("GoalCreate", (), goal_data)(),
            )

        # Get first page
        response = client.get("/api/goals?page=1&page_size=2", headers=auth_headers)

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["total"] == 5
        assert len(data["goals"]) == 2
        assert data["page"] == 1

        # Get second page
        response = client.get("/api/goals?page=2&page_size=2", headers=auth_headers)

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["total"] == 5
        assert len(data["goals"]) == 2
        assert data["page"] == 2

    def test_get_goals_filter_by_type(
        self, client: TestClient, auth_headers: dict, test_user, db
    ):
        """Test filtering goals by goal_type."""
        today = date.today()

        # Create nutrition goal
        nutrition_goal = {
            "goal_type": GoalType.NUTRITION.value,
            "target_type": "daily_calories",
            "target_value": 2000.0,
            "start_date": today,
            "end_date": today + timedelta(days=30),
        }
        GoalService.create_goal(
            db, test_user.id, type("GoalCreate", (), nutrition_goal)()
        )

        # Create wellness goal
        wellness_goal = {
            "goal_type": GoalType.WELLNESS.value,
            "target_type": "daily_meditation",
            "target_value": 1.0,
            "start_date": today,
            "end_date": today + timedelta(days=30),
        }
        GoalService.create_goal(
            db, test_user.id, type("GoalCreate", (), wellness_goal)()
        )

        # Filter by nutrition
        response = client.get(
            f"/api/goals?goal_type={GoalType.NUTRITION.value}", headers=auth_headers
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["total"] == 1
        assert data["goals"][0]["goal_type"] == GoalType.NUTRITION.value

    def test_get_goals_filter_by_status(
        self, client: TestClient, auth_headers: dict, test_user, db
    ):
        """Test filtering goals by status."""
        today = date.today()

        # Create active goal
        goal_data = {
            "goal_type": GoalType.NUTRITION.value,
            "target_type": "daily_calories",
            "target_value": 2000.0,
            "start_date": today,
            "end_date": today + timedelta(days=30),
        }
        goal = GoalService.create_goal(
            db, test_user.id, type("GoalCreate", (), goal_data)()
        )

        # Update to completed
        update_data = {"status": GoalStatus.COMPLETED.value}
        client.put(f"/api/goals/{goal.id}", json=update_data, headers=auth_headers)

        # Create another active goal
        GoalService.create_goal(db, test_user.id, type("GoalCreate", (), goal_data)())

        # Filter by active status
        response = client.get(
            f"/api/goals?status={GoalStatus.ACTIVE.value}", headers=auth_headers
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["total"] == 1
        assert data["goals"][0]["status"] == GoalStatus.ACTIVE.value

    def test_get_goals_requires_authentication(self, client: TestClient):
        """Test that getting goals requires authentication."""
        response = client.get("/api/goals")

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_get_goals_user_isolation(
        self,
        client: TestClient,
        auth_headers: dict,
        auth_headers_2: dict,
        test_user,
        test_user_2,
        db,
    ):
        """Test that users only see their own goals."""
        today = date.today()

        # Create goals for user 1
        goal_data = {
            "goal_type": GoalType.NUTRITION.value,
            "target_type": "daily_calories",
            "target_value": 2000.0,
            "start_date": today,
            "end_date": today + timedelta(days=30),
        }
        GoalService.create_goal(db, test_user.id, type("GoalCreate", (), goal_data)())
        GoalService.create_goal(db, test_user.id, type("GoalCreate", (), goal_data)())

        # Create goal for user 2
        GoalService.create_goal(db, test_user_2.id, type("GoalCreate", (), goal_data)())

        # User 1 should see only their 2 goals
        response = client.get("/api/goals", headers=auth_headers)

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["total"] == 2


class TestGetGoalEndpoint:
    """Tests for GET /api/goals/{id} endpoint."""

    def test_get_goal_success(
        self, client: TestClient, auth_headers: dict, test_user, db
    ):
        """Test successfully retrieving a goal."""
        today = date.today()
        goal_data = {
            "goal_type": GoalType.NUTRITION.value,
            "target_type": "daily_calories",
            "target_value": 2000.0,
            "start_date": today,
            "end_date": today + timedelta(days=30),
        }
        goal = GoalService.create_goal(
            db, test_user.id, type("GoalCreate", (), goal_data)()
        )

        response = client.get(f"/api/goals/{goal.id}", headers=auth_headers)

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == goal.id
        assert data["target_type"] == "daily_calories"

    def test_get_goal_not_found(self, client: TestClient, auth_headers: dict):
        """Test getting non-existent goal returns 404."""
        fake_id = "00000000-0000-0000-0000-000000000000"

        response = client.get(f"/api/goals/{fake_id}", headers=auth_headers)

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert "not found" in response.json()["detail"].lower()

    def test_get_goal_requires_authentication(self, client: TestClient, test_user, db):
        """Test that getting a goal requires authentication."""
        today = date.today()
        goal_data = {
            "goal_type": GoalType.NUTRITION.value,
            "target_type": "daily_calories",
            "target_value": 2000.0,
            "start_date": today,
            "end_date": today + timedelta(days=30),
        }
        goal = GoalService.create_goal(
            db, test_user.id, type("GoalCreate", (), goal_data)()
        )

        response = client.get(f"/api/goals/{goal.id}")

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_get_goal_user_isolation(
        self,
        client: TestClient,
        auth_headers: dict,
        auth_headers_2: dict,
        test_user,
        test_user_2,
        db,
    ):
        """Test that users cannot access other users' goals."""
        today = date.today()
        goal_data = {
            "goal_type": GoalType.NUTRITION.value,
            "target_type": "daily_calories",
            "target_value": 2000.0,
            "start_date": today,
            "end_date": today + timedelta(days=30),
        }

        # Create goal for user 1
        goal = GoalService.create_goal(
            db, test_user.id, type("GoalCreate", (), goal_data)()
        )

        # Try to access with user 2's credentials
        response = client.get(f"/api/goals/{goal.id}", headers=auth_headers_2)

        assert response.status_code == status.HTTP_404_NOT_FOUND


class TestUpdateGoalEndpoint:
    """Tests for PUT /api/goals/{id} endpoint."""

    def test_update_goal_success(
        self, client: TestClient, auth_headers: dict, test_user, db
    ):
        """Test successfully updating a goal."""
        today = date.today()
        goal_data = {
            "goal_type": GoalType.NUTRITION.value,
            "target_type": "daily_calories",
            "target_value": 2000.0,
            "start_date": today,
            "end_date": today + timedelta(days=30),
        }
        goal = GoalService.create_goal(
            db, test_user.id, type("GoalCreate", (), goal_data)()
        )

        update_data = {
            "current_value": 1500.0,
            "notes": "Making good progress",
        }

        response = client.put(
            f"/api/goals/{goal.id}", json=update_data, headers=auth_headers
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["current_value"] == 1500.0
        assert data["notes"] == "Making good progress"
        assert data["target_value"] == 2000.0  # Unchanged

    def test_update_goal_status(
        self, client: TestClient, auth_headers: dict, test_user, db
    ):
        """Test updating goal status."""
        today = date.today()
        goal_data = {
            "goal_type": GoalType.NUTRITION.value,
            "target_type": "daily_calories",
            "target_value": 2000.0,
            "start_date": today,
            "end_date": today + timedelta(days=30),
        }
        goal = GoalService.create_goal(
            db, test_user.id, type("GoalCreate", (), goal_data)()
        )

        update_data = {"status": GoalStatus.COMPLETED.value}

        response = client.put(
            f"/api/goals/{goal.id}", json=update_data, headers=auth_headers
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["status"] == GoalStatus.COMPLETED.value

    def test_update_goal_not_found(self, client: TestClient, auth_headers: dict):
        """Test updating non-existent goal returns 404."""
        fake_id = "00000000-0000-0000-0000-000000000000"
        update_data = {"current_value": 100.0}

        response = client.put(
            f"/api/goals/{fake_id}", json=update_data, headers=auth_headers
        )

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_update_goal_requires_authentication(
        self, client: TestClient, test_user, db
    ):
        """Test that updating a goal requires authentication."""
        today = date.today()
        goal_data = {
            "goal_type": GoalType.NUTRITION.value,
            "target_type": "daily_calories",
            "target_value": 2000.0,
            "start_date": today,
            "end_date": today + timedelta(days=30),
        }
        goal = GoalService.create_goal(
            db, test_user.id, type("GoalCreate", (), goal_data)()
        )

        update_data = {"current_value": 100.0}

        response = client.put(f"/api/goals/{goal.id}", json=update_data)

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_update_goal_user_isolation(
        self,
        client: TestClient,
        auth_headers: dict,
        auth_headers_2: dict,
        test_user,
        test_user_2,
        db,
    ):
        """Test that users cannot update other users' goals."""
        today = date.today()
        goal_data = {
            "goal_type": GoalType.NUTRITION.value,
            "target_type": "daily_calories",
            "target_value": 2000.0,
            "start_date": today,
            "end_date": today + timedelta(days=30),
        }

        # Create goal for user 1
        goal = GoalService.create_goal(
            db, test_user.id, type("GoalCreate", (), goal_data)()
        )

        # Try to update with user 2's credentials
        update_data = {"current_value": 999.0}
        response = client.put(
            f"/api/goals/{goal.id}", json=update_data, headers=auth_headers_2
        )

        assert response.status_code == status.HTTP_404_NOT_FOUND


class TestDeleteGoalEndpoint:
    """Tests for DELETE /api/goals/{id} endpoint."""

    def test_delete_goal_success(
        self, client: TestClient, auth_headers: dict, test_user, db
    ):
        """Test successfully deleting a goal."""
        today = date.today()
        goal_data = {
            "goal_type": GoalType.NUTRITION.value,
            "target_type": "daily_calories",
            "target_value": 2000.0,
            "start_date": today,
            "end_date": today + timedelta(days=30),
        }
        goal = GoalService.create_goal(
            db, test_user.id, type("GoalCreate", (), goal_data)()
        )

        response = client.delete(f"/api/goals/{goal.id}", headers=auth_headers)

        assert response.status_code == status.HTTP_204_NO_CONTENT

        # Verify goal is deleted
        get_response = client.get(f"/api/goals/{goal.id}", headers=auth_headers)
        assert get_response.status_code == status.HTTP_404_NOT_FOUND

    def test_delete_goal_not_found(self, client: TestClient, auth_headers: dict):
        """Test deleting non-existent goal returns 404."""
        fake_id = "00000000-0000-0000-0000-000000000000"

        response = client.delete(f"/api/goals/{fake_id}", headers=auth_headers)

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_delete_goal_requires_authentication(
        self, client: TestClient, test_user, db
    ):
        """Test that deleting a goal requires authentication."""
        today = date.today()
        goal_data = {
            "goal_type": GoalType.NUTRITION.value,
            "target_type": "daily_calories",
            "target_value": 2000.0,
            "start_date": today,
            "end_date": today + timedelta(days=30),
        }
        goal = GoalService.create_goal(
            db, test_user.id, type("GoalCreate", (), goal_data)()
        )

        response = client.delete(f"/api/goals/{goal.id}")

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_delete_goal_user_isolation(
        self,
        client: TestClient,
        auth_headers: dict,
        auth_headers_2: dict,
        test_user,
        test_user_2,
        db,
    ):
        """Test that users cannot delete other users' goals."""
        today = date.today()
        goal_data = {
            "goal_type": GoalType.NUTRITION.value,
            "target_type": "daily_calories",
            "target_value": 2000.0,
            "start_date": today,
            "end_date": today + timedelta(days=30),
        }

        # Create goal for user 1
        goal = GoalService.create_goal(
            db, test_user.id, type("GoalCreate", (), goal_data)()
        )

        # Try to delete with user 2's credentials
        response = client.delete(f"/api/goals/{goal.id}", headers=auth_headers_2)

        assert response.status_code == status.HTTP_404_NOT_FOUND

        # Verify goal still exists for user 1
        get_response = client.get(f"/api/goals/{goal.id}", headers=auth_headers)
        assert get_response.status_code == status.HTTP_200_OK


class TestGoalProgressEndpoint:
    """Tests for GET /api/goals/progress endpoint."""

    def test_get_progress_for_multiple_goals(
        self, client: TestClient, auth_headers: dict, test_user, db
    ):
        """Test getting progress for multiple goals."""
        today = date.today()

        # Create goals with different progress
        goal_data_1 = {
            "goal_type": GoalType.NUTRITION.value,
            "target_type": "daily_calories",
            "target_value": 2000.0,
            "start_date": today,
            "end_date": today + timedelta(days=7),
        }
        goal_1 = GoalService.create_goal(
            db, test_user.id, type("GoalCreate", (), goal_data_1)()
        )

        # Update progress to 50%
        update_data = {"current_value": 1000.0}
        client.put(f"/api/goals/{goal_1.id}", json=update_data, headers=auth_headers)

        goal_data_2 = {
            "goal_type": GoalType.WELLNESS.value,
            "target_type": "weekly_meditation",
            "target_value": 7.0,
            "start_date": today,
            "end_date": today + timedelta(days=7),
        }
        goal_2 = GoalService.create_goal(
            db, test_user.id, type("GoalCreate", (), goal_data_2)()
        )

        # Update progress to ~71%
        update_data = {"current_value": 5.0}
        client.put(f"/api/goals/{goal_2.id}", json=update_data, headers=auth_headers)

        # Get progress for all goals
        response = client.get("/api/goals/progress", headers=auth_headers)

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 2
        assert data[0]["completion_percentage"] == 50.0
        assert 70.0 < data[1]["completion_percentage"] < 72.0

    def test_get_progress_filtered_by_type(
        self, client: TestClient, auth_headers: dict, test_user, db
    ):
        """Test filtering progress by goal type."""
        today = date.today()

        # Create nutrition goal
        nutrition_goal_data = {
            "goal_type": GoalType.NUTRITION.value,
            "target_type": "daily_calories",
            "target_value": 2000.0,
            "start_date": today,
            "end_date": today + timedelta(days=30),
        }
        GoalService.create_goal(
            db, test_user.id, type("GoalCreate", (), nutrition_goal_data)()
        )

        # Create wellness goal
        wellness_goal_data = {
            "goal_type": GoalType.WELLNESS.value,
            "target_type": "daily_meditation",
            "target_value": 1.0,
            "start_date": today,
            "end_date": today + timedelta(days=30),
        }
        GoalService.create_goal(
            db, test_user.id, type("GoalCreate", (), wellness_goal_data)()
        )

        # Get progress for nutrition goals only
        response = client.get(
            f"/api/goals/progress?goal_type={GoalType.NUTRITION.value}",
            headers=auth_headers,
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 1
        assert data[0]["goal_type"] == GoalType.NUTRITION.value

    def test_get_progress_requires_authentication(self, client: TestClient):
        """Test that getting progress requires authentication."""
        response = client.get("/api/goals/progress")

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_get_progress_with_days_remaining(
        self, client: TestClient, auth_headers: dict, test_user, db
    ):
        """Test that days_remaining is included in progress response."""
        today = date.today()

        goal_data = {
            "goal_type": GoalType.NUTRITION.value,
            "target_type": "daily_calories",
            "target_value": 2000.0,
            "start_date": today,
            "end_date": today + timedelta(days=10),
        }
        GoalService.create_goal(db, test_user.id, type("GoalCreate", (), goal_data)())

        response = client.get("/api/goals/progress", headers=auth_headers)

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 1
        assert data[0]["days_remaining"] == 10
