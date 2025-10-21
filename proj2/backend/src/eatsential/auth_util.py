"""Authentication utilities and configuration.

This module provides core authentication utilities including:
- Password hashing and verification
- OAuth2 configuration
- Token management (future: JWT tokens)
"""

from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext

# Password hashing configuration
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

# OAuth2 configuration
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def get_password_hash(password: str) -> str:
    """Hash a password using Argon2

    Args:
        password: Plain text password to hash

    Returns:
        Hashed password string

    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash

    Args:
        plain_password: Plain text password to verify
        hashed_password: Hashed password to compare against

    Returns:
        True if password matches, False otherwise

    """
    return pwd_context.verify(plain_password, hashed_password)
