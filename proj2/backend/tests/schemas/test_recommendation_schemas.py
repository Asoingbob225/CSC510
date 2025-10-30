"""Unit tests for the modern recommendation schema."""

from src.eatsential.schemas.recommendation_schemas import (
    RecommendationResponse,
    RecommendedItem,
)


def test_recommended_item_has_explanation_field():
    """Ensure RecommendedItem includes an explanation string."""
    item = RecommendedItem(
        item_id="m_1",
        name="Protein Power Bowl",
        score=0.87,
        explanation="High protein, low allergen risk",
    )

    assert hasattr(item, "explanation")
    assert isinstance(item.explanation, str)
    assert item.explanation == "High protein, low allergen risk"


def test_recommendation_response_contains_items():
    """Ensure RecommendationResponse wraps recommended items with explanations."""
    item = RecommendedItem(
        item_id="m_1",
        name="Protein Power Bowl",
        score=0.87,
        explanation="High protein, low allergen risk",
    )
    resp = RecommendationResponse(items=[item])

    assert isinstance(resp.items, list)
    assert len(resp.items) == 1
    assert resp.items[0].explanation
    assert isinstance(resp.items[0].explanation, str)
    assert resp.items[0].explanation == "High protein, low allergen risk"


def test_recommended_item_explanation_non_empty():
    """Ensure explanation is a non-empty string."""
    item = RecommendedItem(
        item_id="m_2",
        name="Gut Friendly Salad",
        score=0.92,
        explanation="Matches your dietary preferences",
    )

    assert item.explanation
    assert len(item.explanation) > 0
