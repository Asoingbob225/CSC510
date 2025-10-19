# Database Design

## Core Tables

### users
```sql
id              UUID PRIMARY KEY
email           VARCHAR(255) UNIQUE NOT NULL
username        VARCHAR(50) UNIQUE NOT NULL  
password_hash   VARCHAR(255) NOT NULL
email_verified  BOOLEAN DEFAULT FALSE
created_at      TIMESTAMP DEFAULT NOW()
updated_at      TIMESTAMP DEFAULT NOW()
```

### health_profiles
```sql
id          UUID PRIMARY KEY
user_id     UUID REFERENCES users(id) UNIQUE
created_at  TIMESTAMP DEFAULT NOW()
updated_at  TIMESTAMP DEFAULT NOW()
```

### allergies (Master List)
```sql
id       UUID PRIMARY KEY
name     VARCHAR(100) UNIQUE NOT NULL
category VARCHAR(50)
```

### user_allergies
```sql
user_id     UUID REFERENCES users(id)
allergy_id  UUID REFERENCES allergies(id)
severity    ENUM('MILD','MODERATE','SEVERE','LIFE_THREATENING')
notes       TEXT
PRIMARY KEY (user_id, allergy_id)
```

## SQLAlchemy Models

```python
from sqlalchemy import Column, String, Boolean, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False)
    username = Column(String(50), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    email_verified = Column(Boolean, default=False)
    
    # Relationships
    health_profile = relationship("HealthProfile", back_populates="user", uselist=False)
```

## Common Queries

```python
# Get user with health profile
user = db.query(User).options(
    joinedload(User.health_profile)
).filter(User.id == user_id).first()

# Get user allergies
allergies = db.query(UserAllergy).filter(
    UserAllergy.user_id == user_id,
    UserAllergy.severity.in_(['SEVERE', 'LIFE_THREATENING'])
).all()
```

---

**Migration**: Use Alembic (`alembic revision -m "message"`)
