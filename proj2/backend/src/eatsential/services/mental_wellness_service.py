"""Mental wellness logging service for mood, stress, and sleep tracking."""

import uuid
from datetime import date
from typing import Optional

from sqlalchemy import and_, desc
from sqlalchemy.orm import Session

from ..models.models import LogType, MoodLogDB, SleepLogDB, StressLogDB
from ..schemas.schemas import (
    MoodLogCreate,
    MoodLogResponse,
    MoodLogUpdate,
    SleepLogCreate,
    SleepLogResponse,
    SleepLogUpdate,
    StressLogCreate,
    StressLogResponse,
    StressLogUpdate,
)
from ..utils.security import decrypt_sensitive_data, encrypt_sensitive_data


class MentalWellnessService:
    """Service class for mental wellness logging operations"""

    @staticmethod
    def log_mood(db: Session, user_id: str, mood_data: MoodLogCreate) -> MoodLogDB:
        """Create a new mood log entry.

        Args:
            db: Database session
            user_id: User ID
            mood_data: Mood log creation data

        Returns:
            Created mood log database object

        """
        # Encrypt notes if provided
        encrypted_notes = encrypt_sensitive_data(mood_data.notes)

        # Create mood log record
        db_mood_log = MoodLogDB(
            id=str(uuid.uuid4()),
            user_id=user_id,
            log_date=mood_data.log_date,
            mood_score=mood_data.mood_score,
            encrypted_notes=encrypted_notes,
        )

        db.add(db_mood_log)
        db.commit()
        db.refresh(db_mood_log)

        return db_mood_log

    @staticmethod
    def log_stress(
        db: Session, user_id: str, stress_data: StressLogCreate
    ) -> StressLogDB:
        """Create a new stress log entry.

        Args:
            db: Database session
            user_id: User ID
            stress_data: Stress log creation data

        Returns:
            Created stress log database object

        """
        # Encrypt sensitive data if provided
        encrypted_triggers = encrypt_sensitive_data(stress_data.triggers)
        encrypted_notes = encrypt_sensitive_data(stress_data.notes)

        # Create stress log record
        db_stress_log = StressLogDB(
            id=str(uuid.uuid4()),
            user_id=user_id,
            log_date=stress_data.log_date,
            stress_level=stress_data.stress_level,
            encrypted_triggers=encrypted_triggers,
            encrypted_notes=encrypted_notes,
        )

        db.add(db_stress_log)
        db.commit()
        db.refresh(db_stress_log)

        return db_stress_log

    @staticmethod
    def log_sleep(db: Session, user_id: str, sleep_data: SleepLogCreate) -> SleepLogDB:
        """Create a new sleep log entry.

        Args:
            db: Database session
            user_id: User ID
            sleep_data: Sleep log creation data

        Returns:
            Created sleep log database object

        """
        # Encrypt notes if provided
        encrypted_notes = encrypt_sensitive_data(sleep_data.notes)

        # Create sleep log record
        db_sleep_log = SleepLogDB(
            id=str(uuid.uuid4()),
            user_id=user_id,
            log_date=sleep_data.log_date,
            duration_hours=sleep_data.duration_hours,
            quality_score=sleep_data.quality_score,
            encrypted_notes=encrypted_notes,
        )

        db.add(db_sleep_log)
        db.commit()
        db.refresh(db_sleep_log)

        return db_sleep_log

    @staticmethod
    def get_mood_log_by_id(
        db: Session, user_id: str, log_id: str
    ) -> Optional[MoodLogDB]:
        """Get a mood log by ID.

        Args:
            db: Database session
            user_id: User ID for authorization
            log_id: Mood log ID

        Returns:
            Mood log database object or None if not found

        """
        return (
            db.query(MoodLogDB)
            .filter(and_(MoodLogDB.id == log_id, MoodLogDB.user_id == user_id))
            .first()
        )

    @staticmethod
    def get_stress_log_by_id(
        db: Session, user_id: str, log_id: str
    ) -> Optional[StressLogDB]:
        """Get a stress log by ID.

        Args:
            db: Database session
            user_id: User ID for authorization
            log_id: Stress log ID

        Returns:
            Stress log database object or None if not found

        """
        return (
            db.query(StressLogDB)
            .filter(and_(StressLogDB.id == log_id, StressLogDB.user_id == user_id))
            .first()
        )

    @staticmethod
    def get_sleep_log_by_id(
        db: Session, user_id: str, log_id: str
    ) -> Optional[SleepLogDB]:
        """Get a sleep log by ID.

        Args:
            db: Database session
            user_id: User ID for authorization
            log_id: Sleep log ID

        Returns:
            Sleep log database object or None if not found

        """
        return (
            db.query(SleepLogDB)
            .filter(and_(SleepLogDB.id == log_id, SleepLogDB.user_id == user_id))
            .first()
        )

    @staticmethod
    def get_wellness_logs(
        db: Session,
        user_id: str,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        log_type: Optional[LogType] = None,
    ) -> tuple[list[MoodLogResponse], list[StressLogResponse], list[SleepLogResponse]]:
        """Get wellness logs for a user with optional filters.

        Args:
            db: Database session
            user_id: User ID
            start_date: Optional start date filter
            end_date: Optional end date filter
            log_type: Optional log type filter ('mood', 'stress', 'sleep')

        Returns:
            Tuple of (mood_logs, stress_logs, sleep_logs) with decrypted data

        """
        mood_logs = []
        stress_logs = []
        sleep_logs = []

        # Query mood logs if requested
        if log_type is None or log_type == "mood":
            query = db.query(MoodLogDB).filter(MoodLogDB.user_id == user_id)

            if start_date:
                query = query.filter(MoodLogDB.log_date >= start_date)
            if end_date:
                query = query.filter(MoodLogDB.log_date <= end_date)

            db_mood_logs = query.order_by(desc(MoodLogDB.log_date)).all()

            # Decrypt and convert to response objects
            for log in db_mood_logs:
                mood_logs.append(
                    MoodLogResponse(
                        id=log.id,
                        user_id=log.user_id,
                        log_date=log.log_date,
                        mood_score=int(log.mood_score),
                        notes=decrypt_sensitive_data(log.encrypted_notes),
                        created_at=log.created_at,
                        updated_at=log.updated_at,
                    )
                )

        # Query stress logs if requested
        if log_type is None or log_type == "stress":
            query = db.query(StressLogDB).filter(StressLogDB.user_id == user_id)

            if start_date:
                query = query.filter(StressLogDB.log_date >= start_date)
            if end_date:
                query = query.filter(StressLogDB.log_date <= end_date)

            db_stress_logs = query.order_by(desc(StressLogDB.log_date)).all()

            # Decrypt and convert to response objects
            for log in db_stress_logs:
                stress_logs.append(
                    StressLogResponse(
                        id=log.id,
                        user_id=log.user_id,
                        log_date=log.log_date,
                        stress_level=int(log.stress_level),
                        triggers=decrypt_sensitive_data(log.encrypted_triggers),
                        notes=decrypt_sensitive_data(log.encrypted_notes),
                        created_at=log.created_at,
                        updated_at=log.updated_at,
                    )
                )

        # Query sleep logs if requested
        if log_type is None or log_type == "sleep":
            query = db.query(SleepLogDB).filter(SleepLogDB.user_id == user_id)

            if start_date:
                query = query.filter(SleepLogDB.log_date >= start_date)
            if end_date:
                query = query.filter(SleepLogDB.log_date <= end_date)

            db_sleep_logs = query.order_by(desc(SleepLogDB.log_date)).all()

            # Decrypt and convert to response objects
            for log in db_sleep_logs:
                sleep_logs.append(
                    SleepLogResponse(
                        id=log.id,
                        user_id=log.user_id,
                        log_date=log.log_date,
                        duration_hours=float(log.duration_hours),
                        quality_score=int(log.quality_score),
                        notes=decrypt_sensitive_data(log.encrypted_notes),
                        created_at=log.created_at,
                        updated_at=log.updated_at,
                    )
                )

        return mood_logs, stress_logs, sleep_logs

    @staticmethod
    def update_mood_log(
        db: Session, user_id: str, log_id: str, update_data: MoodLogUpdate
    ) -> Optional[MoodLogDB]:
        """Update a mood log.

        Args:
            db: Database session
            user_id: User ID for authorization
            log_id: Mood log ID
            update_data: Update data

        Returns:
            Updated mood log or None if not found

        """
        db_log = MentalWellnessService.get_mood_log_by_id(db, user_id, log_id)
        if not db_log:
            return None

        # Update fields if provided
        if update_data.mood_score is not None:
            db_log.mood_score = update_data.mood_score

        if update_data.notes is not None:
            db_log.encrypted_notes = encrypt_sensitive_data(update_data.notes)

        db.commit()
        db.refresh(db_log)
        return db_log

    @staticmethod
    def update_stress_log(
        db: Session, user_id: str, log_id: str, update_data: StressLogUpdate
    ) -> Optional[StressLogDB]:
        """Update a stress log.

        Args:
            db: Database session
            user_id: User ID for authorization
            log_id: Stress log ID
            update_data: Update data

        Returns:
            Updated stress log or None if not found

        """
        db_log = MentalWellnessService.get_stress_log_by_id(db, user_id, log_id)
        if not db_log:
            return None

        # Update fields if provided
        if update_data.stress_level is not None:
            db_log.stress_level = update_data.stress_level

        if update_data.triggers is not None:
            db_log.encrypted_triggers = encrypt_sensitive_data(update_data.triggers)

        if update_data.notes is not None:
            db_log.encrypted_notes = encrypt_sensitive_data(update_data.notes)

        db.commit()
        db.refresh(db_log)
        return db_log

    @staticmethod
    def update_sleep_log(
        db: Session, user_id: str, log_id: str, update_data: SleepLogUpdate
    ) -> Optional[SleepLogDB]:
        """Update a sleep log.

        Args:
            db: Database session
            user_id: User ID for authorization
            log_id: Sleep log ID
            update_data: Update data

        Returns:
            Updated sleep log or None if not found

        """
        db_log = MentalWellnessService.get_sleep_log_by_id(db, user_id, log_id)
        if not db_log:
            return None

        # Update fields if provided
        if update_data.duration_hours is not None:
            db_log.duration_hours = update_data.duration_hours

        if update_data.quality_score is not None:
            db_log.quality_score = update_data.quality_score

        if update_data.notes is not None:
            db_log.encrypted_notes = encrypt_sensitive_data(update_data.notes)

        db.commit()
        db.refresh(db_log)
        return db_log

    @staticmethod
    def delete_mood_log(db: Session, user_id: str, log_id: str) -> bool:
        """Delete a mood log.

        Args:
            db: Database session
            user_id: User ID for authorization
            log_id: Mood log ID

        Returns:
            True if deleted, False if not found

        """
        db_log = MentalWellnessService.get_mood_log_by_id(db, user_id, log_id)
        if not db_log:
            return False

        db.delete(db_log)
        db.commit()
        return True

    @staticmethod
    def delete_stress_log(db: Session, user_id: str, log_id: str) -> bool:
        """Delete a stress log.

        Args:
            db: Database session
            user_id: User ID for authorization
            log_id: Stress log ID

        Returns:
            True if deleted, False if not found

        """
        db_log = MentalWellnessService.get_stress_log_by_id(db, user_id, log_id)
        if not db_log:
            return False

        db.delete(db_log)
        db.commit()
        return True

    @staticmethod
    def delete_sleep_log(db: Session, user_id: str, log_id: str) -> bool:
        """Delete a sleep log.

        Args:
            db: Database session
            user_id: User ID for authorization
            log_id: Sleep log ID

        Returns:
            True if deleted, False if not found

        """
        db_log = MentalWellnessService.get_sleep_log_by_id(db, user_id, log_id)
        if not db_log:
            return False

        db.delete(db_log)
        db.commit()
        return True
