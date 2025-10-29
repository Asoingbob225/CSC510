"""
Authentication related functionality.
"""
from datetime import datetime, timedelta
import uuid
from typing import Optional
from fastapi import HTTPException, Depends, Request
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from .models import UserDB, UserCreate, AccountStatus
from .emailer import send_verification_email

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
    Create a new user in the database with enhanced validation
    
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
    reserved_usernames = {'admin', 'root', 'system', 'support', 'help', 'administrator'}
    if user_data.username.lower() in reserved_usernames:
        raise HTTPException(
            status_code=422,
            detail=[{
                "loc": ["body", "username"],
                "msg": "This username is reserved",
                "type": "value_error"
            }]
        )
    
    # Check if email exists (case-insensitive)
    email = str(user_data.email).lower()
    if db.query(UserDB).filter(UserDB.email.ilike(email)).first():
        raise HTTPException(
            status_code=422,
            detail=[{
                "loc": ["body", "email"],
                "msg": "This email address is already registered",
                "type": "value_error"
            }]
        )
    
    # Check if username exists (case-insensitive)
    if db.query(UserDB).filter(UserDB.username.ilike(user_data.username)).first():
        raise HTTPException(
            status_code=422,
            detail=[{
                "loc": ["body", "username"],
                "msg": "This username is already taken",
                "type": "value_error"
            }]
        )
    
    # Generate secure verification token
    verification_token = str(uuid.uuid4())
    token_expiry = datetime.utcnow() + timedelta(hours=24)
    
    # Create user object
    email = str(user_data.email).lower()  # Convert to string and lowercase
    db_user = UserDB(
        id=str(uuid.uuid4()),
        email=email,
        username=user_data.username,
        password_hash=get_password_hash(user_data.password),
        verification_token=verification_token,
        verification_token_expires=token_expiry,
        account_status=AccountStatus.PENDING
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
                detail="Failed to send verification email. Please try again later."
            )
        
        return db_user
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="An error occurred during registration. Please try again later."
        )
