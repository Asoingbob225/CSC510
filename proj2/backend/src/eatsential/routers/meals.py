"""API routes for meal logging."""

from datetime import datetime
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..db.database import get_db
from ..services.auth_service import get_current_user
from ..schemas.schemas import (
    MealCreate,
    MealListResponse,
    MealResponse,
    MealUpdate,
    UserResponse,
)
from ..services.meal_service import MealService

router = APIRouter(prefix="/meals", tags=["meals"])


@router.post("", response_model=MealResponse, status_code=status.HTTP_201_CREATED)
def create_meal(
    meal_data: MealCreate,
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """Create a new meal log.

    Args:
        meal_data: Meal creation data
        current_user: Authenticated user
        db: Database session

    Returns:
        Created meal

    Raises:
        HTTPException: If creation fails
    """
    try:
        meal = MealService.create_meal(db, current_user.id, meal_data)
        return meal
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create meal: {str(e)}",
        )


@router.get("", response_model=MealListResponse)
def get_meals(
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    meal_type: Optional[str] = Query(None, description="Filter by meal type"),
    start_date: Optional[datetime] = Query(None, description="Filter start date"),
    end_date: Optional[datetime] = Query(None, description="Filter end date"),
):
    """Get user's meal logs with optional filters.

    Args:
        current_user: Authenticated user
        db: Database session
        page: Page number (1-indexed)
        page_size: Items per page
        meal_type: Optional meal type filter
        start_date: Optional start date filter
        end_date: Optional end date filter

    Returns:
        Paginated list of meals
    """
    skip = (page - 1) * page_size

    meals, total = MealService.get_user_meals(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=page_size,
        meal_type=meal_type,
        start_date=start_date,
        end_date=end_date,
    )

    return MealListResponse(
        meals=meals,
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/{meal_id}", response_model=MealResponse)
def get_meal(
    meal_id: str,
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """Get a specific meal log by ID.

    Args:
        meal_id: Meal ID
        current_user: Authenticated user
        db: Database session

    Returns:
        Meal details

    Raises:
        HTTPException: If meal not found
    """
    meal = MealService.get_meal_by_id(db, current_user.id, meal_id)

    if not meal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meal not found",
        )

    return meal


@router.put("/{meal_id}", response_model=MealResponse)
def update_meal(
    meal_id: str,
    meal_data: MealUpdate,
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """Update an existing meal log.

    Args:
        meal_id: Meal ID
        meal_data: Meal update data
        current_user: Authenticated user
        db: Database session

    Returns:
        Updated meal

    Raises:
        HTTPException: If meal not found or update fails
    """
    meal = MealService.update_meal(db, current_user.id, meal_id, meal_data)

    if not meal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meal not found",
        )

    return meal


@router.delete("/{meal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_meal(
    meal_id: str,
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """Delete a meal log.

    Args:
        meal_id: Meal ID
        current_user: Authenticated user
        db: Database session

    Raises:
        HTTPException: If meal not found
    """
    success = MealService.delete_meal(db, current_user.id, meal_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meal not found",
        )
