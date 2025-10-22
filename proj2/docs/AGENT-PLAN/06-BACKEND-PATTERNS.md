# Backend Patterns

## Project Structure (Actual Implementation)

```
backend/
├── src/
│   └── eatsential/
│       ├── __init__.py
│       ├── index.py           # FastAPI app entry point
│       ├── db/
│       │   └── database.py    # Database configuration
│       ├── core/
│       │   ├── __init__.py
│       │   ├── config.py      # Application-wide configurations
│       │   └── dependencies.py # Dependency injection
│       ├── models/
│       │   └── models.py      # SQLAlchemy models
│       ├── schemas/
│       │   └── schemas.py     # Pydantic schemas
│       ├── services/
│       │   ├── __init__.py
│       │   ├── auth_service.py # Authentication business logic
│       │   ├── user_service.py # User business logic
│       │   ├── emailer.py     # Email service abstraction
│       │   └── emailer_ses.py # AWS SES implementation
│       ├── utils/
│       │   └── auth_util.py   # Authentication utilities
│       ├── middleware/
│       │   ├── __init__.py
│       │   └── rate_limit.py  # Rate limiting middleware
│       └── routers/
│           ├── __init__.py
│           ├── auth.py        # Authentication endpoints
│           └── users.py       # User endpoints (placeholder)
├── alembic/                   # Database migrations
├── tests/
│   ├── __init__.py
│   ├── test_index.py
│   └── routers/
│       └── test_api.py
├── pyproject.toml             # Project dependencies
└── README.md
```

## API Endpoint Pattern

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..schemas import user as user_schemas
from ..services import user as user_service
from ..utils.security import get_current_user

# From auth.py
router = APIRouter(prefix="/auth", tags=["authentication"])

SessionDep = Annotated[Session, Depends(get_db)]

@router.post("/register", response_model=UserResponse, status_code=201)
async def register_user(
    user_data: UserCreate,
    db: SessionDep,
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
    try:
        # Create user and send verification email
        user = await create_user(db, user_data)

        return UserResponse(
            id=user.id,
            username=user.username,
            email=user.email,
            message="Success! Please check your email for verification instructions.",
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Registration error: {e!s}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred during registration. Please try again later.",
        ) from e
```

## Pydantic Schemas

```python
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import datetime
import re

# From schemas.py
class UserCreate(BaseModel):
    """Schema for user registration"""
    username: str = Field(..., min_length=3, max_length=20)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=48)

    @field_validator("password")
    @classmethod
    def password_validation(cls, value: str) -> str:
        """Validate password meets all requirements"""
        if len(value) < 8:
            raise ValueError("string should have at least 8 characters")
        if len(value) > 48:
            raise ValueError("string should have at most 48 characters")
        if not any(c.isupper() for c in value):
            raise ValueError("password must contain at least one uppercase letter")
        if not any(c.islower() for c in value):
            raise ValueError("password must contain at least one lowercase letter")
        if not any(c.isdigit() for c in value):
            raise ValueError("password must contain at least one number")
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', value):
            raise ValueError("password must contain at least one special character")
        return value

class UserResponse(BaseModel):
    """Response schema for user operations"""
    id: str
    username: str
    email: str
    message: str = "Operation completed successfully"

    model_config = ConfigDict(from_attributes=True)
class EmailRequest(BaseModel):
    """Request schema for email operations"""
    email: EmailStr

class MessageResponse(BaseModel):
    """Generic message response"""
    message: str
```

## Service Layer Pattern (Actual Implementation)

```python
# From user_service.py
from datetime import datetime, timedelta
from typing import Optional
from uuid import uuid4

from fastapi import HTTPException
from sqlalchemy.orm import Session

from ..auth_util import get_password_hash, verify_password
from ..emailer import email_service
from ..models import User
from ..schemas import UserCreate

async def create_user(db: Session, user_data: UserCreate) -> User:
    """Create a new user with email verification"""
    # Check if user exists
    existing_user = db.query(User).filter(
        (User.email == user_data.email.lower()) |
        (User.username == user_data.username)
    ).first()

    if existing_user:
        if existing_user.email == user_data.email.lower():
            raise HTTPException(status_code=400, detail="Email already registered")
        else:
            raise HTTPException(status_code=400, detail="Username already taken")

    # Create user with verification token
    verification_token = str(uuid4())
    new_user = User(
        username=user_data.username,
        email=user_data.email.lower(),
        password_hash=get_password_hash(user_data.password),
        verification_token=verification_token,
        verification_token_expires=datetime.utcnow() + timedelta(hours=24),
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Send verification email
    await email_service.send_verification_email(
        new_user.email,
        new_user.username,
        verification_token,
    )

    return new_user

async def verify_user_email(db: Session, token: str) -> dict:
    """Verify user's email with token"""
    user = db.query(User).filter(
        User.verification_token == token,
        User.verification_token_expires > datetime.utcnow(),
    ).first()

    if not user:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired verification token",
        )

    user.is_email_verified = True
    user.verification_token = None
    user.verification_token_expires = None

    db.commit()

    return {"message": "Email verified successfully! You can now log in."}
```

## Database Models (Actual Implementation)

```python
# From models.py
from sqlalchemy import Boolean, Column, DateTime, String
from sqlalchemy.sql import func

from .database import Base
import uuid


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String(20), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    is_email_verified = Column(Boolean, default=False, nullable=False)
    verification_token = Column(String(255), nullable=True, index=True)
    verification_token_expires = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    def __repr__(self):
        return f"<User(username='{self.username}', email='{self.email}')>"
```

## Error Handling

```python
from fastapi import HTTPException, status

class AppError(Exception):
    """Base application error."""
    pass

class NotFoundError(AppError):
    """Resource not found."""
    pass

class ValidationError(AppError):
    """Validation failed."""
    pass

def handle_service_error(error: Exception) -> HTTPException:
    """Convert service errors to HTTP exceptions."""
    if isinstance(error, NotFoundError):
        return HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error)
        )
    elif isinstance(error, ValidationError):
        return HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error)
        )
    else:
        # Log unexpected errors
        logger.error(f"Unexpected error: {error}")
        return HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )
```

## Authentication & Security (Current Implementation)

```python
# From auth_util.py
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    """Hash a password using bcrypt"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)

# JWT authentication planned but not yet implemented
# Current authentication relies on email verification tokens
```

## Middleware Pattern

```python
# From middleware/rate_limit.py
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Callable

from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, calls: int = 100, period: timedelta = timedelta(minutes=1)):
        super().__init__(app)
        self.calls = calls
        self.period = period
        self.clients = defaultdict(list)

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        client_ip = request.client.host
        now = datetime.now()

        # Clean old entries
        self.clients[client_ip] = [
            timestamp for timestamp in self.clients[client_ip]
            if now - timestamp < self.period
        ]

        # Check rate limit
        if len(self.clients[client_ip]) >= self.calls:
            return JSONResponse(
                status_code=429,
                content={"detail": "Rate limit exceeded"},
                headers={
                    "X-RateLimit-Limit": str(self.calls),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": str(int((now + self.period).timestamp()))
                }
            )

        # Track request
        self.clients[client_ip].append(now)

        # Process request
        response = await call_next(request)

        # Add rate limit headers
        response.headers["X-RateLimit-Limit"] = str(self.calls)
        response.headers["X-RateLimit-Remaining"] = str(self.calls - len(self.clients[client_ip]))

        return response
```

## Testing Patterns

```python
import pytest
from httpx import AsyncClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from ..main import app
from ..core.database import Base, get_db

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture
def test_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
async def client(test_db):
    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

@pytest.mark.asyncio
async def test_register_user(client: AsyncClient):
    """Test user registration endpoint."""
    response = await client.post(
        "/api/auth/register",
        json={
            "email": "test@example.com",
            "username": "testuser",
            "password": "TestPass123!"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["username"] == "testuser"
    assert "password" not in data
    assert "message" in data
```

## Logging & Monitoring

```python
import logging
from contextlib import asynccontextmanager
from fastapi import Request
import time

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all requests with timing."""
    start_time = time.time()

    # Log request
    logger.info(f"Request: {request.method} {request.url.path}")

    # Process request
    response = await call_next(request)

    # Log response
    process_time = time.time() - start_time
    logger.info(
        f"Response: {request.method} {request.url.path} "
        f"- Status: {response.status_code} "
        f"- Time: {process_time:.3f}s"
    )

    return response
```

## Database Migrations

```bash
# Create migration
alembic revision --autogenerate -m "Add user table"

# Run migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

```python
# alembic/env.py
from app.core.database import Base
from app.models import *  # Import all models

target_metadata = Base.metadata
```

---

**Examples in codebase**:

- `index.py` - Basic FastAPI setup
- `tests/` - Test examples
