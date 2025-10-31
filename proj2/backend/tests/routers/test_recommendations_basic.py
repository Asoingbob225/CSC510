"""Basic integration tests for the recommendation API."""

from sqlalchemy.orm import Session

from src.eatsential.models import MenuItem
from tests.routers.conftest import create_auth_headers


def test_recommend_meal_limit_top_results(
    client, db: Session, rec_test_user, rec_test_menu_items
):
    """The endpoint should cap the number of returned items."""
    # Add additional menu items to exceed the max results threshold
    for i in range(12):
        db.add(
            MenuItem(
                id=f"item_extra_{i}",
                restaurant_id="rec_test_restaurant",
                name=f"Extra Item {i}",
                description="Additional option",
                calories=300.0 + i,
                price=11.0 + i,
            )
        )
    db.commit()

    response = client.post(
        "/api/recommend/meal",
        headers=create_auth_headers(rec_test_user),
        json={},
    )

    assert response.status_code == 200
    items = response.json()["items"]
    # Should be limited to 5 items
    assert len(items) <= 5
    # Items should be sorted by score
    scores = [item["score"] for item in items]
    assert scores == sorted(scores, reverse=True)
