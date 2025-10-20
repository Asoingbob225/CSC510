"""
Authentication related functionality.
"""

import uuid
from datetime import datetime, timedelta

from fastapi import HTTPException
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from .emailer import send_verification_email
from .models import UserCreate, UserDB

# Password hashing configuration
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

# OAuth2 configuration
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def get_password_hash(password: str) -> str:
    """
    Hash a password using Argon2
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against its hash
    """
    return pwd_context.verify(plain_password, hashed_password)


async def create_user(db: Session, user_data: UserCreate) -> UserDB:
    """
    Create a new user in the database

    Args:
        db: Database session
        user_data: User registration data

    Returns:
        Created user object

    Raises:
        HTTPException: If email or username already exists
    """
    # Check if email exists
    if db.query(UserDB).filter(UserDB.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    # Check if username exists
    if db.query(UserDB).filter(UserDB.username == user_data.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")

    # Create user object
    db_user = UserDB(
        id=str(uuid.uuid4()),
        email=user_data.email,
        username=user_data.username,
        password_hash=get_password_hash(user_data.password),
        verification_token=str(uuid.uuid4()),
        verification_token_expires=datetime.utcnow() + timedelta(hours=24),
    )

    # Save to database
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Send verification email
    await send_verification_email(db_user.email, db_user.verification_token)

    return db_user
