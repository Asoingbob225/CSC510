"""Seed wellness logs for admin user.

Creates 7 days of mood, stress, and sleep logs for testing purposes.
"""

import sys
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from passlib.hash import argon2
from sqlalchemy.orm import Session

from eatsential.db.database import SessionLocal
from eatsential.models import MoodLogDB, SleepLogDB, StressLogDB, UserDB


def seed_wellness_logs():
    """Create 7 days of wellness logs for admin user."""
    db: Session = SessionLocal()

    try:
        # Find admin user
        admin_email = "admin@example.com"
        admin_user = db.query(UserDB).filter(UserDB.email == admin_email).first()

        if not admin_user:
            print(f"Admin user {admin_email} not found. Creating admin user...")
            admin_user = UserDB(
                email=admin_email,
                hashed_password=argon2.hash("admin123"),
                full_name="Admin User",
                role="admin",
                is_active=True,
                email_verified=True,
                timezone="America/New_York",  # Default timezone
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
            print(f"✓ Created admin user: {admin_email}")

        print(f"\nSeeding wellness logs for user: {admin_email}")
        print(f"User timezone: {admin_user.timezone}")

        # Delete existing wellness logs for this user
        db.query(MoodLogDB).filter(MoodLogDB.user_id == admin_user.id).delete()
        db.query(StressLogDB).filter(StressLogDB.user_id == admin_user.id).delete()
        db.query(SleepLogDB).filter(SleepLogDB.user_id == admin_user.id).delete()
        db.commit()
        print("✓ Cleared existing wellness logs")

        # Generate logs for the past 7 days
        today = datetime.now(timezone.utc)
        logs_created = {"mood": 0, "stress": 0, "sleep": 0}

        for days_ago in range(7):
            # Calculate the timestamp for this day
            log_date = today - timedelta(days=days_ago)

            # Mood log with varying scores (simulating mood fluctuations)
            mood_score = 5 + (days_ago % 5)  # Score between 5-9
            [
                "Feeling great today!",
                "Pretty good overall",
                "Neutral mood",
                "Had some ups and downs",
                "Excellent day!",
                "Productive and happy",
                "Calm and content",
            ][days_ago]

            mood_log = MoodLogDB(
                id=str(uuid.uuid4()),
                user_id=admin_user.id,
                occurred_at_utc=log_date,
                mood_score=mood_score,
                encrypted_notes=None,  # Skip encryption for seed data
            )
            db.add(mood_log)
            logs_created["mood"] += 1

            # Stress log with varying levels (inverse of mood)
            stress_level = 10 - mood_score  # Inverse relationship
            [
                "Work deadlines",
                "Meeting preparations",
                None,
                "Email overload",
                None,
                "Project planning",
                "Team coordination",
            ][days_ago]
            [
                "Managed stress well",
                "Used breathing exercises",
                "Calm day",
                "Need better time management",
                "Very relaxed",
                "Some pressure but manageable",
                "Smooth day",
            ][days_ago]

            stress_log = StressLogDB(
                id=str(uuid.uuid4()),
                user_id=admin_user.id,
                occurred_at_utc=log_date,
                stress_level=stress_level,
                encrypted_triggers=None,  # Skip encryption for seed data
                encrypted_notes=None,  # Skip encryption for seed data
            )
            db.add(stress_log)
            logs_created["stress"] += 1

            # Sleep log with varying quality and duration
            duration_hours = 7.0 + (days_ago % 3) * 0.5  # 7.0 - 8.0 hours
            quality_score = 6 + (days_ago % 4)  # Score between 6-9
            [
                "Slept well, woke up refreshed",
                "Good night's sleep",
                "Had some dreams",
                "Woke up once during night",
                "Deep sleep",
                "Restful night",
                "Fell asleep quickly",
            ][days_ago]

            sleep_log = SleepLogDB(
                id=str(uuid.uuid4()),
                user_id=admin_user.id,
                occurred_at_utc=log_date,
                duration_hours=duration_hours,
                quality_score=quality_score,
                encrypted_notes=None,  # Skip encryption for seed data
            )
            db.add(sleep_log)
            logs_created["sleep"] += 1

        db.commit()

        print("\n✓ Successfully created wellness logs:")
        print(f"  - Mood logs: {logs_created['mood']}")
        print(f"  - Stress logs: {logs_created['stress']}")
        print(f"  - Sleep logs: {logs_created['sleep']}")
        print(f"  Total: {sum(logs_created.values())} logs")

        # Verify the logs
        mood_count = (
            db.query(MoodLogDB).filter(MoodLogDB.user_id == admin_user.id).count()
        )
        stress_count = (
            db.query(StressLogDB).filter(StressLogDB.user_id == admin_user.id).count()
        )
        sleep_count = (
            db.query(SleepLogDB).filter(SleepLogDB.user_id == admin_user.id).count()
        )

        print("\n✓ Verification:")
        print(f"  - Mood logs in DB: {mood_count}")
        print(f"  - Stress logs in DB: {stress_count}")
        print(f"  - Sleep logs in DB: {sleep_count}")

        # Display date range
        oldest_log = today - timedelta(days=6)
        print(f"\n✓ Date range: {oldest_log.date()} to {today.date()}")

    except Exception as e:
        print(f"\n✗ Error seeding wellness logs: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("=" * 60)
    print("Wellness Logs Seeding Script")
    print("=" * 60)
    seed_wellness_logs()
    print("\n" + "=" * 60)
    print("Seeding completed successfully!")
    print("=" * 60)
