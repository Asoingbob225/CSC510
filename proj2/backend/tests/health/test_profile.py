"""Tests for health profile CRUD operations."""

from unittest.mock import patch

from fastapi.testclient import TestClient


def test_create_health_profile(client: TestClient, auth_headers: dict[str, str]):
    """Test creating a new health profile."""
    response = client.post(
        "/api/health/profile",
        headers=auth_headers,
        json={"height_cm": 180, "weight_kg": 75, "activity_level": "moderate"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["height_cm"] == 180
    assert data["weight_kg"] == 75
    assert data["activity_level"] == "moderate"


def test_create_health_profile_already_exists(
    client: TestClient, auth_headers: dict[str, str]
):
    """Test creating a health profile when one already exists."""
    client.post(
        "/api/health/profile",
        headers=auth_headers,
        json={"height_cm": 180, "weight_kg": 75, "activity_level": "moderate"},
    )
    response = client.post(
        "/api/health/profile",
        headers=auth_headers,
        json={"height_cm": 180, "weight_kg": 75, "activity_level": "moderate"},
    )
    assert response.status_code == 400


def test_get_health_profile(client: TestClient, auth_headers: dict[str, str]):
    """Test getting a health profile."""
    # First, create a profile
    client.post(
        "/api/health/profile",
        headers=auth_headers,
        json={"height_cm": 180, "weight_kg": 75, "activity_level": "moderate"},
    )

    # Then, get the profile
    response = client.get("/api/health/profile", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["height_cm"] == 180


def test_get_health_profile_not_found(client: TestClient, auth_headers: dict[str, str]):
    """Test getting a health profile that doesn't exist."""
    response = client.get("/api/health/profile", headers=auth_headers)
    assert response.status_code == 404


def test_update_health_profile(client: TestClient, auth_headers: dict[str, str]):
    """Test updating a health profile."""
    # First, create a profile
    client.post(
        "/api/health/profile",
        headers=auth_headers,
        json={"height_cm": 180, "weight_kg": 75, "activity_level": "moderate"},
    )

    # Then, update the profile
    response = client.put(
        "/api/health/profile",
        headers=auth_headers,
        json={"height_cm": 182, "weight_kg": 76},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["height_cm"] == 182
    assert data["weight_kg"] == 76


def test_update_health_profile_not_found(
    client: TestClient, auth_headers: dict[str, str]
):
    """Test updating a health profile that doesn't exist."""
    response = client.put(
        "/api/health/profile",
        headers=auth_headers,
        json={"height_cm": 182, "weight_kg": 76},
    )
    assert response.status_code == 404


def test_delete_health_profile(client: TestClient, auth_headers: dict[str, str]):
    """Test deleting a health profile."""
    # First, create a profile
    client.post(
        "/api/health/profile",
        headers=auth_headers,
        json={"height_cm": 180, "weight_kg": 75, "activity_level": "moderate"},
    )

    # Then, delete the profile
    response = client.delete("/api/health/profile", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["message"] == "Health profile deleted successfully"

    # Verify it's deleted
    response = client.get("/api/health/profile", headers=auth_headers)
    assert response.status_code == 404


def test_delete_health_profile_not_found(
    client: TestClient, auth_headers: dict[str, str]
):
    """Test deleting a health profile that doesn't exist."""
    response = client.delete("/api/health/profile", headers=auth_headers)
    assert response.status_code == 404


def test_create_health_profile_invalid_data(
    client: TestClient, auth_headers: dict[str, str]
):
    """Test creating a health profile with invalid data."""
    response = client.post(
        "/api/health/profile",
        headers=auth_headers,
        json={"height_cm": -180, "weight_kg": 75, "activity_level": "moderate"},
    )
    assert response.status_code == 422


@patch("src.eatsential.routers.health.HealthProfileService.create_health_profile")
def test_create_health_profile_exception(
    mock_create, client: TestClient, auth_headers: dict[str, str]
):
    """Test exception when creating a health profile."""
    mock_create.side_effect = Exception("Database error")
    response = client.post(
        "/api/health/profile",
        headers=auth_headers,
        json={"height_cm": 180, "weight_kg": 75, "activity_level": "moderate"},
    )
    assert response.status_code == 500


@patch("src.eatsential.routers.health.HealthProfileService.get_health_profile")
def test_get_health_profile_exception(
    mock_get, client: TestClient, auth_headers: dict[str, str]
):
    """Test exception when getting a health profile."""
    mock_get.side_effect = Exception("Database error")
    response = client.get("/api/health/profile", headers=auth_headers)
    assert response.status_code == 500


@patch("src.eatsential.routers.health.HealthProfileService.update_health_profile")
def test_update_health_profile_exception(
    mock_update, client: TestClient, auth_headers: dict[str, str]
):
    """Test exception when updating a health profile."""
    mock_update.side_effect = Exception("Database error")
    response = client.put(
        "/api/health/profile",
        headers=auth_headers,
        json={"height_cm": 182, "weight_kg": 76},
    )
    assert response.status_code == 500


@patch("src.eatsential.routers.health.HealthProfileService.delete_health_profile")
def test_delete_health_profile_exception(
    mock_delete, client: TestClient, auth_headers: dict[str, str]
):
    """Test exception when deleting a health profile."""
    mock_delete.side_effect = Exception("Database error")
    response = client.delete("/api/health/profile", headers=auth_headers)
    assert response.status_code == 500
