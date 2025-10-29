"""Tests for single daily entry enforcement in wellness tracking.

This test suite validates FR-077, FR-078, FR-079 requirement that users
can only create one wellness log entry per day per metric type.

Test Coverage:
- Duplicate prevention for mood logs
- Duplicate prevention for stress logs
- Duplicate prevention for sleep logs
- Multiple day entries allowed
- Update existing entries allowed

Related Requirements: FR-077, FR-078, FR-079
Test Level: Integration Test
"""

from datetime import date, timedelta

import pytest
from fastapi import status
from fastapi.testclient import TestClient

from src.eatsential.models.models import UserDB
from src.eatsential.utils.auth_util import create_access_token


@pytest.fixture
def test_user(db) -> UserDB:
    """Create a test user for wellness tests."""
    user = UserDB(
        id="wellness_test_user_id",
        email="wellness_test@example.com",
        username="wellness_test_user",
        password_hash="hashed_password",
        email_verified=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def auth_headers(test_user: UserDB) -> dict[str, str]:
    """Get authentication headers for the test user."""
    access_token = create_access_token(data={"sub": test_user.id})
    return {"Authorization": f"Bearer {access_token}"}


def test_duplicate_mood_log_same_day(client: TestClient, auth_headers: dict):
    """Test that creating duplicate mood logs for the same day is prevented.
    
    Test Case ID: TC-WELL-001
    Requirement: FR-077 (Daily Mood Logging)
    Priority: High
    
    Steps:
    1. Create first mood log for today
    2. Attempt to create second mood log for same day
    3. Verify 409 Conflict response
    4. Verify error message contains "already exists"
    """
    today = date.today().isoformat()

    mood_data = {"log_date": today, "mood_score": 8, "notes": "Feeling great"}

    # Create first mood log - should succeed
    response = client.post(
        "/api/wellness/mood-logs", json=mood_data, headers=auth_headers
    )
    assert response.status_code == status.HTTP_201_CREATED
    first_log = response.json()
    assert first_log["log_date"] == today
    assert first_log["mood_score"] == 8

    # Try to create another mood log for the same day - should fail with 409
    mood_data_2 = {"log_date": today, "mood_score": 6, "notes": "Feeling okay"}
    response = client.post(
        "/api/wellness/mood-logs", json=mood_data_2, headers=auth_headers
    )
    assert response.status_code == status.HTTP_409_CONFLICT
    assert "already exists" in response.json()["detail"]


def test_duplicate_stress_log_same_day(client: TestClient, auth_headers: dict):
    """Test that creating duplicate stress logs for the same day is prevented.
    
    Test Case ID: TC-WELL-002
    Requirement: FR-078 (Stress Level Tracking)
    Priority: High
    
    Steps:
    1. Create first stress log for today
    2. Attempt to create second stress log for same day
    3. Verify 409 Conflict response
    4. Verify error message contains "already exists"
    """
    today = date.today().isoformat()

    stress_data = {
        "log_date": today,
        "stress_level": 5,
        "triggers": "Work",
        "notes": "Moderate stress",
    }

    # Create first stress log - should succeed
    response = client.post(
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
    response = client.post(
        "/api/wellness/stress-logs", json=stress_data_2, headers=auth_headers
    )
    assert response.status_code == status.HTTP_409_CONFLICT
    assert "already exists" in response.json()["detail"]


def test_duplicate_sleep_log_same_day(client: TestClient, auth_headers: dict):
    """Test that creating duplicate sleep logs for the same day is prevented.
    
    Test Case ID: TC-WELL-003
    Requirement: FR-079 (Sleep Tracking)
    Priority: High
    
    Steps:
    1. Create first sleep log for today
    2. Attempt to create second sleep log for same day
    3. Verify 409 Conflict response
    4. Verify error message contains "already exists"
    """
    today = date.today().isoformat()

    sleep_data = {
        "log_date": today,
        "duration_hours": 7.5,
        "quality_score": 8,
        "notes": "Slept well",
    }

    # Create first sleep log - should succeed
    response = client.post(
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
    response = client.post(
        "/api/wellness/sleep-logs", json=sleep_data_2, headers=auth_headers
    )
    assert response.status_code == status.HTTP_409_CONFLICT
    assert "already exists" in response.json()["detail"]


def test_different_days_allowed(client: TestClient, auth_headers: dict):
    """Test that creating logs for different days is allowed.
    
    Test Case ID: TC-WELL-004
    Requirement: FR-077 (Daily Mood Logging)
    Priority: Medium
    
    Steps:
    1. Create mood log for yesterday
    2. Create mood log for today
    3. Verify both succeed
    4. Verify both logs exist in database
    """
    today = date.today()
    yesterday = (today - timedelta(days=1)).isoformat()
    today_str = today.isoformat()

    # Create mood log for yesterday
    mood_data_yesterday = {
        "log_date": yesterday,
        "mood_score": 7,
        "notes": "Yesterday's mood",
    }
    response = client.post(
        "/api/wellness/mood-logs", json=mood_data_yesterday, headers=auth_headers
    )
    assert response.status_code == status.HTTP_201_CREATED

    # Create mood log for today - should succeed
    mood_data_today = {
        "log_date": today_str,
        "mood_score": 8,
        "notes": "Today's mood",
    }
    response = client.post(
        "/api/wellness/mood-logs", json=mood_data_today, headers=auth_headers
    )
    assert response.status_code == status.HTTP_201_CREATED
    # Verify both logs exist
    response = client.get("/api/wellness/logs", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    mood_logs = data.get("mood_logs", [])
    assert len(mood_logs) >= 2  # Should have at least 2 mood logs (yesterday and today)

def test_update_existing_log_allowed(client: TestClient, auth_headers: dict):
    """Test that updating an existing log for a day is allowed.
    
    Test Case ID: TC-WELL-005
    Requirement: FR-077 (Daily Mood Logging - Update)
    Priority: High
    
    Steps:
    1. Create mood log
    2. Update the log with new values
    3. Verify update succeeds
    4. Verify updated values are persisted
    """
    today = date.today().isoformat()

    # Create mood log
    mood_data = {"log_date": today, "mood_score": 7, "notes": "Initial mood"}
    response = client.post(
        "/api/wellness/mood-logs", json=mood_data, headers=auth_headers
    )
    assert response.status_code == status.HTTP_201_CREATED
    log_id = response.json()["id"]

    # Update the log
    update_data = {"mood_score": 9, "notes": "Updated mood"}
    response = client.put(
        f"/api/wellness/mood-logs/{log_id}", json=update_data, headers=auth_headers
    )
    assert response.status_code == 200
    updated_log = response.json()
    assert updated_log["mood_score"] == 9
    assert updated_log["notes"] == "Updated mood"
