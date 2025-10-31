"""Integration tests for the LLM-enabled recommendation API."""

from tests.routers.conftest import create_auth_headers


def test_recommend_meal_api_success(client, rec_test_user, rec_test_menu_items):
    """Ensure the endpoint returns results for an authenticated request."""
    response = client.post(
        "/api/recommend/meal",
        headers=create_auth_headers(rec_test_user),
        json={},
    )

    assert response.status_code == 200
    payload = response.json()
    assert "items" in payload
    assert len(payload["items"]) > 0


def test_recommend_meal_api_with_health_profile(
    client, rec_user_with_profile, rec_test_menu_items
):
    """Verify recommendations remain sorted when user health context is present."""
    response = client.post(
        "/api/recommend/meal",
        headers=create_auth_headers(rec_user_with_profile),
        json={},
    )

    assert response.status_code == 200
    items = response.json()["items"]
    assert items
    # Items should be sorted by score descending
    assert items == sorted(items, key=lambda item: item["score"], reverse=True)


def test_recommend_meal_api_price_filter(client, rec_test_user, rec_test_menu_items):
    """Ensure price filters work correctly with baseline mode."""
    response = client.post(
        "/api/recommend/meal",
        headers=create_auth_headers(rec_test_user),
        json={"mode": "baseline", "filters": {"price_range": "$"}},
    )

    assert response.status_code == 200
    items = response.json()["items"]
    # Only budget meal (with None price) should pass $ filter
    assert len(items) == 1
    assert items[0]["item_id"] == "rec_item_budget"


def test_recommend_meal_api_cuisine_filter(client, rec_test_user, rec_test_menu_items):
    """Confirm cuisine filters keep relevant results."""
    response = client.post(
        "/api/recommend/meal",
        headers=create_auth_headers(rec_test_user),
        json={"filters": {"cuisine": ["Healthy"]}},
    )

    assert response.status_code == 200
    items = response.json()["items"]
    assert items
    assert all(isinstance(item["explanation"], str) for item in items)


def test_recommend_meal_requires_authentication(client):
    """Requests without authentication should be rejected."""
    response = client.post("/api/recommend/meal", json={})
    assert response.status_code == 403


def test_recommend_meal_returns_valid_structure(
    client, rec_test_user, rec_test_menu_items
):
    """Verify all response items have required fields."""
    response = client.post(
        "/api/recommend/meal",
        headers=create_auth_headers(rec_test_user),
        json={},
    )

    assert response.status_code == 200
    items = response.json()["items"]
    assert len(items) > 0

    for item in items:
        assert {"item_id", "name", "score", "explanation"} <= set(item.keys())
        assert isinstance(item["score"], float)
        assert 0.0 <= item["score"] <= 1.0
        assert isinstance(item["explanation"], str)
        assert item["explanation"]  # Not empty
