"""Tests validating the structure of recommendation API responses.

This file validates edge cases and specific response structure requirements
that aren't covered in the general integration tests.
"""

from collections.abc import Iterator

import pytest
from sqlalchemy.orm import Session

from src.eatsential.models.models import MenuItem, Restaurant, UserDB
from tests.routers.conftest import create_auth_headers


@pytest.fixture
def minimal_menu_item(db: Session) -> Iterator[tuple[UserDB, MenuItem]]:
    """Create a minimal test case with one user and one menu item."""
    user = UserDB(
        id="rec_structure_user",
        email="structure@example.com",
        username="rec_structure",
        password_hash="hashed",
        email_verified=True,
    )
    restaurant = Restaurant(
        id="rec_structure_restaurant",
        name="Structure Cafe",
        cuisine=None,
        is_active=True,
    )
    db.add_all([user, restaurant])
    db.flush()

    menu_item = MenuItem(
        id="rec_structure_item",
        restaurant_id=restaurant.id,
        name="Structure Bowl",
        description=None,
        calories=320.0,
        price=9.75,
    )
    db.add(menu_item)
    db.commit()
    db.refresh(user)
    db.refresh(menu_item)
    yield user, menu_item


def test_recommendation_response_minimal_data(
    client, minimal_menu_item: tuple[UserDB, MenuItem]
) -> None:
    """Verify response structure with minimal data (no cuisine, no description)."""
    user, menu_item = minimal_menu_item

    response = client.post(
        "/api/recommend/meal",
        headers=create_auth_headers(user),
        json={},
    )

    assert response.status_code == 200
    payload = response.json()
    assert set(payload.keys()) == {"items"}
    assert len(payload["items"]) > 0

    first_item = payload["items"][0]
    # Verify all required fields are present
    assert {"item_id", "name", "score", "explanation"} <= set(first_item.keys())
    assert first_item["item_id"] == menu_item.id
    assert first_item["name"] == menu_item.name
    assert isinstance(first_item["score"], float)
    assert 0.0 <= first_item["score"] <= 1.0
    assert isinstance(first_item["explanation"], str)
    assert first_item["explanation"], "Explanation should not be empty"


def test_recommendation_empty_result_structure(client, rec_test_user) -> None:
    """Verify response structure when no items match filters."""
    # No menu items in DB, should return empty list
    response = client.post(
        "/api/recommend/meal",
        headers=create_auth_headers(rec_test_user),
        json={},
    )

    assert response.status_code == 200
    payload = response.json()
    assert "items" in payload
    assert isinstance(payload["items"], list)
    # May be empty if no menu items exist
    assert all(isinstance(item.get("score"), float) for item in payload["items"])
