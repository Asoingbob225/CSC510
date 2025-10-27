"""Recommendation API router (BE-S2-005)."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..db.database import get_db
from ..models import MenuItem, Restaurant, UserDB
from ..schemas.schemas import (
    RecommendationItem,
    RecommendationRequest,
    RecommendationResponse,
)

router = APIRouter(prefix="/recommend", tags=["recommendations"])


@router.post(
    "/meal", response_model=RecommendationResponse, status_code=status.HTTP_200_OK
)
def recommend_meal(
    request: RecommendationRequest,
    db: Session = Depends(get_db),
):
    """Recommend meals based on user profile and constraints (BE-S2-005).

    This is a minimal implementation with naive scoring.
    Future versions will include ML-based recommendations.

    Args:
        request: Recommendation request with user_id and optional constraints
        db: Database session dependency

    Returns:
        RecommendationResponse with list of recommended menu items

    Raises:
        HTTPException: 404 if user not found

    """
    # Verify user exists
    user = db.query(UserDB).filter(UserDB.id == request.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # Get all active menu items from active restaurants
    menu_items = db.query(MenuItem).join(Restaurant).filter(Restaurant.is_active).all()

    if not menu_items:
        return RecommendationResponse(
            user_id=request.user_id,
            recommendations=[],
        )

    # Simple scoring: prefer items with calories (more nutritional info)
    # Future: add allergy filtering, dietary preference matching, ML scoring
    recommendations = []
    for item in menu_items:
        # Naive score: 0.5 base + 0.3 if has calories + 0.2 if has price
        score = 0.5
        if item.calories is not None:
            score += 0.3
        if item.price is not None:
            score += 0.2

        explanation = f"Restaurant: {item.restaurant.name}"
        if item.calories:
            explanation += f", {item.calories:.0f} cal"

        recommendations.append(
            RecommendationItem(
                menu_item_id=item.id,
                score=score,
                explanation=explanation,
            )
        )

    # Sort by score descending, limit to top 10
    recommendations.sort(key=lambda x: x.score, reverse=True)
    recommendations = recommendations[:10]

    return RecommendationResponse(
        user_id=request.user_id,
        recommendations=recommendations,
    )
