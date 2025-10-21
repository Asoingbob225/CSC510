from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..auth import create_user
from ..database import get_db
from ..schemas import UserCreate, UserResponse

router = APIRouter(
    prefix="/users",
    tags=["users"],
)


@router.post("/register", response_model=UserResponse, status_code=201)
async def register_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),  # noqa: B008
):
    """Register a new user

    Args:
        user_data: User registration data
        db: Database session

    Returns:
        UserResponse with success message

    Raises:
        HTTPException: If registration fails

    """
    # Rate limiting is handled by middleware
    try:
        # Input sanitization is handled by Pydantic model

        # Create user and send verification email
        user = await create_user(db, user_data)

        # Return success response
        return UserResponse(
            id=user.id,
            username=user.username,
            email=user.email,
            message="Success! Please check your email for verification instructions.",
        )
    except HTTPException:
        # Re-raise HTTP exceptions (like duplicate email)
        raise
    except Exception as e:
        # Log the error (in production, use proper logging)
        print(f"Registration error: {e!s}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred during registration. Please try again later.",
        ) from e
