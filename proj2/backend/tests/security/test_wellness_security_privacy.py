"""Security and privacy tests for Mental Wellness tracking (Issue #104)."""

from datetime import datetime, timedelta, timezone

from fastapi import status
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from src.eatsential.models.models import MoodLogDB, SleepLogDB, StressLogDB
from src.eatsential.utils.auth_util import create_access_token


class TestDataEncryption:
    """Test that sensitive mental wellness data is properly encrypted."""

    def test_mood_notes_are_encrypted_at_rest(
        self, client: TestClient, auth_headers: dict, db: Session, test_user
    ):
        """Test that mood log notes are encrypted in database."""
        sensitive_note = "Feeling very anxious about work presentation"

        # Create mood log with notes
        mood_data = {
            "mood_score": 4,
            "occurred_at": datetime.now(timezone.utc).isoformat(),
            "notes": sensitive_note,
        }
        response = client.post(
            "/api/wellness/mood-logs", json=mood_data, headers=auth_headers
        )
        assert response.status_code == status.HTTP_201_CREATED
        mood_id = response.json()["id"]

        # Check database - notes should be encrypted
        mood_log = db.query(MoodLogDB).filter(MoodLogDB.id == mood_id).first()
        assert mood_log is not None
        # The encrypted notes should NOT be plaintext
        assert mood_log.encrypted_notes is not None
        assert mood_log.encrypted_notes != sensitive_note
        # Should be encrypted (different from original)
        assert len(mood_log.encrypted_notes) > 0

        # API should decrypt when returning
        get_response = client.get(
            f"/api/wellness/mood-logs/{mood_id}", headers=auth_headers
        )
        assert get_response.json()["notes"] == sensitive_note

    def test_stress_triggers_are_encrypted(
        self, client: TestClient, auth_headers: dict, db: Session, test_user
    ):
        """Test that stress log triggers are encrypted."""
        sensitive_trigger = "Conflict with boss about project deadline"

        stress_data = {
            "stress_level": 8,
            "occurred_at": datetime.now(timezone.utc).isoformat(),
            "triggers": sensitive_trigger,
        }
        response = client.post(
            "/api/wellness/stress-logs", json=stress_data, headers=auth_headers
        )
        assert response.status_code == status.HTTP_201_CREATED
        stress_id = response.json()["id"]

        # Check database
        stress_log = db.query(StressLogDB).filter(StressLogDB.id == stress_id).first()
        assert stress_log is not None
        assert stress_log.encrypted_triggers is not None
        assert stress_log.encrypted_triggers != sensitive_trigger

        # API returns decrypted
        get_response = client.get(
            f"/api/wellness/stress-logs/{stress_id}", headers=auth_headers
        )
        assert get_response.json()["triggers"] == sensitive_trigger

    def test_sleep_notes_are_encrypted(
        self, client: TestClient, auth_headers: dict, db: Session, test_user
    ):
        """Test that sleep log notes are encrypted."""
        sensitive_note = "Nightmares about family issues"

        sleep_data = {
            "occurred_at": datetime.now(timezone.utc).isoformat(),
            "duration_hours": 6.5,
            "quality_score": 5,
            "notes": sensitive_note,
        }
        response = client.post(
            "/api/wellness/sleep-logs", json=sleep_data, headers=auth_headers
        )
        assert response.status_code == status.HTTP_201_CREATED
        sleep_id = response.json()["id"]

        # Check database
        sleep_log = db.query(SleepLogDB).filter(SleepLogDB.id == sleep_id).first()
        assert sleep_log is not None
        assert sleep_log.encrypted_notes is not None
        assert sleep_log.encrypted_notes != sensitive_note

        # API returns decrypted
        get_response = client.get(
            f"/api/wellness/sleep-logs/{sleep_id}", headers=auth_headers
        )
        assert get_response.json()["notes"] == sensitive_note


class TestPrivacyControls:
    """Test privacy and data isolation for mental wellness data."""

    def test_user_cannot_access_others_mood_logs(
        self, client: TestClient, auth_headers: dict, db: Session, test_user, test_user2
    ):
        """Test that users cannot access each other's mood logs."""
        # User 1 creates mood log
        mood_data = {
            "mood_score": 7,
            "occurred_at": datetime.now(timezone.utc).isoformat(),
            "notes": "User 1's private thoughts",
        }
        response1 = client.post(
            "/api/wellness/mood-logs", json=mood_data, headers=auth_headers
        )
        assert response1.status_code == status.HTTP_201_CREATED
        mood_id = response1.json()["id"]

        # User 2 tries to access User 1's mood log
        token2 = create_access_token(data={"sub": test_user2.id})
        auth_headers_user2 = {"Authorization": f"Bearer {token2}"}
        response2 = client.get(
            f"/api/wellness/mood-logs/{mood_id}", headers=auth_headers_user2
        )

        # Should get 404 or 403
        assert response2.status_code in [
            status.HTTP_404_NOT_FOUND,
            status.HTTP_403_FORBIDDEN,
        ]

    def test_user_cannot_update_others_stress_logs(
        self, client: TestClient, auth_headers: dict, db: Session, test_user, test_user2
    ):
        """Test that users cannot update each other's stress logs."""
        # User 1 creates stress log
        stress_data = {
            "stress_level": 6,
            "occurred_at": datetime.now(timezone.utc).isoformat(),
        }
        response1 = client.post(
            "/api/wellness/stress-logs", json=stress_data, headers=auth_headers
        )
        assert response1.status_code == status.HTTP_201_CREATED
        stress_id = response1.json()["id"]

        # User 2 tries to update User 1's stress log
        token2 = create_access_token(data={"sub": test_user2.id})
        auth_headers_user2 = {"Authorization": f"Bearer {token2}"}
        update_data = {
            "stress_level": 9,
            "occurred_at": datetime.now(timezone.utc).isoformat(),
        }
        response2 = client.put(
            f"/api/wellness/stress-logs/{stress_id}",
            json=update_data,
            headers=auth_headers_user2,
        )

        assert response2.status_code in [
            status.HTTP_404_NOT_FOUND,
            status.HTTP_403_FORBIDDEN,
        ]

    def test_user_cannot_delete_others_sleep_logs(
        self, client: TestClient, auth_headers: dict, db: Session, test_user, test_user2
    ):
        """Test that users cannot delete each other's sleep logs."""
        # User 1 creates sleep log
        sleep_data = {
            "occurred_at": datetime.now(timezone.utc).isoformat(),
            "duration_hours": 7.0,
            "quality_score": 8,
        }
        response1 = client.post(
            "/api/wellness/sleep-logs", json=sleep_data, headers=auth_headers
        )
        assert response1.status_code == status.HTTP_201_CREATED
        sleep_id = response1.json()["id"]

        # User 2 tries to delete User 1's sleep log
        token2 = create_access_token(data={"sub": test_user2.id})
        auth_headers_user2 = {"Authorization": f"Bearer {token2}"}
        response2 = client.delete(
            f"/api/wellness/sleep-logs/{sleep_id}", headers=auth_headers_user2
        )

        assert response2.status_code in [
            status.HTTP_404_NOT_FOUND,
            status.HTTP_403_FORBIDDEN,
        ]

        # Verify User 1's sleep log still exists
        response3 = client.get(
            f"/api/wellness/sleep-logs/{sleep_id}", headers=auth_headers
        )
        assert response3.status_code == status.HTTP_200_OK

    def test_wellness_logs_list_shows_only_user_data(
        self, client: TestClient, auth_headers: dict, db: Session, test_user, test_user2
    ):
        """Test that listing wellness logs returns only user's own data."""
        # User 1 creates logs on different days directly in DB
        # (bypassing service validation)
        import uuid

        today = datetime.now(timezone.utc).replace(tzinfo=None)
        for i in range(3):
            log_dt = today - timedelta(days=i)
            mood_log = MoodLogDB(
                id=str(uuid.uuid4()),
                user_id=test_user.id,
                occurred_at_utc=log_dt,
                mood_score=7,
            )
            db.add(mood_log)
        db.commit()

        # User 2 creates logs on different days directly in DB
        for i in range(2):
            log_dt = today - timedelta(days=i)
            mood_log = MoodLogDB(
                id=str(uuid.uuid4()),
                user_id=test_user2.id,
                occurred_at_utc=log_dt,
                mood_score=5,
            )
            db.add(mood_log)
        db.commit()

        # User 1 lists mood logs
        response1 = client.get("/api/wellness/logs?log_type=mood", headers=auth_headers)
        assert response1.status_code == status.HTTP_200_OK
        logs1 = response1.json()
        mood_logs1 = logs1.get("mood_logs", [])
        assert len(mood_logs1) == 3

        # User 2 lists mood logs
        token2 = create_access_token(data={"sub": test_user2.id})
        auth_headers_user2 = {"Authorization": f"Bearer {token2}"}
        response2 = client.get(
            "/api/wellness/logs?log_type=mood", headers=auth_headers_user2
        )
        assert response2.status_code == status.HTTP_200_OK
        logs2 = response2.json()
        mood_logs2 = logs2.get("mood_logs", [])
        assert len(mood_logs2) == 2


class TestScaleValidation:
    """Test validation of scale ranges (1-10) for mood and stress."""

    def test_mood_score_below_minimum(
        self, client: TestClient, auth_headers: dict, db: Session
    ):
        """Test that mood score below 1 is rejected."""
        mood_data = {
            "mood_score": 0,
            "occurred_at": datetime.now(timezone.utc).isoformat(),
        }
        response = client.post(
            "/api/wellness/mood-logs", json=mood_data, headers=auth_headers
        )
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT

    def test_mood_score_above_maximum(
        self, client: TestClient, auth_headers: dict, db: Session
    ):
        """Test that mood score above 10 is rejected."""
        mood_data = {
            "mood_score": 11,
            "occurred_at": datetime.now(timezone.utc).isoformat(),
        }
        response = client.post(
            "/api/wellness/mood-logs", json=mood_data, headers=auth_headers
        )
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT

    def test_stress_level_range_validation(
        self, client: TestClient, auth_headers: dict, db: Session
    ):
        """Test stress level validation (1-10)."""
        # Valid level (only one entry per day allowed)
        today = datetime.now(timezone.utc)
        stress_data = {
            "stress_level": 5,
            "occurred_at": today.isoformat(),
        }
        response = client.post(
            "/api/wellness/stress-logs", json=stress_data, headers=auth_headers
        )
        assert response.status_code == status.HTTP_201_CREATED

        # Invalid levels (test validation without creating entries)
        for level in [0, 11, -1]:
            stress_data = {
                "stress_level": level,
                "occurred_at": today.isoformat(),
            }
            response = client.post(
                "/api/wellness/stress-logs", json=stress_data, headers=auth_headers
            )
            assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT

    def test_sleep_quality_score_range(
        self, client: TestClient, auth_headers: dict, db: Session
    ):
        """Test sleep quality score validation (1-10)."""
        valid_data = {
            "occurred_at": datetime.now(timezone.utc).isoformat(),
            "duration_hours": 7.0,
            "quality_score": 8,
        }
        response = client.post(
            "/api/wellness/sleep-logs", json=valid_data, headers=auth_headers
        )
        assert response.status_code == status.HTTP_201_CREATED

        # Invalid quality score
        invalid_data = {
            "occurred_at": datetime.now(timezone.utc).isoformat(),
            "duration_hours": 7.0,
            "quality_score": 12,
        }
        response = client.post(
            "/api/wellness/sleep-logs", json=invalid_data, headers=auth_headers
        )
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
