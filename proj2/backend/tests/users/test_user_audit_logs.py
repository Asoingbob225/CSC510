"""Tests for user audit log functionality."""

from sqlalchemy.orm import Session

from src.eatsential.models import UserAuditLogDB, UserDB


class TestUserAuditLogs:
    """Test user audit log creation and retrieval."""

    def test_update_user_role_creates_audit_log(
        self,
        client,
        db: Session,
        admin_user: UserDB,
        admin_auth_headers: dict,
        regular_user: UserDB,
    ):
        """Test that updating user role creates an audit log entry."""
        # Update user role
        response = client.put(
            f"/api/users/admin/users/{regular_user.id}",
            json={"role": "admin"},
            headers=admin_auth_headers,
        )
        assert response.status_code == 200

        # Check audit log was created
        audit_logs = (
            db.query(UserAuditLogDB)
            .filter(UserAuditLogDB.target_user_id == regular_user.id)
            .filter(UserAuditLogDB.action == "role_change")
            .all()
        )
        assert len(audit_logs) == 1
        assert audit_logs[0].admin_user_id == admin_user.id
        assert audit_logs[0].admin_username == admin_user.username
        assert audit_logs[0].target_username == regular_user.username
        changes = audit_logs[0].changes or ""
        assert '"old": "user"' in changes
        assert '"new": "admin"' in changes

    def test_update_user_status_creates_audit_log(
        self,
        client,
        db: Session,
        admin_user: UserDB,
        admin_auth_headers: dict,
        regular_user: UserDB,
    ):
        """Test that updating user account status creates an audit log entry."""
        # Update user status
        response = client.put(
            f"/api/users/admin/users/{regular_user.id}",
            json={"account_status": "suspended"},
            headers=admin_auth_headers,
        )
        assert response.status_code == 200

        # Check audit log was created
        audit_logs = (
            db.query(UserAuditLogDB)
            .filter(UserAuditLogDB.target_user_id == regular_user.id)
            .filter(UserAuditLogDB.action == "status_change")
            .all()
        )
        assert len(audit_logs) == 1
        assert audit_logs[0].admin_user_id == admin_user.id
        assert '"new": "suspended"' in (audit_logs[0].changes or "")

    def test_update_user_email_creates_audit_log(
        self,
        client,
        db: Session,
        admin_user: UserDB,
        admin_auth_headers: dict,
        regular_user: UserDB,
    ):
        """Test that updating user email creates an audit log entry."""
        # Update user email
        new_email = "newemail@example.com"
        response = client.put(
            f"/api/users/admin/users/{regular_user.id}",
            json={"email": new_email},
            headers=admin_auth_headers,
        )
        assert response.status_code == 200

        # Check audit log was created
        audit_logs = (
            db.query(UserAuditLogDB)
            .filter(UserAuditLogDB.target_user_id == regular_user.id)
            .filter(UserAuditLogDB.action == "profile_update")
            .all()
        )
        assert len(audit_logs) == 1
        assert audit_logs[0].admin_user_id == admin_user.id
        assert f'"new": "{new_email}"' in (audit_logs[0].changes or "")

    def test_update_email_verification_creates_audit_log(
        self,
        client,
        db: Session,
        admin_user: UserDB,
        admin_auth_headers: dict,
        regular_user: UserDB,
    ):
        """Test that updating email verification status creates an audit log entry."""
        # First set email_verified to False
        regular_user.email_verified = False
        db.commit()

        # Update email verification to True
        response = client.put(
            f"/api/users/admin/users/{regular_user.id}",
            json={"email_verified": True},
            headers=admin_auth_headers,
        )
        assert response.status_code == 200

        # Check audit log was created
        audit_logs = (
            db.query(UserAuditLogDB)
            .filter(UserAuditLogDB.target_user_id == regular_user.id)
            .filter(UserAuditLogDB.action == "email_verify")
            .all()
        )
        assert len(audit_logs) == 1
        assert '"new": true' in (audit_logs[0].changes or "")

    def test_multiple_changes_create_multiple_logs(
        self,
        client,
        db: Session,
        admin_user: UserDB,
        admin_auth_headers: dict,
        regular_user: UserDB,
    ):
        """Test that multiple changes create multiple audit log entries."""
        # Update multiple fields
        response = client.put(
            f"/api/users/admin/users/{regular_user.id}",
            json={
                "role": "admin",
                "account_status": "verified",
                "username": "newusername",
            },
            headers=admin_auth_headers,
        )
        assert response.status_code == 200

        # Check multiple audit logs were created
        audit_logs = (
            db.query(UserAuditLogDB)
            .filter(UserAuditLogDB.target_user_id == regular_user.id)
            .all()
        )
        # Should have 3 logs: role_change, status_change, profile_update
        assert len(audit_logs) == 3
        actions = {log.action for log in audit_logs}
        assert "role_change" in actions
        assert "status_change" in actions
        assert "profile_update" in actions

    def test_get_user_audit_logs(
        self,
        client,
        db: Session,
        admin_user: UserDB,
        admin_auth_headers: dict,
        regular_user: UserDB,
    ):
        """Test retrieving audit logs for a specific user."""
        # Create some audit logs by updating user
        client.put(
            f"/api/users/admin/users/{regular_user.id}",
            json={"role": "admin"},
            headers=admin_auth_headers,
        )
        client.put(
            f"/api/users/admin/users/{regular_user.id}",
            json={"account_status": "verified"},
            headers=admin_auth_headers,
        )

        # Get audit logs
        response = client.get(
            f"/api/users/admin/users/{regular_user.id}/audit-logs",
            headers=admin_auth_headers,
        )
        assert response.status_code == 200

        data = response.json()
        assert len(data) == 2
        assert all(log["target_user_id"] == regular_user.id for log in data)
        assert all(log["admin_user_id"] == admin_user.id for log in data)
        assert all(log["admin_username"] == admin_user.username for log in data)

    def test_get_audit_logs_requires_admin(
        self,
        client,
        regular_user: UserDB,
        user_auth_headers: dict,
    ):
        """Test that non-admin users cannot access audit logs."""
        response = client.get(
            f"/api/users/admin/users/{regular_user.id}/audit-logs",
            headers=user_auth_headers,
        )
        assert response.status_code == 403

    def test_get_audit_logs_user_not_found(
        self,
        client,
        admin_auth_headers: dict,
    ):
        """Test that getting audit logs for non-existent user returns 404."""
        response = client.get(
            "/api/users/admin/users/nonexistent-user-id/audit-logs",
            headers=admin_auth_headers,
        )
        assert response.status_code == 404

    def test_audit_log_limit_parameter(
        self,
        client,
        db: Session,
        admin_user: UserDB,
        admin_auth_headers: dict,
        regular_user: UserDB,
    ):
        """Test that audit log limit parameter works correctly."""
        # Create 5 audit logs
        for i in range(5):
            client.put(
                f"/api/users/admin/users/{regular_user.id}",
                json={"username": f"user{i}"},
                headers=admin_auth_headers,
            )

        # Get audit logs with limit
        response = client.get(
            f"/api/users/admin/users/{regular_user.id}/audit-logs?limit=3",
            headers=admin_auth_headers,
        )
        assert response.status_code == 200

        data = response.json()
        assert len(data) == 3

    def test_no_audit_log_for_unchanged_fields(
        self,
        client,
        db: Session,
        admin_user: UserDB,
        admin_auth_headers: dict,
        regular_user: UserDB,
    ):
        """Test that no audit log is created when fields don't actually change."""
        # Try to update role to the same value
        current_role = regular_user.role
        response = client.put(
            f"/api/users/admin/users/{regular_user.id}",
            json={"role": current_role},
            headers=admin_auth_headers,
        )
        assert response.status_code == 200

        # Check no audit log was created
        audit_logs = (
            db.query(UserAuditLogDB)
            .filter(UserAuditLogDB.target_user_id == regular_user.id)
            .all()
        )
        assert len(audit_logs) == 0

    def test_audit_log_chronological_order(
        self,
        client,
        db: Session,
        admin_user: UserDB,
        admin_auth_headers: dict,
        regular_user: UserDB,
    ):
        """Test that audit logs are returned in reverse chronological order."""
        # Create audit logs in sequence
        client.put(
            f"/api/users/admin/users/{regular_user.id}",
            json={"username": "first"},
            headers=admin_auth_headers,
        )
        client.put(
            f"/api/users/admin/users/{regular_user.id}",
            json={"username": "second"},
            headers=admin_auth_headers,
        )
        client.put(
            f"/api/users/admin/users/{regular_user.id}",
            json={"username": "third"},
            headers=admin_auth_headers,
        )

        # Get audit logs
        response = client.get(
            f"/api/users/admin/users/{regular_user.id}/audit-logs",
            headers=admin_auth_headers,
        )
        assert response.status_code == 200

        data = response.json()
        # Should be in reverse chronological order (newest first)
        assert '"third"' in data[0]["changes"]
        assert '"second"' in data[1]["changes"]
        assert '"first"' in data[2]["changes"]
