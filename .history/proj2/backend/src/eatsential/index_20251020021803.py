import uuid
from datetime import datetime, timedelta

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .auth import create_user
from .database import get_db
from .emailer import send_verification_email
from .middleware.rate_limit import RateLimitMiddleware
from .models import AccountStatus, EmailRequest, UserCreate, UserDB, UserResponse

app = FastAPI()

# Configure Rate Limiting
app.add_middleware(RateLimitMiddleware)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Frontend development server
        "https://eatsential.com",  # Production frontend
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api")
def read_root():
    """Health check endpoint"""
    return {"The server is running": "Hello World"}


@app.get("/api/auth/verify-email/{token}")
async def verify_email(token: str, db: Session = Depends(get_db)):
    """
    Verify user's email address

    Args:
        token: Email verification token
        db: Database session

    Returns:
        Success message if verification succeeds

    Raises:
        HTTPException: If token is invalid or expired
    """
    # Find user by verification token
    user = (
        db.query(UserDB)
        .filter(
            UserDB.verification_token == token,
            UserDB.verification_token_expires > datetime.utcnow(),
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


@app.post("/api/auth/resend-verification")
async def resend_verification(email_data: EmailRequest, db: Session = Depends(get_db)):
    """
    Resend verification email

    Args:
        email_data: Email request body
        db: Database session

    Returns:
        Success message if email was sent

    Raises:
        HTTPException: If user not found or already verified
    """
    user = db.query(UserDB).filter(UserDB.email == email_data.email).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.email_verified:
        raise HTTPException(status_code=400, detail="Email already verified")

    # Generate new verification token
    user.verification_token = str(uuid.uuid4())
    user.verification_token_expires = datetime.utcnow() + timedelta(hours=24)
    db.commit()

    # Send new verification email
    await send_verification_email(user.email, user.verification_token)

    return {"message": "Verification email sent"}


from fastapi import Request


@app.post("/api/auth/register", response_model=UserResponse)
async def register_user(
    request: Request, user_data: UserCreate, db: Session = Depends(get_db)
):
    """
    Register a new user

    Args:
        request: FastAPI request object
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
            message="Success! Please check your email for verification instructions."
        )
    except HTTPException:
        # Re-raise HTTP exceptions (like duplicate email)
        raise
    except Exception as e:
        # Log the error (in production, use proper logging)
        print(f"Registration error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred during registration. Please try again later.",
        )
