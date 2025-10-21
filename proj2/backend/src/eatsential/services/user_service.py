"""User service containing user-related business logic."""

import uuid
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException
from sqlalchemy.orm import Session

from ..auth_util import get_password_hash
from ..emailer import send_verification_email
from ..models import AccountStatus, UserDB
from ..schemas import UserCreate


async def create_user(db: Session, user_data: UserCreate) -> UserDB:
    """Create a new user in the database with enhanced validation

    Args:
        db: Database session
        user_data: User registration data

    Returns:
        Created user object

    Raises:
        HTTPException: If validation fails or user already exists

    """
    # Email validation is already done by Pydantic EmailStr

    # Check for reserved usernames
    reserved_usernames = {"admin", "root", "system", "support", "help", "administrator"}
    if user_data.username.lower() in reserved_usernames:
        raise HTTPException(
            status_code=422,
            detail=[
                {
                    "loc": ["body", "username"],
                    "msg": "This username is reserved",
                    "type": "value_error",
                }
            ],
        )

    # Check if email exists (case-insensitive)
    email_str = str(user_data.email)
    if db.query(UserDB).filter(UserDB.email.ilike(email_str)).first():
        raise HTTPException(
            status_code=422,
            detail=[
                {
                    "loc": ["body", "email"],
                    "msg": "This email address is already registered",
                    "type": "value_error",
                }
            ],
        )

    # Check if username exists (case-insensitive)
    if db.query(UserDB).filter(UserDB.username.ilike(user_data.username)).first():
        raise HTTPException(
            status_code=422,
            detail=[
                {
                    "loc": ["body", "username"],
                    "msg": "This username is already taken",
                    "type": "value_error",
                }
            ],
        )

    # Generate secure verification token
    verification_token = str(uuid.uuid4())
    token_expiry = datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(hours=24)

    # Create user object
    db_user = UserDB(
        id=str(uuid.uuid4()),
        email=email_str.lower(),  # Store email in lowercase
        username=user_data.username,
        password_hash=get_password_hash(user_data.password),
        verification_token=verification_token,
        verification_token_expires=token_expiry,
        account_status=AccountStatus.PENDING,
    )

    try:
        # Save to database
        db.add(db_user)
        db.commit()
        db.refresh(db_user)

        # Send verification email
        email_sent = await send_verification_email(db_user.email, verification_token)

        if not email_sent:
            # Rollback if email sending fails
            db.delete(db_user)
            db.commit()
            raise HTTPException(
                status_code=500,
                detail="Failed to send verification email. Please try again later.",
            )

        return db_user

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="An error occurred during registration. Please try again later.",
        ) from e


async def verify_user_email(db: Session, token: str) -> dict:
    """Verify user's email address

    Args:
        db: Database session
        token: Email verification token

    Returns:
        Success message dictionary

    Raises:
        HTTPException: If token is invalid or expired

    """
    # Find user by verification token
    current_time = datetime.now(timezone.utc).replace(tzinfo=None)
    user = (
        db.query(UserDB)
        .filter(
            UserDB.verification_token == token,
            UserDB.verification_token_expires > current_time,
        )
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=400, detail="Invalid or expired verification token"
        )

    # Update user status
    user.email_verified = True
    user.account_status = AccountStatus.VERIFIED
    user.verification_token = None
    user.verification_token_expires = None

    db.commit()

    return {"message": "Email verified successfully"}


async def resend_verification_email(db: Session, email: str) -> dict:
    """Resend verification email to user

    Args:
        db: Database session
        email: User's email address

    Returns:
        Success message dictionary

    Raises:
        HTTPException: If user not found or already verified

    """
    user = db.query(UserDB).filter(UserDB.email == email).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.email_verified:
        raise HTTPException(status_code=400, detail="Email already verified")

    # Generate new verification token
    verification_token = str(uuid.uuid4())
    user.verification_token = verification_token
    user.verification_token_expires = datetime.now(timezone.utc).replace(
        tzinfo=None
    ) + timedelta(hours=24)
    db.commit()

    # Send new verification email
    await send_verification_email(user.email, verification_token)

    return {"message": "Verification email sent"}
