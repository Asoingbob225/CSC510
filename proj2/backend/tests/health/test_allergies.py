"""Tests for allergy management."""

from unittest.mock import patch

from fastapi.testclient import TestClient

from src.eatsential.models import AllergenDB


def test_add_allergy(
    client: TestClient, auth_headers: dict[str, str], milk_allergen: AllergenDB
):
    """Test adding a new allergy."""
    # First, create a health profile
    client.post(
        "/api/health/profile",
        headers=auth_headers,
        json={"height_cm": 180, "weight_kg": 75, "activity_level": "moderate"},
    )

    # Then, add an allergy
    response = client.post(
        "/api/health/allergies",
        headers=auth_headers,
        json={"allergen_id": milk_allergen.id, "severity": "mild"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["allergen_id"] == milk_allergen.id
    assert data["severity"] == "mild"


def test_add_allergy_no_health_profile(
    client: TestClient, auth_headers: dict[str, str], milk_allergen: AllergenDB
):
    """Test adding an allergy to a health profile that doesn't exist."""
    response = client.post(
        "/api/health/allergies",
        headers=auth_headers,
        json={"allergen_id": milk_allergen.id, "severity": "mild"},
    )
    assert response.status_code == 400


def test_add_duplicate_allergy(
    client: TestClient, auth_headers: dict[str, str], milk_allergen: AllergenDB
):
    """Test adding a duplicate allergy."""
    client.post(
        "/api/health/profile",
        headers=auth_headers,
        json={"height_cm": 180, "weight_kg": 75, "activity_level": "moderate"},
    )
    client.post(
        "/api/health/allergies",
        headers=auth_headers,
        json={"allergen_id": milk_allergen.id, "severity": "mild"},
    )
    response = client.post(
        "/api/health/allergies",
        headers=auth_headers,
        json={"allergen_id": milk_allergen.id, "severity": "mild"},
    )
    assert response.status_code == 400


def test_update_allergy(
    client: TestClient, auth_headers: dict[str, str], milk_allergen: AllergenDB
):
    """Test updating an allergy."""
    # First, create a health profile and add an allergy
    client.post(
        "/api/health/profile",
        headers=auth_headers,
        json={"height_cm": 180, "weight_kg": 75, "activity_level": "moderate"},
    )
    response = client.post(
        "/api/health/allergies",
        headers=auth_headers,
        json={"allergen_id": milk_allergen.id, "severity": "mild"},
    )
    allergy_id = response.json()["id"]

    # Then, update the allergy
    response = client.put(
        f"/api/health/allergies/{allergy_id}",
        headers=auth_headers,
        json={"severity": "severe"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["severity"] == "severe"


def test_update_allergy_not_found(client: TestClient, auth_headers: dict[str, str]):
    """Test updating an allergy that doesn't exist."""
    response = client.put(
        "/api/health/allergies/invalid_id",
        headers=auth_headers,
        json={"severity": "severe"},
    )
    assert response.status_code == 404


def test_delete_allergy(
    client: TestClient, auth_headers: dict[str, str], milk_allergen: AllergenDB
):
    """Test deleting an allergy."""
    # First, create a health profile and add an allergy
    client.post(
        "/api/health/profile",
        headers=auth_headers,
        json={"height_cm": 180, "weight_kg": 75, "activity_level": "moderate"},
    )
    response = client.post(
        "/api/health/allergies",
        headers=auth_headers,
        json={"allergen_id": milk_allergen.id, "severity": "mild"},
    )
    allergy_id = response.json()["id"]

    # Then, delete the allergy
    response = client.delete(
        f"/api/health/allergies/{allergy_id}", headers=auth_headers
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Allergy deleted successfully"


def test_delete_allergy_not_found(client: TestClient, auth_headers: dict[str, str]):
    """Test deleting an allergy that doesn't exist."""
    response = client.delete("/api/health/allergies/invalid_id", headers=auth_headers)
    assert response.status_code == 404


def test_add_allergy_invalid_allergen_id(
    client: TestClient, auth_headers: dict[str, str]
):
    """Test adding an allergy with an invalid allergen id."""
    client.post(
        "/api/health/profile",
        headers=auth_headers,
        json={"height_cm": 180, "weight_kg": 75, "activity_level": "moderate"},
    )
    response = client.post(
        "/api/health/allergies",
        headers=auth_headers,
        json={"allergen_id": "invalid_id", "severity": "mild"},
    )
    assert response.status_code == 400


@patch("src.eatsential.routers.health.HealthProfileService.add_allergy")
def test_add_allergy_exception(
    mock_add, client: TestClient, auth_headers: dict[str, str]
):
    """Test exception when adding an allergen."""
    mock_add.side_effect = Exception("Database error")
    response = client.post(
        "/api/health/allergies",
        headers=auth_headers,
        json={"allergen_id": "milk_id", "severity": "mild"},
    )
    assert response.status_code == 500


@patch("src.eatsential.routers.health.HealthProfileService.update_allergy")
def test_update_allergy_exception(
    mock_update, client: TestClient, auth_headers: dict[str, str]
):
    """Test exception when updating an allergen."""
    mock_update.side_effect = Exception("Database error")
    response = client.put(
        "/api/health/allergies/some_id",
        headers=auth_headers,
        json={"severity": "severe"},
    )
    assert response.status_code == 500


@patch("src.eatsential.routers.health.HealthProfileService.delete_allergy")
def test_delete_allergy_exception(
    mock_delete, client: TestClient, auth_headers: dict[str, str]
):
    """Test exception when deleting an allergen."""
    mock_delete.side_effect = Exception("Database error")
    response = client.delete("/api/health/allergies/some_id", headers=auth_headers)
    assert response.status_code == 500
