from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .auth import create_user
from .database import get_db
from .middleware.rate_limit import RateLimitMiddleware
from .models import UserCreate, UserResponse

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
    return {"status": "healthy", "message": "API server is running"}


# Create a dependency
get_db_dependency = Depends(get_db)

@app.post("/api/auth/register", response_model=UserResponse)
async def register_user(user_data: UserCreate, db: Session = get_db_dependency):
    """Register a new user

    Args:
        user_data: User registration data
        db: Database session

    Returns:
        UserResponse with success message

    Raises:
        HTTPException: If registration fails

    """
    try:
        user = await create_user(db, user_data)
        return UserResponse(id=user.id, username=user.username, email=user.email)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail="An error occurred during registration"
        ) from e
