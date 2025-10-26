"""SQLAlchemy ORM models for database tables."""

from datetime import date, datetime, timezone
from enum import Enum
from typing import Optional

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..db.database import Base


def utcnow():
    """Return current UTC time as naive datetime (UTC)."""
    return datetime.now(timezone.utc).replace(tzinfo=None)


class AccountStatus(str, Enum):
    """User account status"""

    PENDING = "pending"
    VERIFIED = "verified"
    SUSPENDED = "suspended"


class UserRole(str, Enum):
    """User role for access control"""

    USER = "user"
    ADMIN = "admin"


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
    role: Mapped[str] = mapped_column(
        String, nullable=False, default=UserRole.USER, index=True
    )

    # Relationships
    health_profile: Mapped[Optional["HealthProfileDB"]] = relationship(
        "HealthProfileDB",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )


class ActivityLevel(str, Enum):
    """Activity level for health profile"""

    SEDENTARY = "sedentary"
    LIGHT = "light"
    MODERATE = "moderate"
    ACTIVE = "active"
    VERY_ACTIVE = "very_active"


class AllergySeverity(str, Enum):
    """Allergy severity levels"""

    MILD = "mild"
    MODERATE = "moderate"
    SEVERE = "severe"
    LIFE_THREATENING = "life_threatening"


class PreferenceType(str, Enum):
    """Dietary preference types"""

    DIET = "diet"
    CUISINE = "cuisine"
    INGREDIENT = "ingredient"
    PREPARATION = "preparation"


class HealthProfileDB(Base):
    """SQLAlchemy model for health profile table"""

    __tablename__ = "health_profiles"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    user_id: Mapped[str] = mapped_column(
        String, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False
    )

    # Biometric Data
    height_cm: Mapped[Optional[float]] = mapped_column(Numeric(5, 2), nullable=True)
    weight_kg: Mapped[Optional[float]] = mapped_column(Numeric(5, 2), nullable=True)
    activity_level: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    metabolic_rate: Mapped[Optional[int]] = mapped_column(String, nullable=True)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=utcnow, onupdate=utcnow, nullable=False
    )

    # Relationships
    user: Mapped["UserDB"] = relationship("UserDB", back_populates="health_profile")
    allergies: Mapped[list["UserAllergyDB"]] = relationship(
        "UserAllergyDB", back_populates="health_profile", cascade="all, delete-orphan"
    )
    dietary_preferences: Mapped[list["DietaryPreferenceDB"]] = relationship(
        "DietaryPreferenceDB",
        back_populates="health_profile",
        cascade="all, delete-orphan",
    )


class AllergenDB(Base):
    """SQLAlchemy model for allergen database table"""

    __tablename__ = "allergen_database"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    is_major_allergen: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False
    )
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=utcnow, nullable=False
    )

    # Relationships
    user_allergies: Mapped[list["UserAllergyDB"]] = relationship(
        "UserAllergyDB", back_populates="allergen"
    )


class UserAllergyDB(Base):
    """SQLAlchemy model for user allergies table"""

    __tablename__ = "user_allergies"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    health_profile_id: Mapped[str] = mapped_column(
        String, ForeignKey("health_profiles.id", ondelete="CASCADE"), nullable=False
    )
    allergen_id: Mapped[str] = mapped_column(
        String, ForeignKey("allergen_database.id"), nullable=False
    )

    # Allergy Information
    severity: Mapped[str] = mapped_column(String(20), nullable=False)
    diagnosed_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    reaction_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Verification
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=utcnow, onupdate=utcnow, nullable=False
    )

    # Relationships
    health_profile: Mapped["HealthProfileDB"] = relationship(
        "HealthProfileDB", back_populates="allergies"
    )
    allergen: Mapped["AllergenDB"] = relationship(
        "AllergenDB", back_populates="user_allergies"
    )


class DietaryPreferenceDB(Base):
    """SQLAlchemy model for dietary preferences table"""

    __tablename__ = "dietary_preferences"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    health_profile_id: Mapped[str] = mapped_column(
        String, ForeignKey("health_profiles.id", ondelete="CASCADE"), nullable=False
    )

    # Preference Details
    preference_type: Mapped[str] = mapped_column(String(50), nullable=False)
    preference_name: Mapped[str] = mapped_column(String(100), nullable=False)
    is_strict: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Reason and Notes
    reason: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=utcnow, onupdate=utcnow, nullable=False
    )

    # Relationships
    health_profile: Mapped["HealthProfileDB"] = relationship(
        "HealthProfileDB", back_populates="dietary_preferences"
    )


class AuditAction(str, Enum):
    """Audit log action types"""

    CREATE = "create"
    UPDATE = "update"
    DELETE = "delete"
    BULK_IMPORT = "bulk_import"


class AllergenAuditLogDB(Base):
    """SQLAlchemy model for allergen audit log table"""

    __tablename__ = "allergen_audit_logs"

    id: Mapped[str] = mapped_column(String, primary_key=True)

    # What was changed
    allergen_id: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    allergen_name: Mapped[str] = mapped_column(String(100), nullable=False)

    # Action details
    action: Mapped[str] = mapped_column(String(20), nullable=False)

    # Who made the change
    admin_user_id: Mapped[str] = mapped_column(
        String, ForeignKey("users.id"), nullable=False
    )
    admin_username: Mapped[str] = mapped_column(String(20), nullable=False)

    # Change details (JSON string)
    changes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Timestamp
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=utcnow, nullable=False
    )

    # Relationships
    admin_user: Mapped["UserDB"] = relationship("UserDB")
