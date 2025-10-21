"""User resource management router.

This router handles user-specific CRUD operations.
For authentication-related endpoints (register, login, etc.), see auth.py
"""

from fastapi import APIRouter

router = APIRouter(
    prefix="/users",
    tags=["users"],
)


# Future endpoints:
# @router.get("/me") - Get current user profile
# @router.put("/me") - Update current user profile
# @router.delete("/me") - Delete current user account
# @router.get("/me/preferences") - Get user preferences
# @router.put("/me/preferences") - Update user preferences
