"""Recommendation API endpoints for meals and restaurants."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..db.database import get_db
from ..models.models import UserDB
from ..schemas.recommendation_schemas import (
    RecommendationRequest,
    RecommendationResponse,
)
from ..services.auth_service import get_current_user
from ..services.engine import RecommendationService

router = APIRouter(prefix="/recommend", tags=["recommendations"])


@router.post(
    "/meal",
    response_model=RecommendationResponse,
    status_code=status.HTTP_200_OK,
)
def recommend_meal(
    request: RecommendationRequest,
    current_user: Annotated[UserDB, Depends(get_current_user)],
    db: Session = Depends(get_db),
) -> RecommendationResponse:
    """Return personalized meal recommendations for the authenticated user."""
    service = RecommendationService(db)

    try:
        return service.get_meal_recommendations(user=current_user, request=request)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unable to generate meal recommendations: {exc!s}",
        ) from exc


@router.post(
    "/restaurant",
    response_model=RecommendationResponse,
    status_code=status.HTTP_200_OK,
)
def recommend_restaurant(
    request: RecommendationRequest,
    current_user: Annotated[UserDB, Depends(get_current_user)],
    db: Session = Depends(get_db),
) -> RecommendationResponse:
    """Return personalized restaurant recommendations for the authenticated user."""
    service = RecommendationService(db)

    try:
        return service.get_restaurant_recommendations(
            user=current_user,
            request=request,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unable to generate restaurant recommendations: {exc!s}",
        ) from exc
