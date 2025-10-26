"""Goal tracking service for CRUD operations."""

import uuid
from datetime import date
from typing import Optional

from sqlalchemy import and_, desc
from sqlalchemy.orm import Session

from ..models.models import GoalDB, GoalStatus
from ..schemas.schemas import GoalCreate, GoalUpdate


class GoalService:
    """Service class for goal tracking operations"""

    @staticmethod
    def create_goal(db: Session, user_id: str, goal_data: GoalCreate) -> GoalDB:
        """Create a new goal.

        Args:
            db: Database session
            user_id: User ID
            goal_data: Goal creation data

        Returns:
            Created goal database object

        """
        # Create goal record
        db_goal = GoalDB(
            id=str(uuid.uuid4()),
            user_id=user_id,
            goal_type=goal_data.goal_type.value,
            target_type=goal_data.target_type,
            target_value=goal_data.target_value,
            current_value=0,
            start_date=goal_data.start_date,
            end_date=goal_data.end_date,
            status=GoalStatus.ACTIVE.value,
            notes=goal_data.notes,
        )

        db.add(db_goal)
        db.commit()
        db.refresh(db_goal)

        return db_goal

    @staticmethod
    def get_goal_by_id(db: Session, user_id: str, goal_id: str) -> Optional[GoalDB]:
        """Get a goal by ID.

        Args:
            db: Database session
            user_id: User ID for authorization
            goal_id: Goal ID

        Returns:
            Goal database object or None if not found

        """
        return (
            db.query(GoalDB)
            .filter(and_(GoalDB.id == goal_id, GoalDB.user_id == user_id))
            .first()
        )

    @staticmethod
    def get_user_goals(
        db: Session,
        user_id: str,
        skip: int = 0,
        limit: int = 100,
        goal_type: Optional[str] = None,
        status: Optional[str] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
    ) -> tuple[list[GoalDB], int]:
        """Get user's goals with optional filters.

        Args:
            db: Database session
            user_id: User ID
            skip: Number of records to skip (for pagination)
            limit: Maximum number of records to return
            goal_type: Optional goal type filter
            status: Optional status filter
            start_date: Optional start date filter (goals starting on or after this date)
            end_date: Optional end date filter (goals ending on or before this date)

        Returns:
            Tuple of (list of goals, total count)

        """
        # Build query with filters
        query = db.query(GoalDB).filter(GoalDB.user_id == user_id)

        if goal_type:
            query = query.filter(GoalDB.goal_type == goal_type)

        if status:
            query = query.filter(GoalDB.status == status)

        if start_date:
            query = query.filter(GoalDB.start_date >= start_date)

        if end_date:
            query = query.filter(GoalDB.end_date <= end_date)

        # Get total count
        total = query.count()

        # Apply pagination and ordering
        goals = query.order_by(desc(GoalDB.created_at)).offset(skip).limit(limit).all()

        return goals, total

    @staticmethod
    def update_goal(
        db: Session, user_id: str, goal_id: str, goal_data: GoalUpdate
    ) -> Optional[GoalDB]:
        """Update a goal.

        Args:
            db: Database session
            user_id: User ID for authorization
            goal_id: Goal ID
            goal_data: Goal update data

        Returns:
            Updated goal database object or None if not found

        """
        db_goal = GoalService.get_goal_by_id(db, user_id, goal_id)

        if not db_goal:
            return None

        # Update fields if provided
        update_data = goal_data.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            if field == "status" and value:
                setattr(db_goal, field, value.value)
            else:
                setattr(db_goal, field, value)

        db.commit()
        db.refresh(db_goal)

        return db_goal

    @staticmethod
    def delete_goal(db: Session, user_id: str, goal_id: str) -> bool:
        """Delete a goal.

        Args:
            db: Database session
            user_id: User ID for authorization
            goal_id: Goal ID

        Returns:
            True if deleted, False if not found

        """
        db_goal = GoalService.get_goal_by_id(db, user_id, goal_id)

        if not db_goal:
            return False

        db.delete(db_goal)
        db.commit()

        return True

    @staticmethod
    def calculate_goal_progress(goal: GoalDB) -> float:
        """Calculate goal completion percentage.

        Args:
            goal: Goal database object

        Returns:
            Completion percentage (0-100)

        """
        if goal.target_value <= 0:
            return 0.0

        percentage = (goal.current_value / goal.target_value) * 100
        return min(percentage, 100.0)

    @staticmethod
    def get_goals_progress(
        db: Session,
        user_id: str,
        goal_type: Optional[str] = None,
        status: Optional[str] = None,
    ) -> list[dict]:
        """Get progress statistics for user's goals.

        Args:
            db: Database session
            user_id: User ID
            goal_type: Optional goal type filter
            status: Optional status filter

        Returns:
            List of goal progress dictionaries

        """
        # Build query with filters
        query = db.query(GoalDB).filter(GoalDB.user_id == user_id)

        if goal_type:
            query = query.filter(GoalDB.goal_type == goal_type)

        if status:
            query = query.filter(GoalDB.status == status)

        goals = query.all()

        # Calculate progress for each goal
        progress_list = []
        today = date.today()

        for goal in goals:
            completion_percentage = GoalService.calculate_goal_progress(goal)
            days_remaining = (goal.end_date - today).days

            progress_list.append(
                {
                    "goal_id": goal.id,
                    "goal_type": goal.goal_type,
                    "target_type": goal.target_type,
                    "target_value": float(goal.target_value),
                    "current_value": float(goal.current_value),
                    "completion_percentage": completion_percentage,
                    "status": goal.status,
                    "days_remaining": days_remaining,
                }
            )

        return progress_list
