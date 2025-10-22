# Database Design

## Current Implementation

### Database Configuration

**Development**: SQLite

```python
DATABASE_URL = "sqlite:///./development.db"
```

**Production**: PostgreSQL

```python
DATABASE_URL = "postgresql://user:password@host/database"
```

### Current Tables

#### users

```sql
-- SQLite/PostgreSQL compatible schema
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,  -- UUID as string
    username VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_email_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    verification_token_expires TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_verification_token ON users(verification_token);
```

### SQLAlchemy Model (Actual Implementation)

```python
from sqlalchemy import Column, String, Boolean, DateTime
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
```

### Common Database Operations

#### User Creation

```python
# In user_service.py
new_user = User(
    username=user_data.username,
    email=user_data.email.lower(),
    password_hash=get_password_hash(user_data.password),
    verification_token=generate_verification_token(),
    verification_token_expires=datetime.utcnow() + timedelta(hours=24)
)
db.add(new_user)
db.commit()
```

#### Find User by Email

```python
user = db.query(User).filter(User.email == email.lower()).first()
```

#### Verify Email Token

```python
user = db.query(User).filter(
    User.verification_token == token,
    User.verification_token_expires > datetime.utcnow()
).first()
```

### Database Migrations

Using Alembic for migrations:

```bash
# Create a new migration
cd backend
alembic revision --autogenerate -m "Add users table"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

### Future Tables (Planned)

#### health_profiles

- User health information
- Linked to users table via foreign key

#### user_allergies

- Many-to-many relationship
- Severity levels: MILD, MODERATE, SEVERE, LIFE_THREATENING

#### dietary_restrictions

- User dietary preferences
- Categories: vegetarian, vegan, kosher, halal, etc.

#### restaurants

- Restaurant information
- Location data

#### menu_items

- Restaurant menu items
- Ingredient lists

#### recommendations

- AI-generated meal suggestions
- Safety scores based on user allergies

---

**See actual implementation**:

- Models: `backend/src/eatsential/models.py`
- Database config: `backend/src/eatsential/database.py`
- Migrations: `backend/alembic/versions/`
