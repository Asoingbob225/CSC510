"""Authentication service containing authentication-related business logic."""

from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from ..auth_util import verify_token
from ..database import get_db
from ..models import UserDB

# HTTP Bearer authentication scheme
bearer_scheme = HTTPBearer()

# Type alias for dependency injection
SessionDep = Annotated[Session, Depends(get_db)]
BearerDep = Annotated[HTTPAuthorizationCredentials, Depends(bearer_scheme)]


async def get_current_user(
    credentials: BearerDep,
    db: SessionDep,
) -> UserDB:
    """Dependency to get current authenticated user from JWT token

    Args:
        credentials: HTTP Bearer credentials
        db: Database session

    Returns:
        Current user object

    Raises:
        HTTPException: If token is invalid or user not found

    """
    token = credentials.credentials
    payload = verify_token(token)

    user_id = payload.get("sub")
    if user_id is None or not isinstance(user_id, str):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(UserDB).filter(UserDB.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user
