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
    UserDetailResponse,
    UserListResponse,
    UserProfileUpdate,
    UserResponse,
)
from ..services.auth_service import get_current_admin_user, get_current_user

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
    email verification status.

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
    user = db.query(UserDB).filter(UserDB.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found",
        )

    # Check if username is being updated and if it already exists
    if user_update.username is not None and user_update.username != user.username:
        existing_user = (
            db.query(UserDB).filter(UserDB.username == user_update.username).first()
        )
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already exists",
            )
        user.username = user_update.username

    # Check if email is being updated and if it already exists
    if user_update.email is not None and user_update.email != user.email:
        existing_user = (
            db.query(UserDB).filter(UserDB.email == user_update.email).first()
        )
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already exists",
            )
        user.email = user_update.email

    # Update other fields if provided
    if user_update.role is not None:
        user.role = user_update.role

    if user_update.account_status is not None:
        user.account_status = user_update.account_status

    if user_update.email_verified is not None:
        user.email_verified = user_update.email_verified

    db.commit()
    db.refresh(user)
    return user


# Future endpoints:
# @router.put("/me") - Update current user profile
# @router.delete("/me") - Delete current user account
# @router.get("/me/preferences") - Get user preferences
# @router.put("/me/preferences") - Update user preferences
