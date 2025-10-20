"""User model and related database schema definitions."""

import re
from datetime import datetime

from pydantic import BaseModel, EmailStr, constr, validator
from sqlalchemy import Boolean, Column, DateTime, String
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class UserDB(Base):
    """SQLAlchemy model for user database table"""

    __tablename__ = "users"

    id = Column(String, primary_key=True)
    email = Column(String, unique=True, nullable=False, index=True)
    username = Column(String(20), unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    email_verified = Column(Boolean, default=False)
    verification_token = Column(String, nullable=True)
    verification_token_expires = Column(DateTime, nullable=True)


class UserCreate(BaseModel):
    """Pydantic model for user registration request"""

    username: constr(min_length=3, max_length=20)  # type: ignore
    email: EmailStr
    password: constr(min_length=8, max_length=48)  # type: ignore

    @validator("password")
    def password_validation(self, v):
        """Validate password meets all requirements"""
        if len(v) < 8 or len(v) > 48:
            raise ValueError("between 8 and 48 characters")
        if not any(c.isupper() for c in v):
            raise ValueError("at least one uppercase letter")
        if not any(c.islower() for c in v):
            raise ValueError("at least one lowercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("at least one number")
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError("at least one special character")
        return v


class UserResponse(BaseModel):
    """Pydantic model for user response"""

    id: str
    username: str
    email: str
    message: str = "Verification email sent"

    class Config:
        """Pydantic config"""

        from_attributes = True
