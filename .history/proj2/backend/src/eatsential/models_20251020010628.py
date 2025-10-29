"""
User model and related database schema definitions.
"""
import re
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, constr, field_validator, validator
from email_validator import validate_email, EmailNotValidError
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
    username: constr(pattern=r'^[a-zA-Z0-9_-]+$', min_length=3, max_length=20)  # type: ignore
    email: str
    password: str

    @field_validator('email')
    @classmethod
    def email_validation(cls, value: str) -> str:
        """Validate email format"""
        try:
            email = validate_email(value).email
            return email.lower()
        except EmailNotValidError:
            raise ValueError("invalid email format")

    @field_validator('username')
    @classmethod
    def username_reserved_validation(cls, value: str) -> str:
        """Validate username is not reserved"""
        reserved_usernames = {'admin', 'root', 'system', 'support', 'help', 'administrator'}
        if value.lower() in reserved_usernames:
            raise ValueError("this username is reserved")
        return value

    @field_validator('password')
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
