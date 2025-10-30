"""Basic integration tests for the recommendation API using the LLM engine."""

from collections.abc import Iterator
from typing import Any

import pytest
from sqlalchemy.orm import Session

from src.eatsential.models import MenuItem, Restaurant, UserDB
from src.eatsential.utils.auth_util import create_access_token


def _auth_headers(user: UserDB) -> dict[str, str]:
    """Build authorization headers for a given user."""
    token = create_access_token(data={"sub": user.id})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def test_user(db: Session) -> Iterator[UserDB]:
    """Persist a test user for recommendation tests."""
    user = UserDB(
        id="rec_basic_user",
        email="rec_basic@example.com",
        username="rec_basic",
        password_hash="hashed_password",
        email_verified=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    yield user


@pytest.fixture
def test_restaurant_data(db: Session, test_user: UserDB) -> Iterator[dict[str, Any]]:
    """Create a restaurant and menu items for recommendation scenarios."""
    restaurant = Restaurant(
        id="rest_basic",
        name="Healthy Eats",
        cuisine="Healthy",
        is_active=True,
    )
    db.add(restaurant)
    db.flush()

    items = [
        MenuItem(
            id="item_basic_salad",
            restaurant_id=restaurant.id,
            name="Grilled Chicken Salad",
            description="Lean protein with greens",
            calories=350.0,
            price=12.99,
        ),
        MenuItem(
            id="item_basic_quinoa",
            restaurant_id=restaurant.id,
            name="Quinoa Bowl",
            description="Plant based protein option",
            calories=420.0,
            price=10.50,
        ),
        MenuItem(
            id="item_basic_blank",
            restaurant_id=restaurant.id,
            name="Mystery Dish",
            description="Chef special",
            calories=None,
            price=None,
        ),
    ]
    db.add_all(items)
    db.commit()
    yield {"restaurant": restaurant, "items": items}


def test_recommend_meal_happy_path(client, test_user, test_restaurant_data):
    """Ensure the endpoint returns LLM-formatted items for an authenticated user."""
    response = client.post(
        "/api/recommend/meal",
        headers=_auth_headers(test_user),
        json={},
    )

    assert response.status_code == 200
    data = response.json()

    assert "items" in data
    assert isinstance(data["items"], list)
    assert len(data["items"]) > 0

    first_item = data["items"][0]
    assert {"item_id", "name", "score", "explanation"} <= set(first_item)
    assert isinstance(first_item["score"], float)
    assert 0.0 <= first_item["score"] <= 1.0


def test_recommend_meal_requires_auth(client):
    """Requests without authentication should be rejected."""
    response = client.post("/api/recommend/meal", json={})
    assert response.status_code == 403


def test_recommend_meal_returns_sorted_scores(client, test_user, test_restaurant_data):
    """Scores should be returned in descending order."""
    response = client.post(
        "/api/recommend/meal",
        headers=_auth_headers(test_user),
        json={},
    )

    assert response.status_code == 200
    scores = [item["score"] for item in response.json()["items"]]
    assert scores == sorted(scores, reverse=True)


def test_recommend_meal_price_filter_excludes_high_cost_items(
    client, test_user, test_restaurant_data
):
    """Applying a strict price filter should eliminate items outside the range."""
    response = client.post(
        "/api/recommend/meal",
        headers=_auth_headers(test_user),
        json={"mode": "baseline", "filters": {"price_range": "$"}},
    )

    assert response.status_code == 200
    items = response.json()["items"]
    assert len(items) == 1
    assert items[0]["item_id"] == "item_basic_blank"


def test_recommend_meal_limit_top_results(
    client, db: Session, test_user, test_restaurant_data
):
    """The endpoint should cap the number of returned items."""
    # Add additional menu items to exceed the max results threshold.
    for i in range(12):
        db.add(
            MenuItem(
                id=f"item_extra_{i}",
                restaurant_id="rest_basic",
                name=f"Extra Item {i}",
                description="Additional option",
                calories=300.0 + i,
                price=11.0 + i,
            )
        )
    db.commit()

    response = client.post(
        "/api/recommend/meal",
        headers=_auth_headers(test_user),
        json={},
    )

    assert response.status_code == 200
    assert len(response.json()["items"]) <= 5
