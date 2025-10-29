"""Tests for single daily entry enforcement in wellness tracking."""

from datetime import date

import pytest
from fastapi import status
from fastapi.testclient import TestClient

from src.eatsential.models.models import MoodLogDB, SleepLogDB, StressLogDB


def test_duplicate_mood_log_same_day(test_client: TestClient, auth_headers: dict):
    """Test that creating duplicate mood logs for the same day is prevented."""
    today = date.today().isoformat()

    mood_data = {"log_date": today, "mood_score": 8, "notes": "Feeling great"}

    # Create first mood log - should succeed
    response = test_client.post(
        "/api/wellness/mood-logs", json=mood_data, headers=auth_headers
    )
    assert response.status_code == status.HTTP_201_CREATED
    first_log = response.json()
    assert first_log["log_date"] == today
    assert first_log["mood_score"] == 8

    # Try to create another mood log for the same day - should fail with 409
    mood_data_2 = {"log_date": today, "mood_score": 6, "notes": "Feeling okay"}
    response = test_client.post(
        "/api/wellness/mood-logs", json=mood_data_2, headers=auth_headers
    )
    assert response.status_code == status.HTTP_409_CONFLICT
    assert "already exists" in response.json()["detail"]


def test_duplicate_stress_log_same_day(test_client: TestClient, auth_headers: dict):
    """Test that creating duplicate stress logs for the same day is prevented."""
    today = date.today().isoformat()

    stress_data = {
        "log_date": today,
        "stress_level": 5,
        "triggers": "Work",
        "notes": "Moderate stress",
    }

    # Create first stress log - should succeed
    response = test_client.post(
        "/api/wellness/stress-logs", json=stress_data, headers=auth_headers
    )
    assert response.status_code == status.HTTP_201_CREATED
    first_log = response.json()
    assert first_log["log_date"] == today
    assert first_log["stress_level"] == 5

    # Try to create another stress log for the same day - should fail with 409
    stress_data_2 = {
        "log_date": today,
        "stress_level": 7,
        "triggers": "Traffic",
        "notes": "High stress",
    }
    response = test_client.post(
        "/api/wellness/stress-logs", json=stress_data_2, headers=auth_headers
    )
    assert response.status_code == status.HTTP_409_CONFLICT
    assert "already exists" in response.json()["detail"]


def test_duplicate_sleep_log_same_day(test_client: TestClient, auth_headers: dict):
    """Test that creating duplicate sleep logs for the same day is prevented."""
    today = date.today().isoformat()

    sleep_data = {
        "log_date": today,
        "duration_hours": 7.5,
        "quality_score": 8,
        "notes": "Slept well",
    }

    # Create first sleep log - should succeed
    response = test_client.post(
        "/api/wellness/sleep-logs", json=sleep_data, headers=auth_headers
    )
    assert response.status_code == status.HTTP_201_CREATED
    first_log = response.json()
    assert first_log["log_date"] == today
    assert first_log["duration_hours"] == 7.5
    assert first_log["quality_score"] == 8

    # Try to create another sleep log for the same day - should fail with 409
    sleep_data_2 = {
        "log_date": today,
        "duration_hours": 6.0,
        "quality_score": 5,
        "notes": "Different sleep record",
    }
    response = test_client.post(
        "/api/wellness/sleep-logs", json=sleep_data_2, headers=auth_headers
    )
    assert response.status_code == status.HTTP_409_CONFLICT
    assert "already exists" in response.json()["detail"]


def test_different_days_allowed(test_client: TestClient, auth_headers: dict):
    """Test that creating logs for different days is allowed."""
    from datetime import timedelta

    today = date.today()
    yesterday = (today - timedelta(days=1)).isoformat()
    today_str = today.isoformat()

    # Create mood log for yesterday
    mood_data_yesterday = {
        "log_date": yesterday,
        "mood_score": 7,
        "notes": "Yesterday's mood",
    }
    response = test_client.post(
        "/api/wellness/mood-logs", json=mood_data_yesterday, headers=auth_headers
    )
    assert response.status_code == status.HTTP_201_CREATED

    # Create mood log for today - should succeed
    mood_data_today = {
        "log_date": today_str,
        "mood_score": 8,
        "notes": "Today's mood",
    }
    response = test_client.post(
        "/api/wellness/mood-logs", json=mood_data_today, headers=auth_headers
    )
    assert response.status_code == status.HTTP_201_CREATED

    # Verify both logs exist
    response = test_client.get("/api/wellness/logs", headers=auth_headers)
    assert response.status_code == status.HTTP_200
    mood_logs = [
        log
        for log in response.json()
        if log.get("mood_score") is not None and log["mood_score"] > 0
    ]
    assert len(mood_logs) >= 2


def test_update_existing_log_allowed(test_client: TestClient, auth_headers: dict):
    """Test that updating an existing log for a day is allowed."""
    today = date.today().isoformat()

    # Create mood log
    mood_data = {"log_date": today, "mood_score": 7, "notes": "Initial mood"}
    response = test_client.post(
        "/api/wellness/mood-logs", json=mood_data, headers=auth_headers
    )
    assert response.status_code == status.HTTP_201_CREATED
    log_id = response.json()["id"]

    # Update the log
    update_data = {"mood_score": 9, "notes": "Updated mood"}
    response = test_client.put(
        f"/api/wellness/mood-logs/{log_id}", json=update_data, headers=auth_headers
    )
    assert response.status_code == status.HTTP_200
    updated_log = response.json()
    assert updated_log["mood_score"] == 9
    assert updated_log["notes"] == "Updated mood"
