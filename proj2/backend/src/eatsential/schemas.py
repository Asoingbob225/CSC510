"""Pydantic schemas for API request/response validation."""

import re
from typing import Annotated

from pydantic import BaseModel, ConfigDict, EmailStr, constr, field_validator


class UserCreate(BaseModel):
    """Pydantic model for user registration request"""

    username: Annotated[
        str, constr(pattern=r"^[a-zA-Z0-9_-]+$", min_length=3, max_length=20)
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


class EmailRequest(BaseModel):
    """Pydantic model for email request body"""

    email: EmailStr


class UserResponse(BaseModel):
    """Pydantic model for user response"""

    model_config = ConfigDict(from_attributes=True)

    id: str
    username: str
    email: str
    message: str = "Verification email sent"
