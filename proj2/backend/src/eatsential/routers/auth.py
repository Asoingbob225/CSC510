"""Authentication router for email verification and related endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas import EmailRequest, UserCreate, UserResponse
from ..services.user_service import (
    create_user,
    resend_verification_email,
    verify_user_email,
)

router = APIRouter(
    prefix="/auth",
    tags=["authentication"],
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


@router.get("/verify-email/{token}")
async def verify_email(
    token: str,
    db: Session = Depends(get_db),  # noqa: B008
):
    """Verify user's email address

    Args:
        token: Email verification token
        db: Database session

    Returns:
        Success message if verification succeeds

    Raises:
        HTTPException: If token is invalid or expired

    """
    return await verify_user_email(db, token)


@router.post("/resend-verification")
async def resend_verification(
    email_data: EmailRequest,
    db: Session = Depends(get_db),  # noqa: B008
):
    """Resend verification email

    Args:
        email_data: Email request body containing user's email
        db: Database session

    Returns:
        Success message if email was sent

    Raises:
        HTTPException: If user not found or already verified

    """
    return await resend_verification_email(db, email_data.email)
