# Admin System Implementation Guide

## Overview

This document describes the admin system foundation implemented for the Eatsential backend. The system adds role-based access control to distinguish between regular users and administrators, along with a reusable FastAPI dependency to protect admin-only endpoints.

## Changes Made

### 1. User Model (`backend/src/eatsential/models/models.py`)

#### Added UserRole Enum

```python
class UserRole(str, Enum):
    """User role for access control"""
    USER = "user"
    ADMIN = "admin"
```

#### Added role field to UserDB

```python
role: Mapped[str] = mapped_column(
    String, nullable=False, default=UserRole.USER, index=True
)
```

- **Type**: String (enum value)
- **Default**: `UserRole.USER` (regular user)
- **Nullable**: No
- **Indexed**: Yes (for efficient role-based queries)

### 2. Schemas (`backend/src/eatsential/schemas/schemas.py`)

#### Updated UserBase Schema

```python
class UserBase(BaseModel):
    """Pydantic model for general user information"""
    username: str
    email: str
    role: str = UserRole.USER
```

The `role` field is now included in user responses, defaulting to `UserRole.USER`.

### 3. Authentication Service (`backend/src/eatsential/services/auth_service.py`)

#### New Admin Dependency

```python
async def get_current_admin_user(
    current_user: Annotated[UserDB, Depends(get_current_user)],
) -> UserDB:
    """Dependency to get current authenticated admin user"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user
```

This dependency:

- Builds on top of `get_current_user` (requires valid JWT authentication)
- Checks if the authenticated user has admin role
- Returns 403 Forbidden if user is not an admin
- Returns the admin user object if authorized

### 4. Database Migration (`backend/alembic/versions/003_add_user_role.py`)

#### Migration Details

- **Revision ID**: `003_add_user_role`
- **Revises**: `002_health_profile`
- **Changes**:
  - Adds `role` column to `users` table
  - Sets default value to `"user"`
  - Creates index on `role` column for performance

#### Upgrade

```sql
ALTER TABLE users ADD COLUMN role VARCHAR NOT NULL DEFAULT 'user';
CREATE INDEX ix_users_role ON users (role);
```

#### Downgrade

```sql
DROP INDEX ix_users_role;
ALTER TABLE users DROP COLUMN role;
```

## Usage

### Protecting Admin-Only Endpoints

```python
from typing import Annotated
from fastapi import APIRouter, Depends
from ..models import UserDB
from ..services.auth_service import get_current_admin_user

admin_router = APIRouter(prefix="/admin", tags=["Admin"])

@admin_router.get("/dashboard")
async def admin_dashboard(
    current_admin: Annotated[UserDB, Depends(get_current_admin_user)],
) -> dict:
    """Admin-only endpoint"""
    return {
        "message": "Welcome to admin dashboard",
        "admin_id": current_admin.id,
        "admin_username": current_admin.username,
    }
```

### Creating an Admin User

Since all new users default to `UserRole.USER`, you'll need to manually update the database to create the first admin user:

#### Option 1: Database Script (Recommended)

```python
# backend/db_initialize/create_admin_user.py
from sqlalchemy.orm import Session
from eatsential.models import UserDB, UserRole
from eatsential.db.database import SessionLocal

def create_admin_user(email: str, username: str, password_hash: str):
    """Create an admin user in the database"""
    db: Session = SessionLocal()
    try:
        user = UserDB(
            id="admin-user-id",  # Generate proper UUID
            email=email,
            username=username,
            password_hash=password_hash,
            role=UserRole.ADMIN,
            account_status="verified",
            email_verified=True,
        )
        db.add(user)
        db.commit()
        print(f"Admin user {username} created successfully")
    except Exception as e:
        db.rollback()
        print(f"Error creating admin user: {e}")
    finally:
        db.close()
```

#### Option 2: Direct SQL

```sql
-- Update existing user to admin
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';

-- Verify
SELECT id, email, username, role FROM users WHERE role = 'admin';
```

### API Authentication Flow

1. **Regular User Authentication**:

   ```
   POST /auth/login
   → Returns JWT token
   → Use token in Authorization header: "Bearer <token>"
   → Access user endpoints with get_current_user dependency
   ```

2. **Admin Authentication**:
   ```
   POST /auth/login (as admin user)
   → Returns JWT token
   → Use token in Authorization header: "Bearer <token>"
   → Access admin endpoints with get_current_admin_user dependency
   ```

### HTTP Status Codes

- **401 Unauthorized**: Invalid or missing JWT token
- **403 Forbidden**: Valid token but insufficient permissions (not an admin)
- **200 OK**: Successful admin access

## Testing

### Test Admin Access

```python
import pytest
from fastapi.testclient import TestClient

def test_admin_endpoint_requires_admin_role(client: TestClient, admin_token: str):
    """Test that admin endpoints require admin role"""
    response = client.get(
        "/admin/dashboard",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200

def test_regular_user_cannot_access_admin_endpoint(client: TestClient, user_token: str):
    """Test that regular users cannot access admin endpoints"""
    response = client.get(
        "/admin/dashboard",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert response.status_code == 403
    assert response.json()["detail"] == "Admin access required"
```

## Security Considerations

1. **Role Assignment**: Only admins should be able to assign admin roles to other users
2. **Audit Logging**: Consider logging all admin actions for security audits
3. **Token Expiration**: Ensure JWT tokens have appropriate expiration times
4. **HTTPS Only**: Admin endpoints should only be accessible over HTTPS in production
5. **Rate Limiting**: Consider adding rate limiting to admin endpoints

## Future Enhancements

1. **Multiple Roles**: Extend to support additional roles (e.g., moderator, super_admin)
2. **Permissions System**: Implement granular permissions beyond simple roles
3. **Role Management Endpoints**: Create admin endpoints to manage user roles
4. **Audit Trail**: Add database table to track admin actions
5. **Role-based UI**: Update frontend to show/hide features based on user role

## File Structure

```
backend/
├── alembic/
│   └── versions/
│       └── 003_add_user_role.py          # Database migration
├── src/
│   └── eatsential/
│       ├── models/
│       │   ├── __init__.py                # Exports UserRole
│       │   └── models.py                  # UserRole enum, UserDB.role field
│       ├── schemas/
│       │   ├── __init__.py
│       │   └── schemas.py                 # UserBase with role field
│       ├── services/
│       │   ├── __init__.py                # Exports get_current_admin_user
│       │   └── auth_service.py            # get_current_admin_user dependency
│       └── routers/
│           └── admin_example.py           # Example admin endpoints
└── docs/
    └── ADMIN_SYSTEM_GUIDE.md             # This file
```

## Summary

The admin system foundation is now in place with:

✅ `UserRole` enum to distinguish user types  
✅ `role` field added to User model with database migration  
✅ `get_current_admin_user` dependency for protecting admin endpoints  
✅ Proper exports in `__init__.py` files  
✅ Database migration applied successfully  
✅ Example admin router demonstrating usage

The system is ready for building admin-specific features and endpoints!
