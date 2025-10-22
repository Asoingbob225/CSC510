"""Pydantic schemas for API request/response validation."""

import re
from typing import Annotated

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class UserBase(BaseModel):
    """Pydantic model for general user information"""

    username: str
    email: str


class UserCreate(BaseModel):
    """Pydantic model for user registration request"""

    username: Annotated[
        str, Field(min_length=3, max_length=20, pattern=r"^[a-zA-Z0-9_-]+$")
    ]
    email: EmailStr
    password: str

    @field_validator("username")
    @classmethod
    def username_reserved_validation(cls, value: str) -> str:
        """Validate username is not reserved"""
        reserved_usernames = {
            "admin",
            "root",
            "system",
            "support",
            "help",
            "administrator",
        }
        if value.lower() in reserved_usernames:
            raise ValueError("this username is reserved")
        return value

    @field_validator("password")
    @classmethod
    def password_validation(cls, value: str) -> str:
        """Validate password meets all requirements"""
        if len(value) < 8:
            raise ValueError("string should have at least 8 characters")
        if len(value) > 48:
            raise ValueError("string should have at most 48 characters")
        if not any(c.isupper() for c in value):
            raise ValueError("password must contain at least one uppercase letter")
        if not any(c.islower() for c in value):
            raise ValueError("password must contain at least one lowercase letter")
        if not any(c.isdigit() for c in value):
            raise ValueError("password must contain at least one number")
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', value):
            raise ValueError("password must contain at least one special character")
        return value


class UserLogin(BaseModel):
    """Pydantic model for user login request"""

    email: EmailStr
    password: str


class UserResponse(UserBase):
    """Pydantic model for user response"""

    model_config = ConfigDict(from_attributes=True)
    id: str
    message: str


class LoginResponse(UserBase):
    """Pydantic model for login response with JWT token"""

    model_config = ConfigDict(from_attributes=True)
    id: str
    access_token: str
    token_type: str = "bearer"  # noqa: S105
    message: str


class EmailRequest(BaseModel):
    """Pydantic model for email request body"""

    email: EmailStr


# --- Common Schemas ---


class MessageResponse(BaseModel):
    """Generic message response schema"""

    model_config = ConfigDict(from_attributes=True)

    message: str
