"""
User model and related database schema definitions.
"""
import re
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, constr, field_validator
from sqlalchemy import Column, String, DateTime, Boolean
from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    """Base class for all models"""
    pass



from enum import Enum

class AccountStatus(str, Enum):
    """User account status"""
    PENDING = "pending"
    VERIFIED = "verified"
    SUSPENDED = "suspended"

class UserDB(Base):
    """
    SQLAlchemy model for user database table
    """
    __tablename__ = "users"

    id = Column(String, primary_key=True)
    email = Column(String, unique=True, nullable=False, index=True)
    username = Column(String(20), unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    account_status = Column(String, nullable=False, default=AccountStatus.PENDING)
    email_verified = Column(Boolean, default=False)
    verification_token = Column(String, nullable=True)
    verification_token_expires = Column(DateTime, nullable=True)

RESERVED_USERNAMES = {"admin", "administrator", "support", "system", "root", "superuser"}

class UserCreate(BaseModel):
    """
    Pydantic model for user registration request
    """
    username: constr(min_length=3, max_length=20)  # type: ignore
    email: EmailStr
    password: constr(min_length=8, max_length=48)  # type: ignore

    @field_validator('username')
    @classmethod
    def username_validation(cls, v):
        """Validate username format"""
        if not re.match(r'^[a-zA-Z0-9_-]+$', v):
            raise ValueError("only letters, numbers, underscores, and hyphens")
        return v

    @field_validator('password')
    @classmethod
    def password_validation(cls, v):
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

class EmailRequest(BaseModel):
    """
    Pydantic model for email request body
    """
    email: EmailStr

class UserResponse(BaseModel):
    """
    Pydantic model for user response
    """
    id: str
    username: str
    email: str
    message: str = "Verification email sent"

    class Config:
        """Pydantic config"""
        from_attributes = True
