# Backend Patterns

## Project Structure

```
backend/
├── api/
│   ├── __init__.py
│   ├── auth.py        # Auth endpoints
│   ├── users.py       # User endpoints
│   └── health.py      # Health profile endpoints
├── models/
│   ├── __init__.py
│   ├── user.py        # SQLAlchemy models
│   └── health.py
├── schemas/
│   ├── __init__.py
│   ├── user.py        # Pydantic schemas
│   └── health.py
├── services/
│   ├── __init__.py
│   ├── auth.py        # Business logic
│   └── health.py
├── utils/
│   ├── __init__.py
│   ├── security.py    # Password hashing, JWT
│   └── validators.py  # Custom validators
├── core/
│   ├── __init__.py
│   ├── config.py      # Settings
│   └── database.py    # DB connection
└── main.py            # FastAPI app
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

router = APIRouter(prefix="/api/v1/users", tags=["users"])

@router.post("/", response_model=user_schemas.UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: user_schemas.UserCreate,
    db: Session = Depends(get_db)
):
    """Create a new user."""
    # Check if user exists
    if user_service.get_user_by_email(db, user_data.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )
    
    # Create user
    user = user_service.create_user(db, user_data)
    return user

@router.get("/me", response_model=user_schemas.UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """Get current user information."""
    return current_user
```

## Pydantic Schemas

```python
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import datetime
import re

class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    
    @validator('password')
    def validate_password(cls, v):
        if not re.match(r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])', v):
            raise ValueError('Password must contain uppercase, lowercase, number and special character')
        return v

class UserResponse(UserBase):
    id: str
    email_verified: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class HealthProfileCreate(BaseModel):
    allergies: List[AllergyInput]
    dietary_restrictions: List[str]
    medical_conditions: List[str]
    
    @validator('allergies')
    def validate_allergies(cls, v):
        # Validate against approved list
        for allergy in v:
            if allergy.name not in APPROVED_ALLERGENS:
                raise ValueError(f"Invalid allergen: {allergy.name}")
        return v
```

## Service Layer Pattern

```python
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import Optional
import bcrypt

from ..models.user import User
from ..schemas.user import UserCreate

def create_user(db: Session, user_data: UserCreate) -> User:
    """Create a new user with hashed password."""
    # Hash password
    password_hash = bcrypt.hashpw(
        user_data.password.encode('utf-8'),
        bcrypt.gensalt()
    ).decode('utf-8')
    
    # Create user instance
    user = User(
        email=user_data.email,
        username=user_data.username,
        password_hash=password_hash
    )
    
    # Save to database
    try:
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    except IntegrityError:
        db.rollback()
        raise ValueError("User already exists")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return bcrypt.checkpw(
        plain_password.encode('utf-8'),
        hashed_password.encode('utf-8')
    )
```

## Database Models

```python
from sqlalchemy import Column, String, Boolean, ForeignKey, Enum, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from ..core.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    email_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    health_profile = relationship("HealthProfile", back_populates="user", uselist=False)
    
    def __repr__(self):
        return f"<User(email='{self.email}', username='{self.username}')>"
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

## Authentication & Security

```python
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(
        to_encode, 
        settings.SECRET_KEY, 
        algorithm=settings.ALGORITHM
    )
    return encoded_jwt

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = get_user(db, user_id=user_id)
    if user is None:
        raise credentials_exception
    return user
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
async def test_create_user(client: AsyncClient):
    """Test user creation endpoint."""
    response = await client.post(
        "/api/v1/users/",
        json={
            "email": "test@example.com",
            "username": "testuser",
            "password": "TestPass123!"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"
    assert "password" not in data
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
