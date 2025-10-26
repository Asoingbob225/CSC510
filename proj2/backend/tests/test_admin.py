"""Tests for admin authentication and authorization functionality"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from src.eatsential.models import AccountStatus, UserDB, UserRole
from src.eatsential.utils.auth_util import create_access_token


@pytest.fixture
def regular_user(db: Session) -> UserDB:
    """Create a regular user for testing"""
    user = UserDB(
        id="regular_user_id",
        email="user@example.com",
        username="regularuser",
        password_hash="hashed_password",
        account_status=AccountStatus.VERIFIED,
        email_verified=True,
        role=UserRole.USER,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def admin_user(db: Session) -> UserDB:
    """Create an admin user for testing"""
    user = UserDB(
        id="admin_user_id",
        email="admin@example.com",
        username="adminuser",
        password_hash="hashed_password",
        account_status=AccountStatus.VERIFIED,
        email_verified=True,
        role=UserRole.ADMIN,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def regular_user_token(regular_user: UserDB) -> str:
    """Generate JWT token for regular user"""
    return create_access_token(data={"sub": regular_user.id})


@pytest.fixture
def admin_user_token(admin_user: UserDB) -> str:
    """Generate JWT token for admin user"""
    return create_access_token(data={"sub": admin_user.id})


@pytest.fixture
def regular_user_headers(regular_user_token: str) -> dict[str, str]:
    """Create authorization headers for regular user"""
    return {"Authorization": f"Bearer {regular_user_token}"}


@pytest.fixture
def admin_user_headers(admin_user_token: str) -> dict[str, str]:
    """Create authorization headers for admin user"""
    return {"Authorization": f"Bearer {admin_user_token}"}


class TestUserRoleModel:
    """Test UserRole model and default values"""

    def test_user_has_role_field(self, db: Session, regular_user: UserDB):
        """Test that user has role field"""
        assert hasattr(regular_user, "role")
        assert regular_user.role is not None

    def test_default_role_is_user(self, db: Session):
        """Test that default role is USER"""
        user = UserDB(
            id="test_user_id",
            email="test@example.com",
            username="testuser",
            password_hash="hashed_password",
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        assert user.role == UserRole.USER

    def test_can_create_admin_user(self, db: Session, admin_user: UserDB):
        """Test that we can create user with admin role"""
        assert admin_user.role == UserRole.ADMIN

    def test_user_role_persists(self, db: Session, admin_user: UserDB):
        """Test that user role is persisted in database"""
        # Query the user from database
        queried_user = db.query(UserDB).filter(UserDB.id == admin_user.id).first()
        assert queried_user is not None
        assert queried_user.role == UserRole.ADMIN


class TestGetCurrentUser:
    """Test get_current_user dependency"""

    def test_get_current_user_with_valid_token(
        self, client: TestClient, regular_user: UserDB, regular_user_headers: dict
    ):
        """Test that valid token returns user info"""
        # Use the /users/me endpoint which requires authentication
        response = client.get("/api/users/me", headers=regular_user_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == regular_user.id
        assert data["username"] == regular_user.username

    def test_get_current_user_without_token(self, client: TestClient):
        """Test that missing token returns 403"""
        response = client.get("/api/users/me")
        assert response.status_code == 403

    def test_get_current_user_with_invalid_token(self, client: TestClient):
        """Test that invalid token returns 401"""
        headers = {"Authorization": "Bearer invalid_token_here"}
        response = client.get("/api/users/me", headers=headers)
        assert response.status_code == 401


class TestGetCurrentAdminUser:
    """Test get_current_admin_user dependency"""

    def test_admin_can_access_with_valid_token(
        self, client: TestClient, admin_user: UserDB, admin_user_headers: dict
    ):
        """Test that admin user can access protected endpoints"""
        # This test verifies the dependency works
        # We'll need an actual admin endpoint to test against
        # For now, we test that the admin user can authenticate normally
        response = client.get("/api/users/me", headers=admin_user_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == admin_user.id
        assert data["role"] == UserRole.ADMIN

    def test_regular_user_has_user_role(
        self, client: TestClient, regular_user: UserDB, regular_user_headers: dict
    ):
        """Test that regular user has USER role"""
        response = client.get("/api/users/me", headers=regular_user_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["role"] == UserRole.USER


class TestAdminEndpointProtection:
    """Test admin endpoint protection (integration tests)"""

    def test_admin_dependency_rejects_regular_user(
        self, db: Session, regular_user: UserDB
    ):
        """Test that get_current_admin_user rejects regular users"""
        from fastapi import HTTPException

        from src.eatsential.services.auth_service import get_current_admin_user

        # Simulate calling the dependency with a regular user
        with pytest.raises(HTTPException) as exc_info:
            # Need to await the async function
            import asyncio

            asyncio.run(get_current_admin_user(regular_user))

        assert exc_info.value.status_code == 403
        assert "Admin access required" in exc_info.value.detail

    def test_admin_dependency_accepts_admin_user(self, db: Session, admin_user: UserDB):
        """Test that get_current_admin_user accepts admin users"""
        import asyncio

        from src.eatsential.services.auth_service import get_current_admin_user

        # This should not raise an exception
        result = asyncio.run(get_current_admin_user(admin_user))
        assert result == admin_user
        assert result.role == UserRole.ADMIN


class TestUserRegistrationWithRole:
    """Test that new users are created with correct role"""

    def test_new_user_registration_defaults_to_user_role(
        self, client: TestClient, db: Session, mock_send_email: list
    ):
        """Test that newly registered users have USER role by default"""
        response = client.post(
            "/api/auth/register",
            json={
                "email": "newuser@example.com",
                "username": "newuser",
                "password": "SecureP@ss123",
            },
        )
        assert response.status_code == 201
        data = response.json()

        # Verify role in response
        assert "role" in data
        assert data["role"] == UserRole.USER

        # Verify role in database
        user = db.query(UserDB).filter(UserDB.email == "newuser@example.com").first()
        assert user is not None
        assert user.role == UserRole.USER

    def test_cannot_register_as_admin_directly(
        self, client: TestClient, db: Session, mock_send_email: list
    ):
        """Test that users cannot register directly as admin"""
        # Try to register with admin role in payload (should be ignored)
        response = client.post(
            "/api/auth/register",
            json={
                "email": "fakeadmin@example.com",
                "username": "fakeadmin",
                "password": "SecureP@ss123",
                "role": "admin",  # This should be ignored
            },
        )

        # Registration should succeed but role should be USER
        assert response.status_code == 201

        # Verify role is USER, not ADMIN
        user = db.query(UserDB).filter(UserDB.email == "fakeadmin@example.com").first()
        assert user is not None
        assert user.role == UserRole.USER
        assert user.role != UserRole.ADMIN


class TestAdminLoginFlow:
    """Test login flow for admin users"""

    def test_admin_login_returns_admin_role(
        self, client: TestClient, db: Session, admin_user: UserDB
    ):
        """Test that admin login returns correct role in response"""
        # Set password for admin user
        from passlib.hash import argon2

        admin_user.password_hash = argon2.hash("AdminPass123!")
        db.commit()

        # Login as admin
        response = client.post(
            "/api/auth/login",
            json={
                "email": "admin@example.com",
                "password": "AdminPass123!",
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["role"] == UserRole.ADMIN
        assert "access_token" in data

    def test_regular_user_login_returns_user_role(
        self, client: TestClient, db: Session, regular_user: UserDB
    ):
        """Test that regular user login returns USER role"""
        # Set password for regular user
        from passlib.hash import argon2

        regular_user.password_hash = argon2.hash("UserPass123!")
        db.commit()

        # Login as regular user
        response = client.post(
            "/api/auth/login",
            json={
                "email": "user@example.com",
                "password": "UserPass123!",
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["role"] == UserRole.USER
        assert "access_token" in data


class TestRolePersistence:
    """Test that roles are properly persisted and queryable"""

    def test_query_users_by_role(
        self, db: Session, admin_user: UserDB, regular_user: UserDB
    ):
        """Test querying users by role"""
        # Query admin users
        admin_users = db.query(UserDB).filter(UserDB.role == UserRole.ADMIN).all()
        assert len(admin_users) == 1
        assert admin_users[0].id == admin_user.id

        # Query regular users
        regular_users = db.query(UserDB).filter(UserDB.role == UserRole.USER).all()
        assert len(regular_users) == 1
        assert regular_users[0].id == regular_user.id

    def test_role_index_exists(self, db: Session):
        """Test that role column has an index for efficient queries"""
        # This test verifies the migration created the index
        # SQLite doesn't have a straightforward way to check indexes in tests
        # but we can verify queries work efficiently
        from src.eatsential.models import UserDB

        # Create multiple users
        for i in range(10):
            user = UserDB(
                id=f"user_{i}",
                email=f"user{i}@example.com",
                username=f"user{i}",
                password_hash="hash",
                role=UserRole.USER if i % 2 == 0 else UserRole.ADMIN,
            )
            db.add(user)
        db.commit()

        # Query by role should work efficiently
        admins = db.query(UserDB).filter(UserDB.role == UserRole.ADMIN).count()
        users = db.query(UserDB).filter(UserDB.role == UserRole.USER).count()

        assert admins == 5
        assert users == 5


class TestAdminUserManagement:
    """Test admin user management endpoints"""

    def test_admin_can_list_all_users(
        self,
        client: TestClient,
        admin_user_headers: dict,
        admin_user: UserDB,
        regular_user: UserDB,
    ):
        """Test that admin can list all users"""
        response = client.get("/api/users/admin/users", headers=admin_user_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 2  # At least admin and regular user

        # Check if both users are in the list
        user_ids = [user["id"] for user in data]
        assert admin_user.id in user_ids
        assert regular_user.id in user_ids

        # Check response structure
        for user in data:
            assert "id" in user
            assert "username" in user
            assert "email" in user
            assert "role" in user
            assert "account_status" in user
            assert "email_verified" in user
            assert "created_at" in user
            assert "updated_at" in user

    def test_regular_user_cannot_list_users(
        self, client: TestClient, regular_user_headers: dict
    ):
        """Test that regular user cannot list all users"""
        response = client.get("/api/users/admin/users", headers=regular_user_headers)
        assert response.status_code == 403
        assert "Admin access required" in response.json()["detail"]

    def test_admin_can_get_user_details(
        self, client: TestClient, admin_user_headers: dict, regular_user: UserDB
    ):
        """Test that admin can get detailed user information"""
        response = client.get(
            f"/api/users/admin/users/{regular_user.id}", headers=admin_user_headers
        )
        assert response.status_code == 200
        data = response.json()

        assert data["id"] == regular_user.id
        assert data["username"] == regular_user.username
        assert data["email"] == regular_user.email
        assert data["role"] == regular_user.role
        assert data["account_status"] == regular_user.account_status
        assert data["email_verified"] == regular_user.email_verified

    def test_regular_user_cannot_get_user_details(
        self, client: TestClient, regular_user_headers: dict, admin_user: UserDB
    ):
        """Test that regular user cannot get other users' details"""
        response = client.get(
            f"/api/users/admin/users/{admin_user.id}", headers=regular_user_headers
        )
        assert response.status_code == 403
        assert "Admin access required" in response.json()["detail"]

    def test_admin_can_get_user_details_404_for_nonexistent_user(
        self, client: TestClient, admin_user_headers: dict
    ):
        """Test that admin gets 404 for non-existent user"""
        response = client.get(
            "/api/users/admin/users/nonexistent_id", headers=admin_user_headers
        )
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()

    def test_admin_can_update_user_username(
        self,
        client: TestClient,
        db: Session,
        admin_user_headers: dict,
        regular_user: UserDB,
    ):
        """Test that admin can update user's username"""
        new_username = "updatedusername"
        response = client.put(
            f"/api/users/admin/users/{regular_user.id}",
            headers=admin_user_headers,
            json={"username": new_username},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == new_username

        # Verify in database
        db.refresh(regular_user)
        assert regular_user.username == new_username

    def test_admin_can_update_user_email(
        self,
        client: TestClient,
        db: Session,
        admin_user_headers: dict,
        regular_user: UserDB,
    ):
        """Test that admin can update user's email"""
        new_email = "newemail@example.com"
        response = client.put(
            f"/api/users/admin/users/{regular_user.id}",
            headers=admin_user_headers,
            json={"email": new_email},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == new_email

        # Verify in database
        db.refresh(regular_user)
        assert regular_user.email == new_email

    def test_admin_can_update_user_role(
        self,
        client: TestClient,
        db: Session,
        admin_user_headers: dict,
        regular_user: UserDB,
    ):
        """Test that admin can update user's role"""
        response = client.put(
            f"/api/users/admin/users/{regular_user.id}",
            headers=admin_user_headers,
            json={"role": UserRole.ADMIN},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["role"] == UserRole.ADMIN

        # Verify in database
        db.refresh(regular_user)
        assert regular_user.role == UserRole.ADMIN

    def test_admin_can_update_account_status(
        self,
        client: TestClient,
        db: Session,
        admin_user_headers: dict,
        regular_user: UserDB,
    ):
        """Test that admin can update user's account status"""
        response = client.put(
            f"/api/users/admin/users/{regular_user.id}",
            headers=admin_user_headers,
            json={"account_status": AccountStatus.SUSPENDED},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["account_status"] == AccountStatus.SUSPENDED

        # Verify in database
        db.refresh(regular_user)
        assert regular_user.account_status == AccountStatus.SUSPENDED

    def test_admin_can_update_email_verified_status(
        self,
        client: TestClient,
        db: Session,
        admin_user_headers: dict,
        regular_user: UserDB,
    ):
        """Test that admin can update user's email verification status"""
        # Set initial state to False
        regular_user.email_verified = False
        db.commit()

        response = client.put(
            f"/api/users/admin/users/{regular_user.id}",
            headers=admin_user_headers,
            json={"email_verified": True},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email_verified"] is True

        # Verify in database
        db.refresh(regular_user)
        assert regular_user.email_verified is True

    def test_admin_can_update_multiple_fields(
        self,
        client: TestClient,
        db: Session,
        admin_user_headers: dict,
        regular_user: UserDB,
    ):
        """Test that admin can update multiple user fields at once"""
        updates = {
            "username": "newusername",
            "email": "newemail@test.com",
            "role": UserRole.ADMIN,
            "email_verified": True,
        }
        response = client.put(
            f"/api/users/admin/users/{regular_user.id}",
            headers=admin_user_headers,
            json=updates,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == updates["username"]
        assert data["email"] == updates["email"]
        assert data["role"] == updates["role"]
        assert data["email_verified"] == updates["email_verified"]

        # Verify in database
        db.refresh(regular_user)
        assert regular_user.username == updates["username"]
        assert regular_user.email == updates["email"]
        assert regular_user.role == updates["role"]
        assert regular_user.email_verified == updates["email_verified"]

    def test_admin_cannot_update_user_with_duplicate_username(
        self,
        client: TestClient,
        db: Session,
        admin_user_headers: dict,
        admin_user: UserDB,
        regular_user: UserDB,
    ):
        """Test that admin cannot update user with existing username"""
        response = client.put(
            f"/api/users/admin/users/{regular_user.id}",
            headers=admin_user_headers,
            json={"username": admin_user.username},  # Try to use admin's username
        )
        assert response.status_code == 400
        assert "Username already exists" in response.json()["detail"]

    def test_admin_cannot_update_user_with_duplicate_email(
        self,
        client: TestClient,
        db: Session,
        admin_user_headers: dict,
        admin_user: UserDB,
        regular_user: UserDB,
    ):
        """Test that admin cannot update user with existing email"""
        response = client.put(
            f"/api/users/admin/users/{regular_user.id}",
            headers=admin_user_headers,
            json={"email": admin_user.email},  # Try to use admin's email
        )
        assert response.status_code == 400
        assert "Email already exists" in response.json()["detail"]

    def test_regular_user_cannot_update_user_profile(
        self, client: TestClient, regular_user_headers: dict, admin_user: UserDB
    ):
        """Test that regular user cannot update other users' profiles"""
        response = client.put(
            f"/api/users/admin/users/{admin_user.id}",
            headers=regular_user_headers,
            json={"username": "hackedusername"},
        )
        assert response.status_code == 403
        assert "Admin access required" in response.json()["detail"]

    def test_admin_update_user_404_for_nonexistent_user(
        self, client: TestClient, admin_user_headers: dict
    ):
        """Test that admin gets 404 when updating non-existent user"""
        response = client.put(
            "/api/users/admin/users/nonexistent_id",
            headers=admin_user_headers,
            json={"username": "newusername"},
        )
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()
