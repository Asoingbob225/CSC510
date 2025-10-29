"""API routes for mental wellness logging (mood, stress, sleep)."""

from datetime import date
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..db.database import get_db
from ..models.models import LogType
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
    UserResponse,
    WellnessLogsResponse,
)
from ..services.auth_service import get_current_user
from ..services.mental_wellness_service import MentalWellnessService

router = APIRouter(prefix="/wellness", tags=["wellness"])


@router.post(
    "/mood-logs", response_model=MoodLogResponse, status_code=status.HTTP_201_CREATED
)
def create_mood_log(
    mood_data: MoodLogCreate,
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """Create a new mood log entry.

    Args:
        mood_data: Mood log creation data
        current_user: Authenticated user
        db: Database session

    Returns:
        Created mood log with decrypted notes

    Raises:
        HTTPException: 
            - 409: If a log already exists for this date
            - 400: If validation errors occur
            - 500: If creation fails

    """
    try:
        db_log = MentalWellnessService.log_mood(db, current_user.id, mood_data)

        # Convert to response with decrypted notes
        from ..utils.security import decrypt_sensitive_data

        return MoodLogResponse(
            id=db_log.id,
            user_id=db_log.user_id,
            log_date=db_log.log_date,
            mood_score=int(db_log.mood_score),
            notes=decrypt_sensitive_data(db_log.encrypted_notes),
            created_at=db_log.created_at,
            updated_at=db_log.updated_at,
        )
    except ValueError as e:
        # Check if it's a duplicate entry error
        if "already exists" in str(e):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create mood log: {e!s}",
        )


@router.post(
    "/stress-logs",
    response_model=StressLogResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_stress_log(
    stress_data: StressLogCreate,
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """Create a new stress log entry.

    Args:
        stress_data: Stress log creation data
        current_user: Authenticated user
        db: Database session

    Returns:
        Created stress log with decrypted triggers and notes

    Raises:
        HTTPException: If creation fails or validation errors occur

    """
    try:
        db_log = MentalWellnessService.log_stress(db, current_user.id, stress_data)

        # Convert to response with decrypted data
        from ..utils.security import decrypt_sensitive_data

        return StressLogResponse(
            id=db_log.id,
            user_id=db_log.user_id,
            log_date=db_log.log_date,
            stress_level=int(db_log.stress_level),
            triggers=decrypt_sensitive_data(db_log.encrypted_triggers),
            notes=decrypt_sensitive_data(db_log.encrypted_notes),
            created_at=db_log.created_at,
            updated_at=db_log.updated_at,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create stress log: {e!s}",
        )


@router.post(
    "/sleep-logs", response_model=SleepLogResponse, status_code=status.HTTP_201_CREATED
)
def create_sleep_log(
    sleep_data: SleepLogCreate,
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """Create a new sleep log entry.

    Args:
        sleep_data: Sleep log creation data
        current_user: Authenticated user
        db: Database session

    Returns:
        Created sleep log with decrypted notes

    Raises:
        HTTPException: If creation fails or validation errors occur

    """
    try:
        db_log = MentalWellnessService.log_sleep(db, current_user.id, sleep_data)

        # Convert to response with decrypted notes
        from ..utils.security import decrypt_sensitive_data

        return SleepLogResponse(
            id=db_log.id,
            user_id=db_log.user_id,
            log_date=db_log.log_date,
            duration_hours=float(db_log.duration_hours),
            quality_score=int(db_log.quality_score),
            notes=decrypt_sensitive_data(db_log.encrypted_notes),
            created_at=db_log.created_at,
            updated_at=db_log.updated_at,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create sleep log: {e!s}",
        )


@router.get("/logs", response_model=WellnessLogsResponse)
def get_wellness_logs(
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    db: Session = Depends(get_db),
    start_date: Optional[date] = Query(None, description="Filter by start date"),
    end_date: Optional[date] = Query(None, description="Filter by end date"),
    log_type: Optional[LogType] = Query(
        None, description="Filter by type: 'mood', 'stress', or 'sleep'"
    ),
):
    """Get user's wellness logs with optional filters.

    Args:
        current_user: Authenticated user
        db: Database session
        start_date: Optional start date filter
        end_date: Optional end date filter
        log_type: Optional log type filter ('mood', 'stress', 'sleep')

    Returns:
        Wellness logs (mood, stress, sleep) with decrypted data

    """
    try:
        mood_logs, stress_logs, sleep_logs = MentalWellnessService.get_wellness_logs(
            db=db,
            user_id=current_user.id,
            start_date=start_date,
            end_date=end_date,
            log_type=log_type,
        )

        total_count = len(mood_logs) + len(stress_logs) + len(sleep_logs)

        return WellnessLogsResponse(
            mood_logs=mood_logs,
            stress_logs=stress_logs,
            sleep_logs=sleep_logs,
            total_count=total_count,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve wellness logs: {e!s}",
        )


@router.get("/mood-logs/{log_id}", response_model=MoodLogResponse)
def get_mood_log(
    log_id: str,
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """Get a specific mood log by ID.

    Args:
        log_id: Mood log ID
        current_user: Authenticated user
        db: Database session

    Returns:
        Mood log with decrypted notes

    Raises:
        HTTPException: If log not found

    """
    db_log = MentalWellnessService.get_mood_log_by_id(db, current_user.id, log_id)
    if not db_log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Mood log not found"
        )

    from ..utils.security import decrypt_sensitive_data

    return MoodLogResponse(
        id=db_log.id,
        user_id=db_log.user_id,
        log_date=db_log.log_date,
        mood_score=int(db_log.mood_score),
        notes=decrypt_sensitive_data(db_log.encrypted_notes),
        created_at=db_log.created_at,
        updated_at=db_log.updated_at,
    )


@router.put("/mood-logs/{log_id}", response_model=MoodLogResponse)
def update_mood_log(
    log_id: str,
    update_data: MoodLogUpdate,
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """Update a mood log.

    Args:
        log_id: Mood log ID
        update_data: Update data
        current_user: Authenticated user
        db: Database session

    Returns:
        Updated mood log with decrypted notes

    Raises:
        HTTPException: If log not found

    """
    db_log = MentalWellnessService.update_mood_log(
        db, current_user.id, log_id, update_data
    )
    if not db_log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Mood log not found"
        )

    from ..utils.security import decrypt_sensitive_data

    return MoodLogResponse(
        id=db_log.id,
        user_id=db_log.user_id,
        log_date=db_log.log_date,
        mood_score=int(db_log.mood_score),
        notes=decrypt_sensitive_data(db_log.encrypted_notes),
        created_at=db_log.created_at,
        updated_at=db_log.updated_at,
    )


@router.delete("/mood-logs/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_mood_log(
    log_id: str,
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """Delete a mood log.

    Args:
        log_id: Mood log ID
        current_user: Authenticated user
        db: Database session

    Raises:
        HTTPException: If log not found

    """
    success = MentalWellnessService.delete_mood_log(db, current_user.id, log_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Mood log not found"
        )


@router.get("/stress-logs/{log_id}", response_model=StressLogResponse)
def get_stress_log(
    log_id: str,
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """Get a specific stress log by ID.

    Args:
        log_id: Stress log ID
        current_user: Authenticated user
        db: Database session

    Returns:
        Stress log with decrypted triggers and notes

    Raises:
        HTTPException: If log not found

    """
    db_log = MentalWellnessService.get_stress_log_by_id(db, current_user.id, log_id)
    if not db_log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Stress log not found"
        )

    from ..utils.security import decrypt_sensitive_data

    return StressLogResponse(
        id=db_log.id,
        user_id=db_log.user_id,
        log_date=db_log.log_date,
        stress_level=int(db_log.stress_level),
        triggers=decrypt_sensitive_data(db_log.encrypted_triggers),
        notes=decrypt_sensitive_data(db_log.encrypted_notes),
        created_at=db_log.created_at,
        updated_at=db_log.updated_at,
    )


@router.put("/stress-logs/{log_id}", response_model=StressLogResponse)
def update_stress_log(
    log_id: str,
    update_data: StressLogUpdate,
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """Update a stress log.

    Args:
        log_id: Stress log ID
        update_data: Update data
        current_user: Authenticated user
        db: Database session

    Returns:
        Updated stress log with decrypted triggers and notes

    Raises:
        HTTPException: If log not found

    """
    db_log = MentalWellnessService.update_stress_log(
        db, current_user.id, log_id, update_data
    )
    if not db_log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Stress log not found"
        )

    from ..utils.security import decrypt_sensitive_data

    return StressLogResponse(
        id=db_log.id,
        user_id=db_log.user_id,
        log_date=db_log.log_date,
        stress_level=int(db_log.stress_level),
        triggers=decrypt_sensitive_data(db_log.encrypted_triggers),
        notes=decrypt_sensitive_data(db_log.encrypted_notes),
        created_at=db_log.created_at,
        updated_at=db_log.updated_at,
    )


@router.delete("/stress-logs/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_stress_log(
    log_id: str,
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """Delete a stress log.

    Args:
        log_id: Stress log ID
        current_user: Authenticated user
        db: Database session

    Raises:
        HTTPException: If log not found

    """
    success = MentalWellnessService.delete_stress_log(db, current_user.id, log_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Stress log not found"
        )


@router.get("/sleep-logs/{log_id}", response_model=SleepLogResponse)
def get_sleep_log(
    log_id: str,
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """Get a specific sleep log by ID.

    Args:
        log_id: Sleep log ID
        current_user: Authenticated user
        db: Database session

    Returns:
        Sleep log with decrypted notes

    Raises:
        HTTPException: If log not found

    """
    db_log = MentalWellnessService.get_sleep_log_by_id(db, current_user.id, log_id)
    if not db_log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Sleep log not found"
        )

    from ..utils.security import decrypt_sensitive_data

    return SleepLogResponse(
        id=db_log.id,
        user_id=db_log.user_id,
        log_date=db_log.log_date,
        duration_hours=float(db_log.duration_hours),
        quality_score=int(db_log.quality_score),
        notes=decrypt_sensitive_data(db_log.encrypted_notes),
        created_at=db_log.created_at,
        updated_at=db_log.updated_at,
    )


@router.put("/sleep-logs/{log_id}", response_model=SleepLogResponse)
def update_sleep_log(
    log_id: str,
    update_data: SleepLogUpdate,
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """Update a sleep log.

    Args:
        log_id: Sleep log ID
        update_data: Update data
        current_user: Authenticated user
        db: Database session

    Returns:
        Updated sleep log with decrypted notes

    Raises:
        HTTPException: If log not found

    """
    db_log = MentalWellnessService.update_sleep_log(
        db, current_user.id, log_id, update_data
    )
    if not db_log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Sleep log not found"
        )

    from ..utils.security import decrypt_sensitive_data

    return SleepLogResponse(
        id=db_log.id,
        user_id=db_log.user_id,
        log_date=db_log.log_date,
        duration_hours=float(db_log.duration_hours),
        quality_score=int(db_log.quality_score),
        notes=decrypt_sensitive_data(db_log.encrypted_notes),
        created_at=db_log.created_at,
        updated_at=db_log.updated_at,
    )


@router.delete("/sleep-logs/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_sleep_log(
    log_id: str,
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """Delete a sleep log.

    Args:
        log_id: Sleep log ID
        current_user: Authenticated user
        db: Database session

    Raises:
        HTTPException: If log not found

    """
    success = MentalWellnessService.delete_sleep_log(db, current_user.id, log_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Sleep log not found"
        )
