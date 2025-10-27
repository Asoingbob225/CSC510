"""Unit tests for Recommendation schema with explanation field (BE-S2-008)."""

from src.eatsential.schemas.schemas import (
    RecommendationItem,
    RecommendationResponse,
)


def test_recommendation_item_has_explanation_field():
    """Ensure RecommendationItem includes an explanation field."""
    item = RecommendationItem(
        menu_item_id="m_1",
        score=0.87,
        explanation="High protein, low allergen risk",
    )

    assert hasattr(item, "explanation")
    assert isinstance(item.explanation, str)
    assert item.explanation == "High protein, low allergen risk"


def test_recommendation_response_contains_explanation():
    """Ensure RecommendationResponse and items include an explanation field."""
    item = RecommendationItem(
        menu_item_id="m_1",
        score=0.87,
        explanation="High protein, low allergen risk",
    )
    resp = RecommendationResponse(user_id="u_1", recommendations=[item])

    assert isinstance(resp.recommendations, list)
    assert len(resp.recommendations) == 1
    assert resp.recommendations[0].explanation
    assert isinstance(resp.recommendations[0].explanation, str)
    assert resp.recommendations[0].explanation == "High protein, low allergen risk"


def test_recommendation_item_explanation_non_empty():
    """Ensure explanation is a non-empty string."""
    item = RecommendationItem(
        menu_item_id="m_2",
        score=0.92,
        explanation="Matches your dietary preferences",
    )

    assert item.explanation
    assert len(item.explanation) > 0
