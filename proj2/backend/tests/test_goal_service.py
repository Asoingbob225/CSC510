"""Unit tests for GoalService."""

import uuid
from datetime import date, timedelta

import pytest
from sqlalchemy.orm import Session

from src.eatsential.models.models import GoalStatus, GoalType, UserDB
from src.eatsential.schemas.schemas import GoalCreate, GoalUpdate
from src.eatsential.services.goal_service import GoalService


@pytest.fixture
def test_user(db: Session) -> UserDB:
    """Create a test user."""
    user = UserDB(
        id=str(uuid.uuid4()),
        email="testuser@example.com",
        username="testuser",
        password_hash="hashedpassword123",
        email_verified=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def test_user_2(db: Session) -> UserDB:
    """Create a second test user for isolation tests."""
    user = UserDB(
        id=str(uuid.uuid4()),
        email="testuser2@example.com",
        username="testuser2",
        password_hash="hashedpassword456",
        email_verified=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


class TestCreateGoal:
    """Tests for GoalService.create_goal."""

    def test_create_goal_success(self, db: Session, test_user: UserDB):
        """Test creating a goal successfully."""
        today = date.today()
        goal_data = GoalCreate(
            goal_type=GoalType.NUTRITION,
            target_type="daily_calories",
            target_value=2000.0,
            start_date=today,
            end_date=today + timedelta(days=30),
            notes="Track daily calorie intake",
        )

        goal = GoalService.create_goal(db, test_user.id, goal_data)

        assert goal.id is not None
        assert goal.user_id == test_user.id
        assert goal.goal_type == GoalType.NUTRITION.value
        assert goal.target_type == "daily_calories"
        assert float(goal.target_value) == 2000.0
        assert float(goal.current_value) == 0.0
        assert goal.start_date == today
        assert goal.end_date == today + timedelta(days=30)
        assert goal.status == GoalStatus.ACTIVE.value
        assert goal.notes == "Track daily calorie intake"

    def test_create_wellness_goal(self, db: Session, test_user: UserDB):
        """Test creating a wellness goal."""
        today = date.today()
        goal_data = GoalCreate(
            goal_type=GoalType.WELLNESS,
            target_type="weekly_meditation",
            target_value=7.0,
            start_date=today,
            end_date=today + timedelta(days=7),
        )

        goal = GoalService.create_goal(db, test_user.id, goal_data)

        assert goal.goal_type == GoalType.WELLNESS.value
        assert goal.target_type == "weekly_meditation"
        assert goal.notes is None

    def test_create_goal_with_future_start_date(self, db: Session, test_user: UserDB):
        """Test creating a goal with future start date."""
        today = date.today()
        goal_data = GoalCreate(
            goal_type=GoalType.NUTRITION,
            target_type="weekly_protein",
            target_value=700.0,
            start_date=today + timedelta(days=7),
            end_date=today + timedelta(days=14),
        )

        goal = GoalService.create_goal(db, test_user.id, goal_data)

        assert goal.start_date == today + timedelta(days=7)
        assert goal.status == GoalStatus.ACTIVE.value


class TestGetGoalById:
    """Tests for GoalService.get_goal_by_id."""

    def test_get_existing_goal(self, db: Session, test_user: UserDB):
        """Test retrieving an existing goal."""
        today = date.today()
        goal_data = GoalCreate(
            goal_type=GoalType.NUTRITION,
            target_type="daily_calories",
            target_value=2000.0,
            start_date=today,
            end_date=today + timedelta(days=30),
        )

        created_goal = GoalService.create_goal(db, test_user.id, goal_data)
        retrieved_goal = GoalService.get_goal_by_id(db, test_user.id, created_goal.id)

        assert retrieved_goal is not None
        assert retrieved_goal.id == created_goal.id
        assert retrieved_goal.user_id == test_user.id

    def test_get_nonexistent_goal(self, db: Session, test_user: UserDB):
        """Test retrieving a non-existent goal."""
        fake_goal_id = str(uuid.uuid4())
        goal = GoalService.get_goal_by_id(db, test_user.id, fake_goal_id)

        assert goal is None

    def test_get_goal_user_isolation(
        self, db: Session, test_user: UserDB, test_user_2: UserDB
    ):
        """Test that users cannot access other users' goals."""
        today = date.today()
        goal_data = GoalCreate(
            goal_type=GoalType.NUTRITION,
            target_type="daily_calories",
            target_value=2000.0,
            start_date=today,
            end_date=today + timedelta(days=30),
        )

        # Create goal for user 1
        goal = GoalService.create_goal(db, test_user.id, goal_data)

        # Try to retrieve with user 2's ID
        retrieved_goal = GoalService.get_goal_by_id(db, test_user_2.id, goal.id)

        assert retrieved_goal is None


class TestGetUserGoals:
    """Tests for GoalService.get_user_goals."""

    def test_get_user_goals_pagination(self, db: Session, test_user: UserDB):
        """Test pagination of user goals."""
        today = date.today()

        # Create multiple goals
        for i in range(5):
            goal_data = GoalCreate(
                goal_type=GoalType.NUTRITION,
                target_type=f"goal_{i}",
                target_value=float(2000 + i * 100),
                start_date=today,
                end_date=today + timedelta(days=30),
            )
            GoalService.create_goal(db, test_user.id, goal_data)

        # Get first page
        goals, total = GoalService.get_user_goals(db, test_user.id, skip=0, limit=3)

        assert total == 5
        assert len(goals) == 3

        # Get second page
        goals, total = GoalService.get_user_goals(db, test_user.id, skip=3, limit=3)

        assert total == 5
        assert len(goals) == 2

    def test_filter_by_goal_type(self, db: Session, test_user: UserDB):
        """Test filtering goals by type."""
        today = date.today()

        # Create nutrition goal
        nutrition_goal_data = GoalCreate(
            goal_type=GoalType.NUTRITION,
            target_type="daily_calories",
            target_value=2000.0,
            start_date=today,
            end_date=today + timedelta(days=30),
        )
        GoalService.create_goal(db, test_user.id, nutrition_goal_data)

        # Create wellness goal
        wellness_goal_data = GoalCreate(
            goal_type=GoalType.WELLNESS,
            target_type="daily_meditation",
            target_value=1.0,
            start_date=today,
            end_date=today + timedelta(days=30),
        )
        GoalService.create_goal(db, test_user.id, wellness_goal_data)

        # Filter by nutrition type
        goals, total = GoalService.get_user_goals(
            db, test_user.id, goal_type=GoalType.NUTRITION.value
        )

        assert total == 1
        assert goals[0].goal_type == GoalType.NUTRITION.value

    def test_filter_by_status(self, db: Session, test_user: UserDB):
        """Test filtering goals by status."""
        today = date.today()

        # Create active goal
        goal_data = GoalCreate(
            goal_type=GoalType.NUTRITION,
            target_type="daily_calories",
            target_value=2000.0,
            start_date=today,
            end_date=today + timedelta(days=30),
        )
        active_goal = GoalService.create_goal(db, test_user.id, goal_data)

        # Update to completed
        update_data = GoalUpdate(status=GoalStatus.COMPLETED)
        GoalService.update_goal(db, test_user.id, active_goal.id, update_data)

        # Create another active goal
        GoalService.create_goal(db, test_user.id, goal_data)

        # Filter by active status
        goals, total = GoalService.get_user_goals(
            db, test_user.id, status=GoalStatus.ACTIVE.value
        )

        assert total == 1
        assert goals[0].status == GoalStatus.ACTIVE.value

    def test_filter_by_date_range(self, db: Session, test_user: UserDB):
        """Test filtering goals by date range."""
        today = date.today()

        # Create goal starting today
        goal_data_1 = GoalCreate(
            goal_type=GoalType.NUTRITION,
            target_type="daily_calories",
            target_value=2000.0,
            start_date=today,
            end_date=today + timedelta(days=7),
        )
        GoalService.create_goal(db, test_user.id, goal_data_1)

        # Create goal starting next week
        goal_data_2 = GoalCreate(
            goal_type=GoalType.NUTRITION,
            target_type="weekly_protein",
            target_value=700.0,
            start_date=today + timedelta(days=14),
            end_date=today + timedelta(days=21),
        )
        GoalService.create_goal(db, test_user.id, goal_data_2)

        # Filter by start date
        goals, total = GoalService.get_user_goals(
            db, test_user.id, start_date=today + timedelta(days=10)
        )

        assert total == 1
        assert goals[0].target_type == "weekly_protein"

    def test_user_isolation(self, db: Session, test_user: UserDB, test_user_2: UserDB):
        """Test that users only see their own goals."""
        today = date.today()

        # Create goals for user 1
        goal_data = GoalCreate(
            goal_type=GoalType.NUTRITION,
            target_type="daily_calories",
            target_value=2000.0,
            start_date=today,
            end_date=today + timedelta(days=30),
        )
        GoalService.create_goal(db, test_user.id, goal_data)
        GoalService.create_goal(db, test_user.id, goal_data)

        # Create goal for user 2
        GoalService.create_goal(db, test_user_2.id, goal_data)

        # Get goals for user 1
        goals, total = GoalService.get_user_goals(db, test_user.id)

        assert total == 2
        assert all(goal.user_id == test_user.id for goal in goals)


class TestUpdateGoal:
    """Tests for GoalService.update_goal."""

    def test_update_goal_partial(self, db: Session, test_user: UserDB):
        """Test partial update of a goal."""
        today = date.today()
        goal_data = GoalCreate(
            goal_type=GoalType.NUTRITION,
            target_type="daily_calories",
            target_value=2000.0,
            start_date=today,
            end_date=today + timedelta(days=30),
        )

        goal = GoalService.create_goal(db, test_user.id, goal_data)

        # Update only current_value
        update_data = GoalUpdate(current_value=500.0)
        updated_goal = GoalService.update_goal(db, test_user.id, goal.id, update_data)

        assert updated_goal is not None
        assert float(updated_goal.current_value) == 500.0
        assert float(updated_goal.target_value) == 2000.0  # Unchanged

    def test_update_goal_status(self, db: Session, test_user: UserDB):
        """Test updating goal status."""
        today = date.today()
        goal_data = GoalCreate(
            goal_type=GoalType.NUTRITION,
            target_type="daily_calories",
            target_value=2000.0,
            start_date=today,
            end_date=today + timedelta(days=30),
        )

        goal = GoalService.create_goal(db, test_user.id, goal_data)

        # Update status to completed
        update_data = GoalUpdate(status=GoalStatus.COMPLETED)
        updated_goal = GoalService.update_goal(db, test_user.id, goal.id, update_data)

        assert updated_goal.status == GoalStatus.COMPLETED.value

    def test_update_goal_multiple_fields(self, db: Session, test_user: UserDB):
        """Test updating multiple fields at once."""
        today = date.today()
        goal_data = GoalCreate(
            goal_type=GoalType.NUTRITION,
            target_type="daily_calories",
            target_value=2000.0,
            start_date=today,
            end_date=today + timedelta(days=30),
        )

        goal = GoalService.create_goal(db, test_user.id, goal_data)

        # Update multiple fields
        update_data = GoalUpdate(
            target_value=2500.0,
            current_value=1200.0,
            notes="Updated goal with new targets",
        )
        updated_goal = GoalService.update_goal(db, test_user.id, goal.id, update_data)

        assert updated_goal is not None
        assert float(updated_goal.target_value) == 2500.0
        assert float(updated_goal.current_value) == 1200.0
        assert updated_goal.notes == "Updated goal with new targets"

    def test_update_nonexistent_goal(self, db: Session, test_user: UserDB):
        """Test updating a non-existent goal."""
        fake_goal_id = str(uuid.uuid4())
        update_data = GoalUpdate(current_value=100.0)

        updated_goal = GoalService.update_goal(
            db, test_user.id, fake_goal_id, update_data
        )

        assert updated_goal is None

    def test_update_goal_user_isolation(
        self, db: Session, test_user: UserDB, test_user_2: UserDB
    ):
        """Test that users cannot update other users' goals."""
        today = date.today()
        goal_data = GoalCreate(
            goal_type=GoalType.NUTRITION,
            target_type="daily_calories",
            target_value=2000.0,
            start_date=today,
            end_date=today + timedelta(days=30),
        )

        # Create goal for user 1
        goal = GoalService.create_goal(db, test_user.id, goal_data)

        # Try to update with user 2's ID
        update_data = GoalUpdate(current_value=999.0)
        updated_goal = GoalService.update_goal(db, test_user_2.id, goal.id, update_data)

        assert updated_goal is None

        # Verify original goal is unchanged
        original_goal = GoalService.get_goal_by_id(db, test_user.id, goal.id)
        assert float(original_goal.current_value) == 0.0


class TestDeleteGoal:
    """Tests for GoalService.delete_goal."""

    def test_delete_goal_success(self, db: Session, test_user: UserDB):
        """Test successfully deleting a goal."""
        today = date.today()
        goal_data = GoalCreate(
            goal_type=GoalType.NUTRITION,
            target_type="daily_calories",
            target_value=2000.0,
            start_date=today,
            end_date=today + timedelta(days=30),
        )

        goal = GoalService.create_goal(db, test_user.id, goal_data)
        goal_id = goal.id

        # Delete the goal
        success = GoalService.delete_goal(db, test_user.id, goal_id)

        assert success is True

        # Verify goal is deleted
        deleted_goal = GoalService.get_goal_by_id(db, test_user.id, goal_id)
        assert deleted_goal is None

    def test_delete_nonexistent_goal(self, db: Session, test_user: UserDB):
        """Test deleting a non-existent goal."""
        fake_goal_id = str(uuid.uuid4())

        success = GoalService.delete_goal(db, test_user.id, fake_goal_id)

        assert success is False

    def test_delete_goal_user_isolation(
        self, db: Session, test_user: UserDB, test_user_2: UserDB
    ):
        """Test that users cannot delete other users' goals."""
        today = date.today()
        goal_data = GoalCreate(
            goal_type=GoalType.NUTRITION,
            target_type="daily_calories",
            target_value=2000.0,
            start_date=today,
            end_date=today + timedelta(days=30),
        )

        # Create goal for user 1
        goal = GoalService.create_goal(db, test_user.id, goal_data)

        # Try to delete with user 2's ID
        success = GoalService.delete_goal(db, test_user_2.id, goal.id)

        assert success is False

        # Verify goal still exists for user 1
        existing_goal = GoalService.get_goal_by_id(db, test_user.id, goal.id)
        assert existing_goal is not None


class TestCalculateGoalProgress:
    """Tests for GoalService.calculate_goal_progress."""

    def test_calculate_progress_zero_current(self, db: Session, test_user: UserDB):
        """Test progress calculation with zero current value."""
        today = date.today()
        goal_data = GoalCreate(
            goal_type=GoalType.NUTRITION,
            target_type="daily_calories",
            target_value=2000.0,
            start_date=today,
            end_date=today + timedelta(days=30),
        )

        goal = GoalService.create_goal(db, test_user.id, goal_data)
        progress = GoalService.calculate_goal_progress(goal)

        assert progress == 0.0

    def test_calculate_progress_partial(self, db: Session, test_user: UserDB):
        """Test progress calculation with partial completion."""
        today = date.today()
        goal_data = GoalCreate(
            goal_type=GoalType.NUTRITION,
            target_type="daily_calories",
            target_value=2000.0,
            start_date=today,
            end_date=today + timedelta(days=30),
        )

        goal = GoalService.create_goal(db, test_user.id, goal_data)

        # Update current value to 50%
        update_data = GoalUpdate(current_value=1000.0)
        updated_goal = GoalService.update_goal(db, test_user.id, goal.id, update_data)

        progress = GoalService.calculate_goal_progress(updated_goal)

        assert progress == 50.0

    def test_calculate_progress_completed(self, db: Session, test_user: UserDB):
        """Test progress calculation at 100%."""
        today = date.today()
        goal_data = GoalCreate(
            goal_type=GoalType.NUTRITION,
            target_type="daily_calories",
            target_value=2000.0,
            start_date=today,
            end_date=today + timedelta(days=30),
        )

        goal = GoalService.create_goal(db, test_user.id, goal_data)

        # Update current value to 100%
        update_data = GoalUpdate(current_value=2000.0)
        updated_goal = GoalService.update_goal(db, test_user.id, goal.id, update_data)

        progress = GoalService.calculate_goal_progress(updated_goal)

        assert progress == 100.0

    def test_calculate_progress_exceeded(self, db: Session, test_user: UserDB):
        """Test progress calculation when exceeding target."""
        today = date.today()
        goal_data = GoalCreate(
            goal_type=GoalType.NUTRITION,
            target_type="daily_calories",
            target_value=2000.0,
            start_date=today,
            end_date=today + timedelta(days=30),
        )

        goal = GoalService.create_goal(db, test_user.id, goal_data)

        # Update current value beyond target
        update_data = GoalUpdate(current_value=2500.0)
        updated_goal = GoalService.update_goal(db, test_user.id, goal.id, update_data)

        progress = GoalService.calculate_goal_progress(updated_goal)

        # Should be capped at 100%
        assert progress == 100.0


class TestGetGoalsProgress:
    """Tests for GoalService.get_goals_progress."""

    def test_get_progress_for_multiple_goals(self, db: Session, test_user: UserDB):
        """Test getting progress for multiple goals."""
        today = date.today()

        # Create goals with different progress
        goal_data_1 = GoalCreate(
            goal_type=GoalType.NUTRITION,
            target_type="daily_calories",
            target_value=2000.0,
            start_date=today,
            end_date=today + timedelta(days=7),
        )
        goal_1 = GoalService.create_goal(db, test_user.id, goal_data_1)
        GoalService.update_goal(
            db, test_user.id, goal_1.id, GoalUpdate(current_value=1000.0)
        )

        goal_data_2 = GoalCreate(
            goal_type=GoalType.WELLNESS,
            target_type="weekly_meditation",
            target_value=7.0,
            start_date=today,
            end_date=today + timedelta(days=7),
        )
        goal_2 = GoalService.create_goal(db, test_user.id, goal_data_2)
        GoalService.update_goal(
            db, test_user.id, goal_2.id, GoalUpdate(current_value=5.0)
        )

        # Get progress for all goals
        progress_list = GoalService.get_goals_progress(db, test_user.id)

        assert len(progress_list) == 2
        assert progress_list[0]["completion_percentage"] == 50.0
        # Use float comparison with approx
        assert float(progress_list[1]["completion_percentage"]) == pytest.approx(
            71.43, rel=0.01
        )

    def test_get_progress_filtered_by_type(self, db: Session, test_user: UserDB):
        """Test filtering progress by goal type."""
        today = date.today()

        # Create nutrition goal
        nutrition_goal_data = GoalCreate(
            goal_type=GoalType.NUTRITION,
            target_type="daily_calories",
            target_value=2000.0,
            start_date=today,
            end_date=today + timedelta(days=30),
        )
        GoalService.create_goal(db, test_user.id, nutrition_goal_data)

        # Create wellness goal
        wellness_goal_data = GoalCreate(
            goal_type=GoalType.WELLNESS,
            target_type="daily_meditation",
            target_value=1.0,
            start_date=today,
            end_date=today + timedelta(days=30),
        )
        GoalService.create_goal(db, test_user.id, wellness_goal_data)

        # Get progress for nutrition goals only
        progress_list = GoalService.get_goals_progress(
            db, test_user.id, goal_type=GoalType.NUTRITION.value
        )

        assert len(progress_list) == 1
        assert progress_list[0]["goal_type"] == GoalType.NUTRITION.value

    def test_get_progress_with_days_remaining(self, db: Session, test_user: UserDB):
        """Test that days_remaining is calculated correctly."""
        today = date.today()

        goal_data = GoalCreate(
            goal_type=GoalType.NUTRITION,
            target_type="daily_calories",
            target_value=2000.0,
            start_date=today,
            end_date=today + timedelta(days=10),
        )
        GoalService.create_goal(db, test_user.id, goal_data)

        progress_list = GoalService.get_goals_progress(db, test_user.id)

        assert len(progress_list) == 1
        assert progress_list[0]["days_remaining"] == 10
