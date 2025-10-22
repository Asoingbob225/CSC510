# Development Guidelines

**Project:** Eatsential - Precision Nutrition Platform  
**Document Type:** Development Guidelines  
**Version:** 1.0  
**Date:** October 22, 2025  
**Audience:** Development Team

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Development Environment Setup](#2-development-environment-setup)
3. [Code Organization](#3-code-organization)
4. [Development Workflow](#4-development-workflow)
5. [API Development Guidelines](#5-api-development-guidelines)
6. [Frontend Development Guidelines](#6-frontend-development-guidelines)
7. [Database Guidelines](#7-database-guidelines)
8. [Security Guidelines](#8-security-guidelines)
9. [Performance Guidelines](#9-performance-guidelines)
10. [Documentation Standards](#10-documentation-standards)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. Introduction

### 1.1 Purpose

This document provides comprehensive guidelines for developing the Eatsential platform. It ensures consistency, quality, and efficiency across the development team.

### 1.2 Scope

These guidelines apply to all code, documentation, and processes within the Eatsential project, covering both frontend and backend development.

### 1.3 Related Documents

- [Coding Standards](./coding-standards.md)
- [Git Workflow](./git-workflow.md)
- [AGENT-PLAN Documentation](../AGENT-PLAN/)

---

## 2. Development Environment Setup

### 2.1 Prerequisites

```bash
# Required tools
- Node.js 18+ (for npm)
- Python 3.11+
- Bun 1.0+ (frontend package manager)
- uv (Python package manager)
- Git 2.30+
- Docker (optional, for future containerization)
```

### 2.2 Initial Setup

#### Frontend Setup

```bash
# Clone repository
git clone https://github.com/Asoingbob225/CSC510.git
cd CSC510/proj2

# Install frontend dependencies
cd frontend
bun install  # or npm install if Bun has issues

# Start development server
npm run dev  # Runs on http://localhost:5173
```

#### Backend Setup

```bash
# From project root
cd backend

# Install Python dependencies
uv sync

# Run database migrations
uv run alembic upgrade head

# Start development server
uv run fastapi dev src/eatsential/index.py  # Runs on http://localhost:8000
```

### 2.3 Environment Variables

#### Backend (.env)

```bash
# Database
DATABASE_URL=sqlite:///./development.db  # Development
# DATABASE_URL=postgresql://user:pass@localhost/eatsential  # Production

# Security
SECRET_KEY=your-secret-key-here  # Generate with: openssl rand -hex 32
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Email
EMAIL_PROVIDER=console  # console | smtp | ses
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USERNAME=
SMTP_PASSWORD=

# API Keys (Future)
OPENAI_API_KEY=
GOOGLE_MAPS_API_KEY=
```

#### Frontend (.env)

```bash
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=Eatsential
VITE_ENVIRONMENT=development
```

---

## 3. Code Organization

### 3.1 Project Structure

```
proj2/
├── frontend/                 # React SPA
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── ui/         # Base components (shadcn/ui)
│   │   │   └── *.tsx       # Feature components
│   │   ├── pages/          # Route components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API service layer
│   │   ├── lib/            # Utilities
│   │   └── types/          # TypeScript definitions
│   └── tests/              # Test files
│
├── backend/                 # FastAPI application
│   ├── src/
│   │   └── eatsential/
│   │       ├── routers/    # API endpoints
│   │       ├── services/   # Business logic
│   │       ├── models.py   # Database models
│   │       ├── schemas.py  # Pydantic schemas
│   │       └── database.py # Database config
│   ├── alembic/            # Database migrations
│   └── tests/              # Test files
│
└── docs/                   # Documentation
```

### 3.2 Module Organization

#### Frontend Modules

```typescript
// Component structure
components/
├── SignupField/
│   ├── SignupField.tsx      # Main component
│   ├── SignupField.test.tsx # Tests
│   ├── SignupField.types.ts # Type definitions
│   └── index.ts            # Public exports

// Page structure
pages/
├── Welcome.tsx             # Public pages
├── Dashboard.tsx           # Authenticated pages
└── HealthProfile.tsx       # Feature pages
```

#### Backend Modules

```python
# Service structure
services/
├── __init__.py
├── user_service.py         # User operations
├── health_service.py       # Health profile operations
└── recommendation_service.py # AI recommendations

# Router structure
routers/
├── __init__.py
├── auth.py                # /api/auth/*
├── users.py               # /api/users/*
└── health.py              # /api/health/*
```

---

## 4. Development Workflow

### 4.1 Task Management

1. **Check Sprint Tasks**

   ```bash
   # Read current sprint tasks
   cat docs/AGENT-PLAN/08-SPRINT-TASKS.md
   ```

2. **Select Task**
   - Choose task based on priority and dependencies
   - Update task status in sprint document

3. **Create Feature Branch**
   ```bash
   git checkout -b feature/task-id-description
   # Example: git checkout -b feature/fe-s1-003-health-profile
   ```

### 4.2 Development Cycle

```mermaid
graph LR
    A[Select Task] --> B[Create Branch]
    B --> C[Write Tests]
    C --> D[Implement Feature]
    D --> E[Run Tests]
    E --> F{Tests Pass?}
    F -->|No| D
    F -->|Yes| G[Code Review]
    G --> H[Merge to Main]
```

### 4.3 Daily Development

```bash
# Start of day
git pull origin main
git checkout -b feature/new-feature

# During development
npm run dev          # Frontend
uv run fastapi dev   # Backend

# Before commit
npm run lint         # Frontend
uv run ruff check    # Backend
npm run test         # Run tests

# Commit
git add .
git commit -m "feat: Add health profile validation"
git push origin feature/new-feature
```

---

## 5. API Development Guidelines

### 5.1 Endpoint Design

```python
# Good: RESTful, versioned, descriptive
@router.post("/api/auth/register", response_model=UserResponse, status_code=201)

# Bad: Non-RESTful, unclear
@router.post("/register_user")
```

### 5.2 Request/Response Patterns

```python
# Request validation with Pydantic
class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=20)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=48)

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        # Validation logic
        return v

# Consistent error responses
class ErrorResponse(BaseModel):
    detail: str
    code: Optional[str] = None
    field: Optional[str] = None
```

### 5.3 Service Layer Pattern

```python
# Router handles HTTP concerns
@router.post("/users/{user_id}/health-profile")
async def create_health_profile(
    user_id: str,
    profile_data: HealthProfileCreate,
    db: SessionDep,
    current_user: User = Depends(get_current_user)
):
    # Verify user authorization
    if current_user.id != user_id:
        raise HTTPException(status_code=403)

    # Delegate to service
    return await health_service.create_profile(db, user_id, profile_data)

# Service handles business logic
async def create_profile(
    db: Session,
    user_id: str,
    data: HealthProfileCreate
) -> HealthProfile:
    # Business logic
    # Database operations
    # Return domain object
```

### 5.4 Async Best Practices

```python
# Use async for I/O operations
async def send_email(to: str, subject: str, body: str):
    async with aiosmtplib.SMTP() as smtp:
        await smtp.send_message(message)

# Don't use async for CPU-bound operations
def hash_password(password: str) -> str:
    # This is CPU-bound, not I/O-bound
    return pwd_context.hash(password)
```

---

## 6. Frontend Development Guidelines

### 6.1 Component Design

```typescript
// Functional components with TypeScript
interface ComponentProps {
  title: string;
  onSubmit: (data: FormData) => Promise<void>;
  isLoading?: boolean;
}

const MyComponent: React.FC<ComponentProps> = ({
  title,
  onSubmit,
  isLoading = false
}) => {
  // Hooks at the top
  const [state, setState] = useState<string>('');
  const { user } = useAuth();

  // Event handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Logic
  };

  // Early returns for loading/error states
  if (isLoading) return <Spinner />;

  // Main render
  return (
    <div className="component-wrapper">
      {/* JSX */}
    </div>
  );
};
```

### 6.2 State Management

```typescript
// Local state for component-specific data
const [formData, setFormData] = useState<FormData>(initialData);

// Context for shared state (future)
const AuthContext = createContext<AuthContextType | null>(null);

// Custom hooks for complex state logic
function useHealthProfile(userId: string) {
  const [profile, setProfile] = useState<HealthProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Fetch logic
  }, [userId]);

  return { profile, loading, error, refetch };
}
```

### 6.3 Form Handling

```typescript
// Use React Hook Form + Zod
const schema = z.object({
  allergies: z.array(z.string()).min(1, "Select at least one allergy"),
  severity: z.enum(["MILD", "MODERATE", "SEVERE", "LIFE_THREATENING"]),
});

const form = useForm<FormData>({
  resolver: zodResolver(schema),
  defaultValues: {
    allergies: [],
    severity: "MODERATE",
  },
});

// Shadcn/ui form components
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="allergies"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Allergies</FormLabel>
          <FormControl>
            <AllergySelector {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </form>
</Form>
```

### 6.4 Error Handling

```typescript
// API error handling
try {
  const response = await fetch('/api/users/profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'An error occurred');
  }

  return response.json();
} catch (error) {
  // User-friendly error handling
  if (error instanceof Error) {
    toast.error(error.message);
  } else {
    toast.error('An unexpected error occurred');
  }
  console.error('API Error:', error);
}

// Component error boundaries
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Component Error:', error, errorInfo);
    // Log to error tracking service
  }
}
```

---

## 7. Database Guidelines

### 7.1 Migration Best Practices

```bash
# Create a new migration
cd backend
uv run alembic revision --autogenerate -m "Add health_profiles table"

# Review generated migration
# Edit if necessary in alembic/versions/

# Apply migration
uv run alembic upgrade head

# Rollback if needed
uv run alembic downgrade -1
```

### 7.2 Model Design

```python
class HealthProfile(Base):
    __tablename__ = "health_profiles"

    # Primary key
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))

    # Foreign keys
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, unique=True)

    # Data fields
    height_cm = Column(Integer, nullable=True)
    weight_kg = Column(Float, nullable=True)

    # Timestamps
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="health_profile")
    allergies = relationship("UserAllergy", back_populates="profile", cascade="all, delete-orphan")

    # Indexes
    __table_args__ = (
        Index("idx_health_profiles_user_id", "user_id"),
    )
```

### 7.3 Query Optimization

```python
# Use eager loading for related data
def get_user_with_profile(db: Session, user_id: str) -> User:
    return db.query(User)\
        .options(joinedload(User.health_profile))\
        .filter(User.id == user_id)\
        .first()

# Use bulk operations
def create_user_allergies(db: Session, user_id: str, allergies: List[str]):
    objects = [
        UserAllergy(user_id=user_id, allergy_name=allergy)
        for allergy in allergies
    ]
    db.bulk_save_objects(objects)
    db.commit()

# Use indexes for frequent queries
# Add in model: Index("idx_users_email", "email")
```

---

## 8. Security Guidelines

### 8.1 Authentication & Authorization

```python
# Password hashing
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# JWT tokens (future implementation)
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
```

### 8.2 Input Validation

```python
# Backend: Pydantic validation
class AllergyInput(BaseModel):
    name: str
    severity: Literal["MILD", "MODERATE", "SEVERE", "LIFE_THREATENING"]

    @field_validator("name")
    @classmethod
    def validate_allergy_name(cls, v: str) -> str:
        if v not in APPROVED_ALLERGENS:
            raise ValueError(f"'{v}' is not a recognized allergen")
        return v

# Frontend: Zod validation
const allergySchema = z.object({
  name: z.enum(APPROVED_ALLERGENS),
  severity: z.enum(["MILD", "MODERATE", "SEVERE", "LIFE_THREATENING"]),
});
```

### 8.3 Security Headers

```python
# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Development
        "https://eatsential.com",  # Production
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Security headers middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response
```

### 8.4 Data Protection

```python
# Never expose sensitive data
class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    # Never include: password_hash, verification_token

    model_config = ConfigDict(from_attributes=True)

# Audit logging for sensitive operations
async def log_health_data_access(user_id: str, accessed_by: str, operation: str):
    audit_log = AuditLog(
        user_id=user_id,
        accessed_by=accessed_by,
        operation=operation,
        timestamp=datetime.utcnow()
    )
    db.add(audit_log)
    await db.commit()
```

---

## 9. Performance Guidelines

### 9.1 Frontend Performance

```typescript
// Lazy loading for routes
const HealthProfile = lazy(() => import('./pages/HealthProfile'));

// Memoization for expensive operations
const expensiveComponent = useMemo(() => {
  return <ExpensiveComponent data={data} />;
}, [data]);

// Debounce user input
const debouncedSearch = useMemo(
  () => debounce((value: string) => {
    searchRestaurants(value);
  }, 300),
  []
);

// Image optimization
<img
  src={imageSrc}
  alt={alt}
  loading="lazy"
  decoding="async"
/>
```

### 9.2 Backend Performance

```python
# Database connection pooling
engine = create_engine(
    DATABASE_URL,
    pool_size=20,
    max_overflow=40,
    pool_pre_ping=True,
)

# Caching (future implementation)
from functools import lru_cache

@lru_cache(maxsize=100)
def get_allergen_list() -> List[str]:
    return APPROVED_ALLERGENS

# Async operations
async def process_recommendations(user_id: str):
    # Run independent operations concurrently
    profile_task = get_user_profile(user_id)
    preferences_task = get_user_preferences(user_id)

    profile, preferences = await asyncio.gather(
        profile_task,
        preferences_task
    )

    return generate_recommendations(profile, preferences)
```

### 9.3 API Performance

```python
# Pagination
class PaginationParams(BaseModel):
    skip: int = Query(0, ge=0)
    limit: int = Query(20, ge=1, le=100)

@router.get("/restaurants")
async def list_restaurants(
    pagination: PaginationParams = Depends(),
    db: SessionDep = Depends()
):
    return db.query(Restaurant)\
        .offset(pagination.skip)\
        .limit(pagination.limit)\
        .all()

# Response compression
from starlette.middleware.gzip import GZipMiddleware
app.add_middleware(GZipMiddleware, minimum_size=1000)
```

---

## 10. Documentation Standards

### 10.1 Code Documentation

```python
# Python docstrings
def create_health_profile(
    db: Session,
    user_id: str,
    profile_data: HealthProfileCreate
) -> HealthProfile:
    """Create a health profile for a user.

    Args:
        db: Database session
        user_id: ID of the user
        profile_data: Health profile data

    Returns:
        Created health profile

    Raises:
        HTTPException: If user not found or profile exists
    """
    # Implementation
```

```typescript
// TypeScript JSDoc
/**
 * Validates user allergies against approved list
 * @param allergies - Array of allergy names
 * @returns Validated allergies
 * @throws Error if invalid allergy found
 */
function validateAllergies(allergies: string[]): ValidatedAllergy[] {
  // Implementation
}
```

### 10.2 API Documentation

```python
@router.post(
    "/health-profile",
    response_model=HealthProfileResponse,
    status_code=201,
    summary="Create health profile",
    description="Create a health profile for the authenticated user",
    responses={
        201: {"description": "Profile created successfully"},
        400: {"description": "Invalid input data"},
        409: {"description": "Profile already exists"},
    }
)
```

### 10.3 README Updates

Always update relevant README files when:

- Adding new dependencies
- Changing setup procedures
- Adding new features
- Modifying API endpoints

---

## 11. Troubleshooting

### 11.1 Common Frontend Issues

**Issue: Module not found errors**

```bash
# Clear cache and reinstall
rm -rf node_modules bun.lock
bun install  # or npm install
```

**Issue: TypeScript errors**

```bash
# Restart TS server in VS Code
Cmd+Shift+P -> "TypeScript: Restart TS Server"
```

**Issue: Port already in use**

```bash
# Find and kill process
lsof -i :5173
kill -9 <PID>
```

### 11.2 Common Backend Issues

**Issue: Database migration conflicts**

```bash
# Check current revision
uv run alembic current

# Show history
uv run alembic history

# Resolve conflicts
uv run alembic stamp head
uv run alembic revision --autogenerate -m "Resolve conflicts"
```

**Issue: Import errors**

```bash
# Ensure correct Python path
export PYTHONPATH="${PYTHONPATH}:${PWD}/src"

# Or use uv run which handles this
uv run python -m pytest
```

**Issue: Async context errors**

```python
# Use proper async context
async with get_db() as db:
    # Database operations

# Or use dependency injection
async def endpoint(db: Session = Depends(get_db)):
    # Database operations
```

### 11.3 Development Tips

1. **Use the AGENT-PLAN**
   - Always check `/docs/AGENT-PLAN/08-SPRINT-TASKS.md` for current tasks
   - Reference pattern documents when implementing

2. **Test Incrementally**
   - Write tests before implementation
   - Run tests frequently during development
   - Don't commit broken tests

3. **Ask for Help**
   - Use team Slack channel for questions
   - Pair program on complex features
   - Document solutions for future reference

---

## Appendix A: Quick Reference

### Terminal Commands

```bash
# Frontend
cd frontend && npm run dev        # Start dev server
npm run build                     # Build for production
npm run test                      # Run tests
npm run lint                      # Run linter

# Backend
cd backend && uv run fastapi dev  # Start dev server
uv run pytest                     # Run tests
uv run ruff check                 # Run linter
uv run alembic upgrade head       # Run migrations

# Git
git status                        # Check status
git add -p                        # Stage changes interactively
git commit -m "type: message"     # Commit with conventional message
git push origin feature-branch    # Push to remote
```

### VS Code Extensions

- Python (ms-python.python)
- Pylance (ms-python.vscode-pylance)
- ESLint (dbaeumer.vscode-eslint)
- Prettier (esbenp.prettier-vscode)
- Tailwind CSS IntelliSense (bradlc.vscode-tailwindcss)
- GitLens (eamodio.gitlens)

### Useful Links

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [SQLAlchemy Documentation](https://www.sqlalchemy.org/)
