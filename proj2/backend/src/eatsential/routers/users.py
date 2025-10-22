"""User resource management router.

This router handles user-specific CRUD operations.
For authentication-related endpoints (register, login, etc.), see auth.py
"""

from typing import Annotated

from fastapi import APIRouter, Depends

from ..models import UserDB
from ..schemas import UserResponse
from ..services.auth_service import get_current_user

router = APIRouter(
    prefix="/users",
    tags=["users"],
)

CurrentUserDep = Annotated[UserDB, Depends(get_current_user)]


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
        message="Profile retrieved successfully",
    )


# Future endpoints:
# @router.put("/me") - Update current user profile
# @router.delete("/me") - Delete current user account
# @router.get("/me/preferences") - Get user preferences
# @router.put("/me/preferences") - Update user preferences
