"""Recommendation API endpoints for meals and restaurants."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..db.database import get_db
from ..models.models import UserDB
from ..schemas.schemas import (
    RecommendationItem,
    RecommendationRequest,
    RecommendationResponse,
)
from ..services.recommend_service import RecommendService

router = APIRouter(prefix="/recommend", tags=["recommendations"])


def _load_user(db: Session, user_id: str) -> UserDB:
    user = db.query(UserDB).filter(UserDB.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return user


def _to_response(
    user_id: str,
    items: list[RecommendationItem],
) -> RecommendationResponse:
    return RecommendationResponse(user_id=user_id, recommendations=items)


@router.post(
    "/meal",
    response_model=RecommendationResponse,
    status_code=status.HTTP_200_OK,
)
def recommend_meal(
    request: RecommendationRequest,
    db: Session = Depends(get_db),
) -> RecommendationResponse:
    """Return personalized meal recommendations using the legacy scorer."""
    _load_user(db, request.user_id)

    legacy_service = RecommendService(db)
    recommendations = legacy_service.recommend_meals(
        user_id=request.user_id,
        constraints=request.constraints,
    )
    return _to_response(request.user_id, recommendations)


@router.post(
    "/restaurant",
    response_model=RecommendationResponse,
    status_code=status.HTTP_200_OK,
)
def recommend_restaurant(
    request: RecommendationRequest,
    db: Session = Depends(get_db),
) -> RecommendationResponse:
    """Return restaurant recommendations using the legacy scorer."""
    _load_user(db, request.user_id)

    legacy_service = RecommendService(db)
    recommendations = legacy_service.recommend_meals(
        user_id=request.user_id,
        constraints=request.constraints,
    )
    return _to_response(request.user_id, recommendations)
