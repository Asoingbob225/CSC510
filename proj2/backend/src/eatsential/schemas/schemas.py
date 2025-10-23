"""Pydantic schemas for API request/response validation."""

import re
from datetime import date, datetime
from typing import Annotated, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from ..models.models import (
    ActivityLevel,
    AllergySeverity,
    PreferenceType,
)


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


# --- Health Profile Schemas ---


class UserAllergyCreate(BaseModel):
    """Schema for creating a user allergy"""

    allergen_id: str
    severity: AllergySeverity
    diagnosed_date: Optional[date] = None
    reaction_type: Optional[str] = Field(None, max_length=50)
    notes: Optional[str] = None
    is_verified: bool = False


class UserAllergyUpdate(BaseModel):
    """Schema for updating a user allergy"""

    severity: Optional[AllergySeverity] = None
    diagnosed_date: Optional[date] = None
    reaction_type: Optional[str] = Field(None, max_length=50)
    notes: Optional[str] = None
    is_verified: Optional[bool] = None


class UserAllergyResponse(BaseModel):
    """Schema for user allergy response"""

    model_config = ConfigDict(from_attributes=True)

    id: str
    health_profile_id: str
    allergen_id: str
    severity: str
    diagnosed_date: Optional[date] = None
    reaction_type: Optional[str] = None
    notes: Optional[str] = None
    is_verified: bool
    created_at: datetime
    updated_at: datetime


class DietaryPreferenceCreate(BaseModel):
    """Schema for creating a dietary preference"""

    preference_type: PreferenceType
    preference_name: Annotated[str, Field(min_length=1, max_length=100)]
    is_strict: bool = True
    reason: Optional[str] = None
    notes: Optional[str] = None


class DietaryPreferenceUpdate(BaseModel):
    """Schema for updating a dietary preference"""

    preference_name: Optional[Annotated[str, Field(min_length=1, max_length=100)]] = (
        None
    )
    is_strict: Optional[bool] = None
    reason: Optional[str] = None
    notes: Optional[str] = None


class DietaryPreferenceResponse(BaseModel):
    """Schema for dietary preference response"""

    model_config = ConfigDict(from_attributes=True)

    id: str
    health_profile_id: str
    preference_type: str
    preference_name: str
    is_strict: bool
    reason: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class HealthProfileCreate(BaseModel):
    """Schema for creating a health profile"""

    height_cm: Optional[Annotated[float, Field(gt=0, lt=300)]] = None
    weight_kg: Optional[Annotated[float, Field(gt=0, lt=500)]] = None
    activity_level: Optional[ActivityLevel] = None
    metabolic_rate: Optional[int] = None


class HealthProfileUpdate(BaseModel):
    """Schema for updating a health profile"""

    height_cm: Optional[Annotated[float, Field(gt=0, lt=300)]] = None
    weight_kg: Optional[Annotated[float, Field(gt=0, lt=500)]] = None
    activity_level: Optional[ActivityLevel] = None
    metabolic_rate: Optional[int] = None


class HealthProfileResponse(BaseModel):
    """Schema for health profile response"""

    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    activity_level: Optional[str] = None
    metabolic_rate: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    allergies: list[UserAllergyResponse] = []
    dietary_preferences: list[DietaryPreferenceResponse] = []


class AllergenResponse(BaseModel):
    """Schema for allergen response"""

    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    category: str
    is_major_allergen: bool
    description: Optional[str] = None
