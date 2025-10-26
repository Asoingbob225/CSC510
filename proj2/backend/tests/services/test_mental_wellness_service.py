"""Unit tests for MentalWellnessService."""

import uuid
from datetime import date, timedelta

import pytest
from sqlalchemy.orm import Session

from src.eatsential.models.models import UserDB
from src.eatsential.schemas.schemas import (
    MoodLogCreate,
    MoodLogUpdate,
    SleepLogCreate,
    SleepLogUpdate,
    StressLogCreate,
    StressLogUpdate,
)
from src.eatsential.services.mental_wellness_service import MentalWellnessService
from src.eatsential.utils.security import decrypt_sensitive_data


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


class TestLogMood:
    """Tests for MentalWellnessService.log_mood."""

    def test_log_mood_success(self, db: Session, test_user: UserDB):
        """Test logging a mood successfully."""
        today = date.today()
        mood_data = MoodLogCreate(
            log_date=today, mood_score=8, notes="Feeling great today!"
        )

        mood_log = MentalWellnessService.log_mood(db, test_user.id, mood_data)

        assert mood_log.id is not None
        assert mood_log.user_id == test_user.id
        assert mood_log.log_date == today
        assert int(mood_log.mood_score) == 8
        assert mood_log.encrypted_notes is not None
        # Verify notes are encrypted
        decrypted = decrypt_sensitive_data(mood_log.encrypted_notes)
        assert decrypted == "Feeling great today!"

    def test_log_mood_without_notes(self, db: Session, test_user: UserDB):
        """Test logging mood without notes."""
        today = date.today()
        mood_data = MoodLogCreate(log_date=today, mood_score=7)

        mood_log = MentalWellnessService.log_mood(db, test_user.id, mood_data)

        assert mood_log.encrypted_notes is None

    def test_log_mood_min_score(self, db: Session, test_user: UserDB):
        """Test logging mood with minimum score (1)."""
        today = date.today()
        mood_data = MoodLogCreate(log_date=today, mood_score=1)

        mood_log = MentalWellnessService.log_mood(db, test_user.id, mood_data)

        assert int(mood_log.mood_score) == 1

    def test_log_mood_max_score(self, db: Session, test_user: UserDB):
        """Test logging mood with maximum score (10)."""
        today = date.today()
        mood_data = MoodLogCreate(log_date=today, mood_score=10)

        mood_log = MentalWellnessService.log_mood(db, test_user.id, mood_data)

        assert int(mood_log.mood_score) == 10


class TestLogStress:
    """Tests for MentalWellnessService.log_stress."""

    def test_log_stress_success(self, db: Session, test_user: UserDB):
        """Test logging stress successfully."""
        today = date.today()
        stress_data = StressLogCreate(
            log_date=today,
            stress_level=6,
            triggers="Work deadline",
            notes="Tight deadline approaching",
        )

        stress_log = MentalWellnessService.log_stress(db, test_user.id, stress_data)

        assert stress_log.id is not None
        assert stress_log.user_id == test_user.id
        assert stress_log.log_date == today
        assert int(stress_log.stress_level) == 6
        assert stress_log.encrypted_triggers is not None
        assert stress_log.encrypted_notes is not None
        # Verify encryption
        decrypted_triggers = decrypt_sensitive_data(stress_log.encrypted_triggers)
        decrypted_notes = decrypt_sensitive_data(stress_log.encrypted_notes)
        assert decrypted_triggers == "Work deadline"
        assert decrypted_notes == "Tight deadline approaching"

    def test_log_stress_without_notes(self, db: Session, test_user: UserDB):
        """Test logging stress without notes."""
        today = date.today()
        stress_data = StressLogCreate(
            log_date=today, stress_level=5, triggers="Traffic"
        )

        stress_log = MentalWellnessService.log_stress(db, test_user.id, stress_data)

        assert stress_log.encrypted_triggers is not None
        assert stress_log.encrypted_notes is None

    def test_log_stress_without_triggers(self, db: Session, test_user: UserDB):
        """Test logging stress without triggers."""
        today = date.today()
        stress_data = StressLogCreate(
            log_date=today, stress_level=4, notes="General anxiety"
        )

        stress_log = MentalWellnessService.log_stress(db, test_user.id, stress_data)

        assert stress_log.encrypted_triggers is None
        assert stress_log.encrypted_notes is not None


class TestLogSleep:
    """Tests for MentalWellnessService.log_sleep."""

    def test_log_sleep_success(self, db: Session, test_user: UserDB):
        """Test logging sleep successfully."""
        today = date.today()
        sleep_data = SleepLogCreate(
            log_date=today,
            duration_hours=7.5,
            quality_score=8,
            notes="Good night's sleep",
        )

        sleep_log = MentalWellnessService.log_sleep(db, test_user.id, sleep_data)

        assert sleep_log.id is not None
        assert sleep_log.user_id == test_user.id
        assert sleep_log.log_date == today
        assert float(sleep_log.duration_hours) == 7.5
        assert int(sleep_log.quality_score) == 8
        assert sleep_log.encrypted_notes is not None
        # Verify encryption
        decrypted = decrypt_sensitive_data(sleep_log.encrypted_notes)
        assert decrypted == "Good night's sleep"

    def test_log_sleep_without_notes(self, db: Session, test_user: UserDB):
        """Test logging sleep without notes."""
        today = date.today()
        sleep_data = SleepLogCreate(log_date=today, duration_hours=6.0, quality_score=7)

        sleep_log = MentalWellnessService.log_sleep(db, test_user.id, sleep_data)

        assert sleep_log.encrypted_notes is None

    def test_log_sleep_short_duration(self, db: Session, test_user: UserDB):
        """Test logging short sleep duration."""
        today = date.today()
        sleep_data = SleepLogCreate(log_date=today, duration_hours=4.0, quality_score=4)

        sleep_log = MentalWellnessService.log_sleep(db, test_user.id, sleep_data)

        assert float(sleep_log.duration_hours) == 4.0

    def test_log_sleep_long_duration(self, db: Session, test_user: UserDB):
        """Test logging long sleep duration."""
        today = date.today()
        sleep_data = SleepLogCreate(
            log_date=today, duration_hours=10.0, quality_score=9
        )

        sleep_log = MentalWellnessService.log_sleep(db, test_user.id, sleep_data)

        assert float(sleep_log.duration_hours) == 10.0


class TestGetMoodLogById:
    """Tests for MentalWellnessService.get_mood_log_by_id."""

    def test_get_mood_log_success(self, db: Session, test_user: UserDB):
        """Test retrieving a mood log by ID."""
        today = date.today()
        mood_data = MoodLogCreate(log_date=today, mood_score=7, notes="Test note")
        mood_log = MentalWellnessService.log_mood(db, test_user.id, mood_data)

        retrieved = MentalWellnessService.get_mood_log_by_id(
            db, test_user.id, mood_log.id
        )

        assert retrieved is not None
        assert retrieved.id == mood_log.id
        assert retrieved.user_id == test_user.id

    def test_get_mood_log_not_found(self, db: Session, test_user: UserDB):
        """Test retrieving non-existent mood log returns None."""
        fake_id = str(uuid.uuid4())

        retrieved = MentalWellnessService.get_mood_log_by_id(db, test_user.id, fake_id)

        assert retrieved is None

    def test_get_mood_log_different_user(
        self, db: Session, test_user: UserDB, test_user_2: UserDB
    ):
        """Test user isolation - cannot access another user's mood log."""
        today = date.today()
        mood_data = MoodLogCreate(log_date=today, mood_score=8)
        mood_log = MentalWellnessService.log_mood(db, test_user.id, mood_data)

        # Try to access with different user
        retrieved = MentalWellnessService.get_mood_log_by_id(
            db, test_user_2.id, mood_log.id
        )

        assert retrieved is None


class TestGetStressLogById:
    """Tests for MentalWellnessService.get_stress_log_by_id."""

    def test_get_stress_log_success(self, db: Session, test_user: UserDB):
        """Test retrieving a stress log by ID."""
        today = date.today()
        stress_data = StressLogCreate(
            log_date=today, stress_level=5, triggers="Test trigger"
        )
        stress_log = MentalWellnessService.log_stress(db, test_user.id, stress_data)

        retrieved = MentalWellnessService.get_stress_log_by_id(
            db, test_user.id, stress_log.id
        )

        assert retrieved is not None
        assert retrieved.id == stress_log.id
        assert retrieved.user_id == test_user.id

    def test_get_stress_log_user_isolation(
        self, db: Session, test_user: UserDB, test_user_2: UserDB
    ):
        """Test user isolation for stress logs."""
        today = date.today()
        stress_data = StressLogCreate(log_date=today, stress_level=6)
        stress_log = MentalWellnessService.log_stress(db, test_user.id, stress_data)

        retrieved = MentalWellnessService.get_stress_log_by_id(
            db, test_user_2.id, stress_log.id
        )

        assert retrieved is None


class TestGetSleepLogById:
    """Tests for MentalWellnessService.get_sleep_log_by_id."""

    def test_get_sleep_log_success(self, db: Session, test_user: UserDB):
        """Test retrieving a sleep log by ID."""
        today = date.today()
        sleep_data = SleepLogCreate(log_date=today, duration_hours=7.0, quality_score=8)
        sleep_log = MentalWellnessService.log_sleep(db, test_user.id, sleep_data)

        retrieved = MentalWellnessService.get_sleep_log_by_id(
            db, test_user.id, sleep_log.id
        )

        assert retrieved is not None
        assert retrieved.id == sleep_log.id
        assert retrieved.user_id == test_user.id

    def test_get_sleep_log_user_isolation(
        self, db: Session, test_user: UserDB, test_user_2: UserDB
    ):
        """Test user isolation for sleep logs."""
        today = date.today()
        sleep_data = SleepLogCreate(log_date=today, duration_hours=6.0, quality_score=6)
        sleep_log = MentalWellnessService.log_sleep(db, test_user.id, sleep_data)

        retrieved = MentalWellnessService.get_sleep_log_by_id(
            db, test_user_2.id, sleep_log.id
        )

        assert retrieved is None


class TestGetWellnessLogs:
    """Tests for MentalWellnessService.get_wellness_logs."""

    def test_get_all_wellness_logs(self, db: Session, test_user: UserDB):
        """Test retrieving all wellness logs."""
        today = date.today()

        # Create logs
        mood_data = MoodLogCreate(log_date=today, mood_score=7)
        MentalWellnessService.log_mood(db, test_user.id, mood_data)

        stress_data = StressLogCreate(log_date=today, stress_level=5)
        MentalWellnessService.log_stress(db, test_user.id, stress_data)

        sleep_data = SleepLogCreate(log_date=today, duration_hours=7.0, quality_score=8)
        MentalWellnessService.log_sleep(db, test_user.id, sleep_data)

        # Retrieve all
        mood_logs, stress_logs, sleep_logs = MentalWellnessService.get_wellness_logs(
            db, test_user.id
        )

        assert len(mood_logs) == 1
        assert len(stress_logs) == 1
        assert len(sleep_logs) == 1

    def test_get_wellness_logs_with_date_range(self, db: Session, test_user: UserDB):
        """Test retrieving logs with date range filter."""
        today = date.today()
        yesterday = today - timedelta(days=1)
        two_days_ago = today - timedelta(days=2)

        # Create logs on different dates
        MentalWellnessService.log_mood(
            db, test_user.id, MoodLogCreate(log_date=two_days_ago, mood_score=6)
        )
        MentalWellnessService.log_mood(
            db, test_user.id, MoodLogCreate(log_date=yesterday, mood_score=7)
        )
        MentalWellnessService.log_mood(
            db, test_user.id, MoodLogCreate(log_date=today, mood_score=8)
        )

        # Get logs from yesterday onwards
        mood_logs, stress_logs, sleep_logs = MentalWellnessService.get_wellness_logs(
            db, test_user.id, start_date=yesterday
        )

        assert len(mood_logs) == 2  # yesterday and today
        assert len(stress_logs) == 0
        assert len(sleep_logs) == 0

    def test_get_wellness_logs_decrypts_data(self, db: Session, test_user: UserDB):
        """Test that get_wellness_logs decrypts sensitive data."""
        today = date.today()

        # Create log with notes
        mood_data = MoodLogCreate(log_date=today, mood_score=8, notes="Decryption test")
        MentalWellnessService.log_mood(db, test_user.id, mood_data)

        # Retrieve
        mood_logs, _, _ = MentalWellnessService.get_wellness_logs(db, test_user.id)

        assert len(mood_logs) == 1
        assert mood_logs[0].notes == "Decryption test"

    def test_get_wellness_logs_user_isolation(
        self, db: Session, test_user: UserDB, test_user_2: UserDB
    ):
        """Test user isolation in get_wellness_logs."""
        today = date.today()

        # Create logs for user 1
        MentalWellnessService.log_mood(
            db, test_user.id, MoodLogCreate(log_date=today, mood_score=7)
        )
        MentalWellnessService.log_stress(
            db, test_user.id, StressLogCreate(log_date=today, stress_level=5)
        )

        # Create logs for user 2
        MentalWellnessService.log_mood(
            db, test_user_2.id, MoodLogCreate(log_date=today, mood_score=9)
        )

        # User 2 should only see their own logs
        mood_logs, stress_logs, sleep_logs = MentalWellnessService.get_wellness_logs(
            db, test_user_2.id
        )

        assert len(mood_logs) == 1
        assert mood_logs[0].mood_score == 9
        assert len(stress_logs) == 0  # Should not see user 1's stress log
        assert len(sleep_logs) == 0


class TestUpdateMoodLog:
    """Tests for MentalWellnessService.update_mood_log."""

    def test_update_mood_log_success(self, db: Session, test_user: UserDB):
        """Test updating a mood log."""
        today = date.today()
        mood_data = MoodLogCreate(log_date=today, mood_score=7, notes="Original")
        mood_log = MentalWellnessService.log_mood(db, test_user.id, mood_data)

        # Update
        update_data = MoodLogUpdate(mood_score=8, notes="Updated note")
        updated = MentalWellnessService.update_mood_log(
            db, test_user.id, mood_log.id, update_data
        )

        assert updated is not None
        assert int(updated.mood_score) == 8
        decrypted = decrypt_sensitive_data(updated.encrypted_notes)
        assert decrypted == "Updated note"

    def test_update_mood_log_partial(self, db: Session, test_user: UserDB):
        """Test partial update of mood log."""
        today = date.today()
        mood_data = MoodLogCreate(log_date=today, mood_score=6, notes="Original")
        mood_log = MentalWellnessService.log_mood(db, test_user.id, mood_data)

        # Update only score
        update_data = MoodLogUpdate(mood_score=7)
        updated = MentalWellnessService.update_mood_log(
            db, test_user.id, mood_log.id, update_data
        )

        assert int(updated.mood_score) == 7
        decrypted = decrypt_sensitive_data(updated.encrypted_notes)
        assert decrypted == "Original"  # Notes unchanged

    def test_update_mood_log_user_isolation(
        self, db: Session, test_user: UserDB, test_user_2: UserDB
    ):
        """Test user cannot update another user's mood log."""
        today = date.today()
        mood_data = MoodLogCreate(log_date=today, mood_score=7)
        mood_log = MentalWellnessService.log_mood(db, test_user.id, mood_data)

        # Try to update with different user
        update_data = MoodLogUpdate(mood_score=10)
        updated = MentalWellnessService.update_mood_log(
            db, test_user_2.id, mood_log.id, update_data
        )

        assert updated is None


class TestUpdateStressLog:
    """Tests for MentalWellnessService.update_stress_log."""

    def test_update_stress_log_success(self, db: Session, test_user: UserDB):
        """Test updating a stress log."""
        today = date.today()
        stress_data = StressLogCreate(
            log_date=today, stress_level=6, triggers="Original trigger"
        )
        stress_log = MentalWellnessService.log_stress(db, test_user.id, stress_data)

        # Update
        update_data = StressLogUpdate(stress_level=4, triggers="Updated trigger")
        updated = MentalWellnessService.update_stress_log(
            db, test_user.id, stress_log.id, update_data
        )

        assert updated is not None
        assert int(updated.stress_level) == 4
        decrypted = decrypt_sensitive_data(updated.encrypted_triggers)
        assert decrypted == "Updated trigger"

    def test_update_stress_log_user_isolation(
        self, db: Session, test_user: UserDB, test_user_2: UserDB
    ):
        """Test user cannot update another user's stress log."""
        today = date.today()
        stress_data = StressLogCreate(log_date=today, stress_level=5)
        stress_log = MentalWellnessService.log_stress(db, test_user.id, stress_data)

        update_data = StressLogUpdate(stress_level=10)
        updated = MentalWellnessService.update_stress_log(
            db, test_user_2.id, stress_log.id, update_data
        )

        assert updated is None


class TestUpdateSleepLog:
    """Tests for MentalWellnessService.update_sleep_log."""

    def test_update_sleep_log_success(self, db: Session, test_user: UserDB):
        """Test updating a sleep log."""
        today = date.today()
        sleep_data = SleepLogCreate(log_date=today, duration_hours=6.0, quality_score=6)
        sleep_log = MentalWellnessService.log_sleep(db, test_user.id, sleep_data)

        # Update
        update_data = SleepLogUpdate(duration_hours=7.5, quality_score=8)
        updated = MentalWellnessService.update_sleep_log(
            db, test_user.id, sleep_log.id, update_data
        )

        assert updated is not None
        assert float(updated.duration_hours) == 7.5
        assert int(updated.quality_score) == 8

    def test_update_sleep_log_user_isolation(
        self, db: Session, test_user: UserDB, test_user_2: UserDB
    ):
        """Test user cannot update another user's sleep log."""
        today = date.today()
        sleep_data = SleepLogCreate(log_date=today, duration_hours=7.0, quality_score=7)
        sleep_log = MentalWellnessService.log_sleep(db, test_user.id, sleep_data)

        update_data = SleepLogUpdate(quality_score=10)
        updated = MentalWellnessService.update_sleep_log(
            db, test_user_2.id, sleep_log.id, update_data
        )

        assert updated is None


class TestDeleteMoodLog:
    """Tests for MentalWellnessService.delete_mood_log."""

    def test_delete_mood_log_success(self, db: Session, test_user: UserDB):
        """Test deleting a mood log."""
        today = date.today()
        mood_data = MoodLogCreate(log_date=today, mood_score=7)
        mood_log = MentalWellnessService.log_mood(db, test_user.id, mood_data)

        # Delete
        result = MentalWellnessService.delete_mood_log(db, test_user.id, mood_log.id)

        assert result is True

        # Verify deleted
        retrieved = MentalWellnessService.get_mood_log_by_id(
            db, test_user.id, mood_log.id
        )
        assert retrieved is None

    def test_delete_mood_log_not_found(self, db: Session, test_user: UserDB):
        """Test deleting non-existent mood log returns False."""
        fake_id = str(uuid.uuid4())
        result = MentalWellnessService.delete_mood_log(db, test_user.id, fake_id)

        assert result is False

    def test_delete_mood_log_user_isolation(
        self, db: Session, test_user: UserDB, test_user_2: UserDB
    ):
        """Test user cannot delete another user's mood log."""
        today = date.today()
        mood_data = MoodLogCreate(log_date=today, mood_score=7)
        mood_log = MentalWellnessService.log_mood(db, test_user.id, mood_data)

        # Try to delete with different user
        result = MentalWellnessService.delete_mood_log(db, test_user_2.id, mood_log.id)

        assert result is False

        # Verify still exists
        retrieved = MentalWellnessService.get_mood_log_by_id(
            db, test_user.id, mood_log.id
        )
        assert retrieved is not None


class TestDeleteStressLog:
    """Tests for MentalWellnessService.delete_stress_log."""

    def test_delete_stress_log_success(self, db: Session, test_user: UserDB):
        """Test deleting a stress log."""
        today = date.today()
        stress_data = StressLogCreate(log_date=today, stress_level=5)
        stress_log = MentalWellnessService.log_stress(db, test_user.id, stress_data)

        result = MentalWellnessService.delete_stress_log(
            db, test_user.id, stress_log.id
        )

        assert result is True

    def test_delete_stress_log_user_isolation(
        self, db: Session, test_user: UserDB, test_user_2: UserDB
    ):
        """Test user cannot delete another user's stress log."""
        today = date.today()
        stress_data = StressLogCreate(log_date=today, stress_level=5)
        stress_log = MentalWellnessService.log_stress(db, test_user.id, stress_data)

        result = MentalWellnessService.delete_stress_log(
            db, test_user_2.id, stress_log.id
        )

        assert result is False


class TestDeleteSleepLog:
    """Tests for MentalWellnessService.delete_sleep_log."""

    def test_delete_sleep_log_success(self, db: Session, test_user: UserDB):
        """Test deleting a sleep log."""
        today = date.today()
        sleep_data = SleepLogCreate(log_date=today, duration_hours=7.0, quality_score=7)
        sleep_log = MentalWellnessService.log_sleep(db, test_user.id, sleep_data)

        result = MentalWellnessService.delete_sleep_log(db, test_user.id, sleep_log.id)

        assert result is True

    def test_delete_sleep_log_user_isolation(
        self, db: Session, test_user: UserDB, test_user_2: UserDB
    ):
        """Test user cannot delete another user's sleep log."""
        today = date.today()
        sleep_data = SleepLogCreate(log_date=today, duration_hours=7.0, quality_score=7)
        sleep_log = MentalWellnessService.log_sleep(db, test_user.id, sleep_data)

        result = MentalWellnessService.delete_sleep_log(
            db, test_user_2.id, sleep_log.id
        )

        assert result is False
