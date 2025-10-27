"""User resource management router.

This router handles user-specific CRUD operations.
For authentication-related endpoints (register, login, etc.), see auth.py
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..db.database import get_db
from ..models import UserDB
from ..schemas import (
    UserAuditLogResponse,
    UserDetailResponse,
    UserListResponse,
    UserProfileUpdate,
    UserResponse,
)
from ..services.auth_service import get_current_admin_user, get_current_user
from ..services.user_service import (
    get_user_audit_logs,
    update_user_profile_with_audit,
)

router = APIRouter(
    prefix="/users",
    tags=["users"],
)

CurrentUserDep = Annotated[UserDB, Depends(get_current_user)]
AdminUserDep = Annotated[UserDB, Depends(get_current_admin_user)]
SessionDep = Annotated[Session, Depends(get_db)]


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: CurrentUserDep):
    """Get current authenticated user's profile

    This is a protected endpoint that requires a valid JWT token.

    Args:
        current_user: Current authenticated user from JWT token

    Returns:
        User profile information

    """
    return UserResponse(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        role=current_user.role,
        message="Profile retrieved successfully",
    )


# --- Admin User Management Endpoints ---


@router.get("/admin/users", response_model=list[UserListResponse])
async def list_users(
    db: SessionDep,
    current_user: AdminUserDep,
):
    """List all users (Admin only)

    This endpoint allows administrators to retrieve a list of all users
    in the system with their basic information.

    Args:
        db: Database session
        current_user: Current authenticated admin user

    Returns:
        List of all users with their basic information

    Raises:
        HTTPException: 403 if user is not an admin

    """
    users = db.query(UserDB).all()
    return users


@router.get("/admin/users/{user_id}", response_model=UserDetailResponse)
async def get_user_details(
    user_id: str,
    db: SessionDep,
    current_user: AdminUserDep,
):
    """Get detailed information about a specific user (Admin only)

    This endpoint allows administrators to retrieve detailed information
    about a specific user by their ID.

    Args:
        user_id: The ID of the user to retrieve
        db: Database session
        current_user: Current authenticated admin user

    Returns:
        Detailed user information

    Raises:
        HTTPException: 403 if user is not an admin
        HTTPException: 404 if user is not found

    """
    user = db.query(UserDB).filter(UserDB.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found",
        )
    return user


@router.put("/admin/users/{user_id}", response_model=UserDetailResponse)
async def update_user_profile(
    user_id: str,
    user_update: UserProfileUpdate,
    db: SessionDep,
    current_user: AdminUserDep,
):
    """Update a user's basic profile (Admin only)

    This endpoint allows administrators to update a user's basic profile
    information including username, email, role, account status, and
    email verification status. All changes are logged in the audit trail.

    Args:
        user_id: The ID of the user to update
        user_update: The user profile update data
        db: Database session
        current_user: Current authenticated admin user

    Returns:
        Updated user information

    Raises:
        HTTPException: 403 if user is not an admin
        HTTPException: 404 if user is not found
        HTTPException: 400 if username or email already exists

    """
    # Convert Pydantic model to dict, excluding None values
    update_dict = user_update.model_dump(exclude_none=True)

    # Use the new audit-logging service
    updated_user = await update_user_profile_with_audit(
        db=db,
        user_id=user_id,
        user_update=update_dict,
        admin_user_id=current_user.id,
        admin_username=current_user.username,
    )

    return updated_user


@router.get(
    "/admin/users/{user_id}/audit-logs", response_model=list[UserAuditLogResponse]
)
async def get_user_audit_history(
    user_id: str,
    db: SessionDep,
    current_user: AdminUserDep,
    limit: int = 100,
):
    """Get audit log history for a specific user (Admin only)

    This endpoint allows administrators to view all administrative actions
    performed on a user's account, including role changes, status updates,
    and profile modifications.

    Args:
        user_id: The ID of the user to get audit logs for
        db: Database session
        current_user: Current authenticated admin user
        limit: Maximum number of audit logs to return (default: 100)

    Returns:
        List of audit log entries for the user

    Raises:
        HTTPException: 403 if user is not an admin
        HTTPException: 404 if user is not found

    """
    # Verify user exists
    user = db.query(UserDB).filter(UserDB.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found",
        )

    # Get audit logs
    audit_logs = get_user_audit_logs(db=db, target_user_id=user_id, limit=limit)

    return audit_logs


@router.get("/admin/audit-logs", response_model=list[UserAuditLogResponse])
async def get_all_user_audit_history(
    db: SessionDep,
    current_user: AdminUserDep,
    limit: int = 100,
):
    """Get all user audit log history (Admin only)

    This endpoint allows administrators to view all administrative actions
    performed on all user accounts, including role changes, status updates,
    and profile modifications.

    Args:
        db: Database session
        current_user: Current authenticated admin user
        limit: Maximum number of audit logs to return (default: 100)

    Returns:
        List of all audit log entries

    Raises:
        HTTPException: 403 if user is not an admin

    """
    # Get all audit logs (no user_id filter)
    audit_logs = get_user_audit_logs(db=db, target_user_id=None, limit=limit)

    return audit_logs


# Future endpoints:
# @router.put("/me") - Update current user profile
# @router.delete("/me") - Delete current user account
# @router.get("/me/preferences") - Get user preferences
# @router.put("/me/preferences") - Update user preferences
