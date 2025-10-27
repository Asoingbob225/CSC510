"""Meal recommendation API router with health profile integration.

This router provides the /api/recommend/meal endpoint that:
- Accepts user ID and contextual data
- Queries the recommendation service with user's health profile
- Returns personalized meal suggestions with explanations

Future: Will integrate with LLM/RAG pipeline for advanced recommendations.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..db.database import get_db
from ..schemas.schemas import RecommendationRequest, RecommendationResponse
from ..services.recommend_service import RecommendService

router = APIRouter(prefix="/recommend", tags=["recommendations"])


@router.post(
    "/meal", response_model=RecommendationResponse, status_code=status.HTTP_200_OK
)
def recommend_meal(
    request: RecommendationRequest,
    db: Session = Depends(get_db),
):
    """Generate personalized meal recommendations based on user profile and constraints.

    This endpoint queries the user's health profile, dietary preferences, and allergies
    to provide personalized meal suggestions. The recommendation engine applies scoring
    based on nutritional fit and user context.

    Future enhancement: Will integrate LLM/RAG pipeline for semantic matching and
    advanced recommendation logic.

    Args:
        request: RecommendationRequest containing:
            - user_id: User to generate recommendations for
            - constraints: Optional dict with filters (max_calories, max_price, etc.)
        db: Database session dependency

    Returns:
        RecommendationResponse with:
            - user_id: User the recommendations are for
            - recommendations: List of RecommendationItem objects with:
                - menu_item_id: ID of recommended menu item
                - score: Recommendation score (0-1)
                - explanation: Human-readable explanation

    Raises:
        HTTPException:
            - 404: User not found
            - 500: Internal server error during recommendation generation

    Example:
        Request:
        ```json
        {
            "user_id": "user_123",
            "constraints": {
                "max_calories": 600,
                "max_price": 15.00
            }
        }
        ```

        Response:
        ```json
        {
            "user_id": "user_123",
            "recommendations": [
                {
                    "menu_item_id": "item_456",
                    "score": 0.95,
                    "explanation": "Restaurant: Healthy Eats, 450 cal, $12.50"
                }
            ]
        }
        ```

    """
    # Initialize recommendation service
    service = RecommendService(db)

    try:
        # Generate recommendations
        recommendations = service.recommend_meals(
            user_id=request.user_id,
            constraints=request.constraints or {},
            limit=10,
        )

        return RecommendationResponse(
            user_id=request.user_id,
            recommendations=recommendations,
        )

    except ValueError as e:
        # User not found or invalid input
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except Exception as e:
        # Unexpected error during recommendation generation
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating recommendations: {e!s}",
        )
