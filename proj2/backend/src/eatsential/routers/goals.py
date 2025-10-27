"""API routes for goal tracking."""

from datetime import date
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..db.database import get_db
from ..schemas.schemas import (
    GoalCreate,
    GoalListResponse,
    GoalProgressResponse,
    GoalResponse,
    GoalUpdate,
    UserResponse,
)
from ..services.auth_service import get_current_user
from ..services.goal_service import GoalService

router = APIRouter(prefix="/goals", tags=["goals"])


@router.post("", response_model=GoalResponse, status_code=status.HTTP_201_CREATED)
def create_goal(
    goal_data: GoalCreate,
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """Create a new goal.

    Args:
        goal_data: Goal creation data
        current_user: Authenticated user
        db: Database session

    Returns:
        Created goal

    Raises:
        HTTPException: If creation fails

    """
    try:
        goal = GoalService.create_goal(db, current_user.id, goal_data)
        return goal
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create goal: {e!s}",
        )


@router.get("", response_model=GoalListResponse)
def get_goals(
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    goal_type: Optional[str] = Query(None, description="Filter by goal type"),
    status: Optional[str] = Query(None, description="Filter by status"),
    start_date: Optional[date] = Query(None, description="Filter by start date"),
    end_date: Optional[date] = Query(None, description="Filter by end date"),
):
    """Get user's goals with optional filters.

    Args:
        current_user: Authenticated user
        db: Database session
        page: Page number (1-indexed)
        page_size: Items per page
        goal_type: Optional goal type filter
        status: Optional status filter
        start_date: Optional start date filter
        end_date: Optional end date filter

    Returns:
        Paginated list of goals

    """
    skip = (page - 1) * page_size

    goals, total = GoalService.get_user_goals(
        db,
        current_user.id,
        skip=skip,
        limit=page_size,
        goal_type=goal_type,
        status=status,
        start_date=start_date,
        end_date=end_date,
    )

    return GoalListResponse(goals=goals, total=total, page=page, page_size=page_size)


@router.get("/progress", response_model=list[GoalProgressResponse])
def get_goals_progress(
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    db: Session = Depends(get_db),
    goal_type: Optional[str] = Query(None, description="Filter by goal type"),
    status: Optional[str] = Query(None, description="Filter by status"),
):
    """Get progress statistics for user's goals.

    Args:
        current_user: Authenticated user
        db: Database session
        goal_type: Optional goal type filter
        status: Optional status filter

    Returns:
        List of goal progress statistics

    """
    progress_list = GoalService.get_goals_progress(
        db, current_user.id, goal_type=goal_type, status=status
    )

    return progress_list


@router.get("/{goal_id}", response_model=GoalResponse)
def get_goal(
    goal_id: str,
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """Get a specific goal by ID.

    Args:
        goal_id: Goal ID
        current_user: Authenticated user
        db: Database session

    Returns:
        Goal details

    Raises:
        HTTPException: If goal not found

    """
    goal = GoalService.get_goal_by_id(db, current_user.id, goal_id)

    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found"
        )

    return goal


@router.put("/{goal_id}", response_model=GoalResponse)
def update_goal(
    goal_id: str,
    goal_data: GoalUpdate,
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """Update a goal.

    Args:
        goal_id: Goal ID
        goal_data: Goal update data
        current_user: Authenticated user
        db: Database session

    Returns:
        Updated goal

    Raises:
        HTTPException: If goal not found or update fails

    """
    try:
        goal = GoalService.update_goal(db, current_user.id, goal_id, goal_data)

        if not goal:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found"
            )

        return goal
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update goal: {e!s}",
        )


@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_goal(
    goal_id: str,
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """Delete a goal.

    Args:
        goal_id: Goal ID
        current_user: Authenticated user
        db: Database session

    Raises:
        HTTPException: If goal not found

    """
    success = GoalService.delete_goal(db, current_user.id, goal_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found"
        )
