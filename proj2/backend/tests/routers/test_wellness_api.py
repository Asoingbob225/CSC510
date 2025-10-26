"""Integration tests for Mental Wellness API endpoints."""

from datetime import date, timedelta

from fastapi import status
from fastapi.testclient import TestClient

from src.eatsential.services.mental_wellness_service import MentalWellnessService


class TestCreateMoodLogEndpoint:
    """Tests for POST /api/wellness/mood-logs endpoint."""

    def test_create_mood_log_success(self, client: TestClient, auth_headers: dict):
        """Test successful mood log creation."""
        today = date.today()
        mood_data = {
            "log_date": today.isoformat(),
            "mood_score": 8,
            "notes": "Feeling great today!",
        }

        response = client.post(
            "/api/wellness/mood-logs", json=mood_data, headers=auth_headers
        )

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["log_date"] == today.isoformat()
        assert data["mood_score"] == 8
        assert data["notes"] == "Feeling great today!"
        assert "id" in data
        assert "created_at" in data

    def test_create_mood_log_requires_authentication(self, client: TestClient):
        """Test that creating mood log requires authentication."""
        today = date.today()
        mood_data = {"log_date": today.isoformat(), "mood_score": 7}

        response = client.post("/api/wellness/mood-logs", json=mood_data)

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_create_mood_log_validates_score_range(
        self, client: TestClient, auth_headers: dict
    ):
        """Test that mood_score must be between 1 and 10."""
        today = date.today()
        mood_data = {"log_date": today.isoformat(), "mood_score": 11}

        response = client.post(
            "/api/wellness/mood-logs", json=mood_data, headers=auth_headers
        )

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_create_mood_log_validates_date_not_future(
        self, client: TestClient, auth_headers: dict
    ):
        """Test that log_date cannot be in the future."""
        future_date = date.today() + timedelta(days=1)
        mood_data = {"log_date": future_date.isoformat(), "mood_score": 8}

        response = client.post(
            "/api/wellness/mood-logs", json=mood_data, headers=auth_headers
        )

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_create_mood_log_validates_date_within_7_days(
        self, client: TestClient, auth_headers: dict
    ):
        """Test that log_date must be within last 7 days."""
        old_date = date.today() - timedelta(days=8)
        mood_data = {"log_date": old_date.isoformat(), "mood_score": 7}

        response = client.post(
            "/api/wellness/mood-logs", json=mood_data, headers=auth_headers
        )

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


class TestCreateStressLogEndpoint:
    """Tests for POST /api/wellness/stress-logs endpoint."""

    def test_create_stress_log_success(self, client: TestClient, auth_headers: dict):
        """Test successful stress log creation."""
        today = date.today()
        stress_data = {
            "log_date": today.isoformat(),
            "stress_level": 6,
            "triggers": "Work deadline",
            "notes": "Project due tomorrow",
        }

        response = client.post(
            "/api/wellness/stress-logs", json=stress_data, headers=auth_headers
        )

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["log_date"] == today.isoformat()
        assert data["stress_level"] == 6
        assert data["triggers"] == "Work deadline"
        assert data["notes"] == "Project due tomorrow"

    def test_create_stress_log_requires_authentication(self, client: TestClient):
        """Test that creating stress log requires authentication."""
        today = date.today()
        stress_data = {"log_date": today.isoformat(), "stress_level": 5}

        response = client.post("/api/wellness/stress-logs", json=stress_data)

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_create_stress_log_without_optional_fields(
        self, client: TestClient, auth_headers: dict
    ):
        """Test creating stress log without triggers and notes."""
        today = date.today()
        stress_data = {"log_date": today.isoformat(), "stress_level": 4}

        response = client.post(
            "/api/wellness/stress-logs", json=stress_data, headers=auth_headers
        )

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["stress_level"] == 4
        assert data["triggers"] is None
        assert data["notes"] is None


class TestCreateSleepLogEndpoint:
    """Tests for POST /api/wellness/sleep-logs endpoint."""

    def test_create_sleep_log_success(self, client: TestClient, auth_headers: dict):
        """Test successful sleep log creation."""
        today = date.today()
        sleep_data = {
            "log_date": today.isoformat(),
            "duration_hours": 7.5,
            "quality_score": 8,
            "notes": "Slept well",
        }

        response = client.post(
            "/api/wellness/sleep-logs", json=sleep_data, headers=auth_headers
        )

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["log_date"] == today.isoformat()
        assert data["duration_hours"] == 7.5
        assert data["quality_score"] == 8
        assert data["notes"] == "Slept well"

    def test_create_sleep_log_requires_authentication(self, client: TestClient):
        """Test that creating sleep log requires authentication."""
        today = date.today()
        sleep_data = {
            "log_date": today.isoformat(),
            "duration_hours": 7.0,
            "quality_score": 7,
        }

        response = client.post("/api/wellness/sleep-logs", json=sleep_data)

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_create_sleep_log_validates_duration(
        self, client: TestClient, auth_headers: dict
    ):
        """Test that duration_hours must be positive and <= 24."""
        today = date.today()
        sleep_data = {
            "log_date": today.isoformat(),
            "duration_hours": 25.0,
            "quality_score": 7,
        }

        response = client.post(
            "/api/wellness/sleep-logs", json=sleep_data, headers=auth_headers
        )

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


class TestGetWellnessLogsEndpoint:
    """Tests for GET /api/wellness/logs endpoint."""

    def test_get_all_wellness_logs(
        self, client: TestClient, auth_headers: dict, db
    ):
        """Test retrieving all wellness logs."""
        today = date.today()

        # Create logs via API
        client.post(
            "/api/wellness/mood-logs",
            json={"log_date": today.isoformat(), "mood_score": 8},
            headers=auth_headers,
        )
        client.post(
            "/api/wellness/stress-logs",
            json={"log_date": today.isoformat(), "stress_level": 5},
            headers=auth_headers,
        )
        client.post(
            "/api/wellness/sleep-logs",
            json={
                "log_date": today.isoformat(),
                "duration_hours": 7.0,
                "quality_score": 8,
            },
            headers=auth_headers,
        )

        response = client.get("/api/wellness/logs", headers=auth_headers)

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data["mood_logs"]) == 1
        assert len(data["stress_logs"]) == 1
        assert len(data["sleep_logs"]) == 1
        assert data["total_count"] == 3

    def test_get_wellness_logs_with_date_range(
        self, client: TestClient, auth_headers: dict
    ):
        """Test filtering logs by date range."""
        today = date.today()
        yesterday = today - timedelta(days=1)

        # Create logs on different dates
        client.post(
            "/api/wellness/mood-logs",
            json={"log_date": yesterday.isoformat(), "mood_score": 7},
            headers=auth_headers,
        )
        client.post(
            "/api/wellness/mood-logs",
            json={"log_date": today.isoformat(), "mood_score": 8},
            headers=auth_headers,
        )

        # Get only today's logs
        response = client.get(
            f"/api/wellness/logs?start_date={today.isoformat()}",
            headers=auth_headers,
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data["mood_logs"]) == 1
        assert data["mood_logs"][0]["mood_score"] == 8

    def test_get_wellness_logs_filter_by_type(
        self, client: TestClient, auth_headers: dict
    ):
        """Test filtering logs by type."""
        today = date.today()

        # Create multiple log types
        client.post(
            "/api/wellness/mood-logs",
            json={"log_date": today.isoformat(), "mood_score": 8},
            headers=auth_headers,
        )
        client.post(
            "/api/wellness/stress-logs",
            json={"log_date": today.isoformat(), "stress_level": 5},
            headers=auth_headers,
        )

        # Get only mood logs
        response = client.get(
            "/api/wellness/logs?log_type=mood", headers=auth_headers
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data["mood_logs"]) == 1
        assert len(data["stress_logs"]) == 0
        assert len(data["sleep_logs"]) == 0

    def test_get_wellness_logs_requires_authentication(self, client: TestClient):
        """Test that getting logs requires authentication."""
        response = client.get("/api/wellness/logs")

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_get_wellness_logs_validates_log_type(
        self, client: TestClient, auth_headers: dict
    ):
        """Test that invalid log_type is rejected."""
        response = client.get(
            "/api/wellness/logs?log_type=invalid", headers=auth_headers
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST


class TestGetMoodLogEndpoint:
    """Tests for GET /api/wellness/mood-logs/{log_id} endpoint."""

    def test_get_mood_log_success(self, client: TestClient, auth_headers: dict):
        """Test retrieving a specific mood log."""
        today = date.today()

        # Create a mood log
        create_response = client.post(
            "/api/wellness/mood-logs",
            json={"log_date": today.isoformat(), "mood_score": 8, "notes": "Great day"},
            headers=auth_headers,
        )
        log_id = create_response.json()["id"]

        # Get the log
        response = client.get(
            f"/api/wellness/mood-logs/{log_id}", headers=auth_headers
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == log_id
        assert data["mood_score"] == 8
        assert data["notes"] == "Great day"

    def test_get_mood_log_not_found(self, client: TestClient, auth_headers: dict):
        """Test getting non-existent mood log returns 404."""
        response = client.get(
            "/api/wellness/mood-logs/00000000-0000-0000-0000-000000000000",
            headers=auth_headers,
        )

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_get_mood_log_requires_authentication(self, client: TestClient):
        """Test that getting mood log requires authentication."""
        response = client.get(
            "/api/wellness/mood-logs/00000000-0000-0000-0000-000000000000"
        )

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_get_mood_log_user_isolation(
        self, client: TestClient, auth_headers: dict, auth_headers_2: dict
    ):
        """Test that users can only access their own mood logs."""
        today = date.today()

        # User 1 creates a log
        create_response = client.post(
            "/api/wellness/mood-logs",
            json={"log_date": today.isoformat(), "mood_score": 8},
            headers=auth_headers,
        )
        log_id = create_response.json()["id"]

        # User 2 tries to access it
        response = client.get(
            f"/api/wellness/mood-logs/{log_id}", headers=auth_headers_2
        )

        assert response.status_code == status.HTTP_404_NOT_FOUND


class TestUpdateMoodLogEndpoint:
    """Tests for PUT /api/wellness/mood-logs/{log_id} endpoint."""

    def test_update_mood_log_success(self, client: TestClient, auth_headers: dict):
        """Test updating a mood log."""
        today = date.today()

        # Create a mood log
        create_response = client.post(
            "/api/wellness/mood-logs",
            json={"log_date": today.isoformat(), "mood_score": 7, "notes": "Original"},
            headers=auth_headers,
        )
        log_id = create_response.json()["id"]

        # Update the log
        update_data = {"mood_score": 9, "notes": "Updated note"}
        response = client.put(
            f"/api/wellness/mood-logs/{log_id}",
            json=update_data,
            headers=auth_headers,
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["mood_score"] == 9
        assert data["notes"] == "Updated note"

    def test_update_mood_log_partial(self, client: TestClient, auth_headers: dict):
        """Test partial update of mood log."""
        today = date.today()

        # Create a mood log
        create_response = client.post(
            "/api/wellness/mood-logs",
            json={"log_date": today.isoformat(), "mood_score": 6, "notes": "Original"},
            headers=auth_headers,
        )
        log_id = create_response.json()["id"]

        # Update only score
        update_data = {"mood_score": 8}
        response = client.put(
            f"/api/wellness/mood-logs/{log_id}",
            json=update_data,
            headers=auth_headers,
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["mood_score"] == 8
        assert data["notes"] == "Original"

    def test_update_mood_log_not_found(self, client: TestClient, auth_headers: dict):
        """Test updating non-existent mood log returns 404."""
        update_data = {"mood_score": 8}
        response = client.put(
            "/api/wellness/mood-logs/00000000-0000-0000-0000-000000000000",
            json=update_data,
            headers=auth_headers,
        )

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_update_mood_log_requires_authentication(self, client: TestClient):
        """Test that updating mood log requires authentication."""
        update_data = {"mood_score": 8}
        response = client.put(
            "/api/wellness/mood-logs/00000000-0000-0000-0000-000000000000",
            json=update_data,
        )

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_update_mood_log_user_isolation(
        self, client: TestClient, auth_headers: dict, auth_headers_2: dict
    ):
        """Test that users can only update their own mood logs."""
        today = date.today()

        # User 1 creates a log
        create_response = client.post(
            "/api/wellness/mood-logs",
            json={"log_date": today.isoformat(), "mood_score": 7},
            headers=auth_headers,
        )
        log_id = create_response.json()["id"]

        # User 2 tries to update it
        update_data = {"mood_score": 10}
        response = client.put(
            f"/api/wellness/mood-logs/{log_id}",
            json=update_data,
            headers=auth_headers_2,
        )

        assert response.status_code == status.HTTP_404_NOT_FOUND


class TestDeleteMoodLogEndpoint:
    """Tests for DELETE /api/wellness/mood-logs/{log_id} endpoint."""

    def test_delete_mood_log_success(self, client: TestClient, auth_headers: dict):
        """Test deleting a mood log."""
        today = date.today()

        # Create a mood log
        create_response = client.post(
            "/api/wellness/mood-logs",
            json={"log_date": today.isoformat(), "mood_score": 8},
            headers=auth_headers,
        )
        log_id = create_response.json()["id"]

        # Delete the log
        response = client.delete(
            f"/api/wellness/mood-logs/{log_id}", headers=auth_headers
        )

        assert response.status_code == status.HTTP_204_NO_CONTENT

        # Verify it's deleted
        get_response = client.get(
            f"/api/wellness/mood-logs/{log_id}", headers=auth_headers
        )
        assert get_response.status_code == status.HTTP_404_NOT_FOUND

    def test_delete_mood_log_not_found(self, client: TestClient, auth_headers: dict):
        """Test deleting non-existent mood log returns 404."""
        response = client.delete(
            "/api/wellness/mood-logs/00000000-0000-0000-0000-000000000000",
            headers=auth_headers,
        )

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_delete_mood_log_requires_authentication(self, client: TestClient):
        """Test that deleting mood log requires authentication."""
        response = client.delete(
            "/api/wellness/mood-logs/00000000-0000-0000-0000-000000000000"
        )

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_delete_mood_log_user_isolation(
        self, client: TestClient, auth_headers: dict, auth_headers_2: dict
    ):
        """Test that users can only delete their own mood logs."""
        today = date.today()

        # User 1 creates a log
        create_response = client.post(
            "/api/wellness/mood-logs",
            json={"log_date": today.isoformat(), "mood_score": 8},
            headers=auth_headers,
        )
        log_id = create_response.json()["id"]

        # User 2 tries to delete it
        response = client.delete(
            f"/api/wellness/mood-logs/{log_id}", headers=auth_headers_2
        )

        assert response.status_code == status.HTTP_404_NOT_FOUND

        # Verify it still exists for user 1
        get_response = client.get(
            f"/api/wellness/mood-logs/{log_id}", headers=auth_headers
        )
        assert get_response.status_code == status.HTTP_200_OK


class TestStressLogCRUDEndpoints:
    """Tests for stress log CRUD operations."""

    def test_get_stress_log_success(self, client: TestClient, auth_headers: dict):
        """Test retrieving a specific stress log."""
        today = date.today()

        create_response = client.post(
            "/api/wellness/stress-logs",
            json={"log_date": today.isoformat(), "stress_level": 6},
            headers=auth_headers,
        )
        log_id = create_response.json()["id"]

        response = client.get(
            f"/api/wellness/stress-logs/{log_id}", headers=auth_headers
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.json()["stress_level"] == 6

    def test_update_stress_log_success(self, client: TestClient, auth_headers: dict):
        """Test updating a stress log."""
        today = date.today()

        create_response = client.post(
            "/api/wellness/stress-logs",
            json={"log_date": today.isoformat(), "stress_level": 5},
            headers=auth_headers,
        )
        log_id = create_response.json()["id"]

        update_data = {"stress_level": 3}
        response = client.put(
            f"/api/wellness/stress-logs/{log_id}",
            json=update_data,
            headers=auth_headers,
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.json()["stress_level"] == 3

    def test_delete_stress_log_success(self, client: TestClient, auth_headers: dict):
        """Test deleting a stress log."""
        today = date.today()

        create_response = client.post(
            "/api/wellness/stress-logs",
            json={"log_date": today.isoformat(), "stress_level": 5},
            headers=auth_headers,
        )
        log_id = create_response.json()["id"]

        response = client.delete(
            f"/api/wellness/stress-logs/{log_id}", headers=auth_headers
        )

        assert response.status_code == status.HTTP_204_NO_CONTENT


class TestSleepLogCRUDEndpoints:
    """Tests for sleep log CRUD operations."""

    def test_get_sleep_log_success(self, client: TestClient, auth_headers: dict):
        """Test retrieving a specific sleep log."""
        today = date.today()

        create_response = client.post(
            "/api/wellness/sleep-logs",
            json={
                "log_date": today.isoformat(),
                "duration_hours": 7.5,
                "quality_score": 8,
            },
            headers=auth_headers,
        )
        log_id = create_response.json()["id"]

        response = client.get(
            f"/api/wellness/sleep-logs/{log_id}", headers=auth_headers
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.json()["duration_hours"] == 7.5

    def test_update_sleep_log_success(self, client: TestClient, auth_headers: dict):
        """Test updating a sleep log."""
        today = date.today()

        create_response = client.post(
            "/api/wellness/sleep-logs",
            json={
                "log_date": today.isoformat(),
                "duration_hours": 6.0,
                "quality_score": 6,
            },
            headers=auth_headers,
        )
        log_id = create_response.json()["id"]

        update_data = {"duration_hours": 8.0, "quality_score": 9}
        response = client.put(
            f"/api/wellness/sleep-logs/{log_id}",
            json=update_data,
            headers=auth_headers,
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["duration_hours"] == 8.0
        assert data["quality_score"] == 9

    def test_delete_sleep_log_success(self, client: TestClient, auth_headers: dict):
        """Test deleting a sleep log."""
        today = date.today()

        create_response = client.post(
            "/api/wellness/sleep-logs",
            json={
                "log_date": today.isoformat(),
                "duration_hours": 7.0,
                "quality_score": 7,
            },
            headers=auth_headers,
        )
        log_id = create_response.json()["id"]

        response = client.delete(
            f"/api/wellness/sleep-logs/{log_id}", headers=auth_headers
        )

        assert response.status_code == status.HTTP_204_NO_CONTENT
