"""Tests for dietary preference management."""

from unittest.mock import patch

from fastapi.testclient import TestClient


def test_add_dietary_preference(client: TestClient, auth_headers: dict[str, str]):
    """Test adding a new dietary preference."""
    # First, create a health profile
    client.post(
        "/api/health/profile",
        headers=auth_headers,
        json={"height_cm": 180, "weight_kg": 75, "activity_level": "moderate"},
    )

    # Then, add a dietary preference
    response = client.post(
        "/api/health/dietary-preferences",
        headers=auth_headers,
        json={"preference_type": "diet", "preference_name": "vegetarian"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["preference_type"] == "diet"
    assert data["preference_name"] == "vegetarian"


def test_add_dietary_preference_no_health_profile(
    client: TestClient, auth_headers: dict[str, str]
):
    """Test adding a dietary preference to a health profile that doesn't exist."""
    response = client.post(
        "/api/health/dietary-preferences",
        headers=auth_headers,
        json={"preference_type": "diet", "preference_name": "vegetarian"},
    )
    assert response.status_code == 400


def test_add_duplicate_dietary_preference(
    client: TestClient, auth_headers: dict[str, str]
):
    """Test adding a duplicate dietary preference."""
    client.post(
        "/api/health/profile",
        headers=auth_headers,
        json={"height_cm": 180, "weight_kg": 75, "activity_level": "moderate"},
    )
    client.post(
        "/api/health/dietary-preferences",
        headers=auth_headers,
        json={"preference_type": "diet", "preference_name": "vegetarian"},
    )
    response = client.post(
        "/api/health/dietary-preferences",
        headers=auth_headers,
        json={"preference_type": "diet", "preference_name": "vegetarian"},
    )
    assert response.status_code == 400


def test_update_dietary_preference(client: TestClient, auth_headers: dict[str, str]):
    """Test updating a dietary preference."""
    # First, create a health profile and add a preference
    client.post(
        "/api/health/profile",
        headers=auth_headers,
        json={"height_cm": 180, "weight_kg": 75, "activity_level": "moderate"},
    )
    response = client.post(
        "/api/health/dietary-preferences",
        headers=auth_headers,
        json={"preference_type": "diet", "preference_name": "vegetarian"},
    )
    preference_id = response.json()["id"]

    # Then, update the preference
    response = client.put(
        f"/api/health/dietary-preferences/{preference_id}",
        headers=auth_headers,
        json={"preference_name": "vegan"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["preference_name"] == "vegan"


def test_update_dietary_preference_not_found(
    client: TestClient, auth_headers: dict[str, str]
):
    """Test updating a dietary preference that doesn't exist."""
    response = client.put(
        "/api/health/dietary-preferences/invalid_id",
        headers=auth_headers,
        json={"preference_name": "vegan"},
    )
    assert response.status_code == 404


def test_delete_dietary_preference(client: TestClient, auth_headers: dict[str, str]):
    """Test deleting a dietary preference."""
    # First, create a health profile and add a preference
    client.post(
        "/api/health/profile",
        headers=auth_headers,
        json={"height_cm": 180, "weight_kg": 75, "activity_level": "moderate"},
    )
    response = client.post(
        "/api/health/dietary-preferences",
        headers=auth_headers,
        json={"preference_type": "diet", "preference_name": "vegetarian"},
    )
    preference_id = response.json()["id"]

    # Then, delete the preference
    response = client.delete(
        f"/api/health/dietary-preferences/{preference_id}", headers=auth_headers
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Dietary preference deleted successfully"


def test_delete_dietary_preference_not_found(
    client: TestClient, auth_headers: dict[str, str]
):
    """Test deleting a dietary preference that doesn't exist."""
    response = client.delete(
        "/api/health/dietary-preferences/invalid_id", headers=auth_headers
    )
    assert response.status_code == 404


@patch("src.eatsential.routers.health.HealthProfileService.add_dietary_preference")
def test_add_dietary_preference_exception(
    mock_add, client: TestClient, auth_headers: dict[str, str]
):
    """Test exception when adding a dietary preference."""
    mock_add.side_effect = Exception("Database error")
    response = client.post(
        "/api/health/dietary-preferences",
        headers=auth_headers,
        json={"preference_type": "diet", "preference_name": "vegetarian"},
    )
    assert response.status_code == 500


@patch("src.eatsential.routers.health.HealthProfileService.update_dietary_preference")
def test_update_dietary_preference_exception(
    mock_update, client: TestClient, auth_headers: dict[str, str]
):
    """Test exception when updating a dietary preference."""
    mock_update.side_effect = Exception("Database error")
    response = client.put(
        "/api/health/dietary-preferences/some_id",
        headers=auth_headers,
        json={"preference_name": "vegan"},
    )
    assert response.status_code == 500


@patch("src.eatsential.routers.health.HealthProfileService.delete_dietary_preference")
def test_delete_dietary_preference_exception(
    mock_delete, client: TestClient, auth_headers: dict[str, str]
):
    """Test exception when deleting a dietary preference."""
    mock_delete.side_effect = Exception("Database error")
    response = client.delete(
        "/api/health/dietary-preferences/some_id", headers=auth_headers
    )
    assert response.status_code == 500
