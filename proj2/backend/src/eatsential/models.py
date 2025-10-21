"""SQLAlchemy ORM models for database tables."""

from datetime import datetime, timezone
from enum import Enum
from typing import Optional

from sqlalchemy import Boolean, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base


def utcnow():
    """Return current UTC time as naive datetime (UTC)."""
    return datetime.now(timezone.utc).replace(tzinfo=None)


class AccountStatus(str, Enum):
    """User account status"""

    PENDING = "pending"
    VERIFIED = "verified"
    SUSPENDED = "suspended"


class UserDB(Base):
    """SQLAlchemy model for user database table"""

    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    username: Mapped[str] = mapped_column(
        String(20), unique=True, nullable=False, index=True
    )
    password_hash: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=utcnow, onupdate=utcnow, nullable=False
    )
    account_status: Mapped[str] = mapped_column(
        String, nullable=False, default=AccountStatus.PENDING
    )
    email_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    verification_token: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    verification_token_expires: Mapped[Optional[datetime]] = mapped_column(
        DateTime, nullable=True
    )
