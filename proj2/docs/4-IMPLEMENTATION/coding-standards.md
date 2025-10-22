# Coding Standards

**Project:** Eatsential - Precision Nutrition Platform  
**Document Type:** Coding Standards and Style Guide  
**Version:** 1.0  
**Date:** October 21, 2025  
**Owner:** Development Team

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [General Principles](#2-general-principles)
3. [Python Standards](#3-python-standards)
4. [TypeScript/JavaScript Standards](#4-typescriptjavascript-standards)
5. [React Standards](#5-react-standards)
6. [API Design Standards](#6-api-design-standards)
7. [Database Standards](#7-database-standards)
8. [Documentation Standards](#8-documentation-standards)
9. [Testing Standards](#9-testing-standards)
10. [Version Control Standards](#10-version-control-standards)

---

## 1. Introduction

### 1.1 Purpose

This document establishes coding standards for the Eatsential project to ensure:
- Code consistency across the team
- Maintainability and readability
- Reduced bugs and technical debt
- Efficient code reviews
- Easy onboarding of new developers

### 1.2 Scope

These standards apply to all code written for the Eatsential project, including:
- Backend Python code (FastAPI)
- Frontend TypeScript/JavaScript code (React)
- Database schemas and queries
- Test code
- Configuration files
- Documentation

### 1.3 Enforcement

- **Automated**: Linters and formatters in CI/CD pipeline
- **Manual**: Code review checklist
- **Tools**: Pre-commit hooks

## 2. General Principles

### 2.1 Core Principles

1. **Readability First**: Code is read more often than written
2. **KISS**: Keep It Simple, Stupid
3. **DRY**: Don't Repeat Yourself
4. **YAGNI**: You Aren't Gonna Need It
5. **SOLID**: Single responsibility, Open/closed, Liskov substitution, Interface segregation, Dependency inversion

### 2.2 Naming Conventions

#### General Rules
- Use descriptive, meaningful names
- Avoid abbreviations except well-known ones
- Be consistent with naming patterns
- Use searchable names

#### Examples
```python
# Bad
def calc(x, y):
    return x * 0.1 + y

# Good
def calculate_total_with_tax(price: float, tax_amount: float) -> float:
    """Calculate total price including tax."""
    return price + tax_amount
```

### 2.3 Comments and Documentation

- Write self-documenting code that needs minimal comments
- Comment the "why", not the "what"
- Update comments when code changes
- Remove commented-out code

## 3. Python Standards

### 3.1 Style Guide

We follow **PEP 8** with these specifications:
- **Line length**: 88 characters (Black formatter default)
- **Indentation**: 4 spaces
- **Imports**: Sorted with `isort`

### 3.2 Python Naming Conventions

```python
# Module names: lowercase with underscores
user_service.py
database_config.py

# Class names: CapWords
class UserProfile:
    pass

# Function names: lowercase with underscores
def get_user_by_email(email: str) -> User:
    pass

# Constants: UPPERCASE with underscores
MAX_LOGIN_ATTEMPTS = 5
DEFAULT_PAGE_SIZE = 20

# Private methods/variables: leading underscore
def _validate_password(password: str) -> bool:
    pass

# Instance variables: lowercase with underscores
self.user_name = "John"
self.is_verified = True
```

### 3.3 Type Hints

Always use type hints for function signatures:

```python
from typing import List, Optional, Dict, Union
from datetime import datetime

def create_user(
    username: str,
    email: str,
    password: str,
    allergies: Optional[List[str]] = None
) -> User:
    """Create a new user with the given details."""
    pass

def get_recommendations(
    user_id: str,
    meal_type: str,
    location: Dict[str, float],
    limit: int = 10
) -> List[Recommendation]:
    """Get meal recommendations for a user."""
    pass
```

### 3.4 FastAPI Specific

```python
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

router = APIRouter(
    prefix="/users",
    tags=["users"],
    responses={404: {"description": "Not found"}},
)

@router.post(
    "/",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new user",
    description="Create a new user with the provided details",
)
async def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    """
    Create a new user.
    
    Args:
        user_data: User creation data
        db: Database session
        current_user: Currently authenticated user
        
    Returns:
        Created user details
        
    Raises:
        HTTPException: If user already exists
    """
    # Implementation
    pass
```

### 3.5 Error Handling

```python
# Define custom exceptions
class DomainError(Exception):
    """Base exception for domain errors."""
    pass

class UserNotFoundError(DomainError):
    """Raised when user is not found."""
    pass

# Use specific error handling
try:
    user = await get_user(user_id)
except UserNotFoundError:
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"User with id {user_id} not found"
    )
except Exception as e:
    logger.error(f"Unexpected error: {e}")
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Internal server error"
    )
```

### 3.6 Async/Await Best Practices

```python
# Always use async for I/O operations
async def get_user_profile(user_id: str) -> UserProfile:
    # Parallel async calls when possible
    user_task = get_user(user_id)
    health_task = get_health_profile(user_id)
    
    user, health = await asyncio.gather(user_task, health_task)
    
    return UserProfile(user=user, health=health)

# Don't use async for CPU-bound operations
def calculate_nutrition(meals: List[Meal]) -> NutritionSummary:
    # This is CPU-bound, no need for async
    total_calories = sum(meal.calories for meal in meals)
    return NutritionSummary(calories=total_calories)
```

## 4. TypeScript/JavaScript Standards

### 4.1 Style Guide

We follow the **Airbnb JavaScript Style Guide** with TypeScript additions:
- **Semicolons**: Always use semicolons
- **Quotes**: Single quotes for strings
- **Indentation**: 2 spaces
- **Line length**: 100 characters

### 4.2 TypeScript Naming Conventions

```typescript
// File names: PascalCase for components, camelCase for utilities
UserProfile.tsx
SignupForm.tsx
dateHelpers.ts
apiClient.ts

// Interfaces: PascalCase with 'I' prefix optional (we don't use it)
interface UserProfile {
  id: string;
  email: string;
  isVerified: boolean;
}

// Types: PascalCase
type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

// Enums: PascalCase with UPPERCASE values
enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  GUEST = 'GUEST',
}

// Functions: camelCase
function calculateTotalPrice(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// Constants: UPPERCASE with underscores
const MAX_PASSWORD_LENGTH = 48;
const API_BASE_URL = process.env.REACT_APP_API_URL;

// React components: PascalCase
const UserDashboard: React.FC<Props> = ({ user }) => {
  return <div>Welcome, {user.name}!</div>;
};
```

### 4.3 TypeScript Best Practices

```typescript
// Always define explicit types
interface Props {
  title: string;
  count: number;
  isActive?: boolean; // Optional props marked with ?
  onUpdate: (value: string) => void;
}

// Use type inference when obvious
const [count, setCount] = useState(0); // Type inferred as number

// Avoid 'any' type
// Bad
const processData = (data: any) => { /* ... */ };

// Good
const processData = <T extends Record<string, unknown>>(data: T) => { /* ... */ };

// Use union types for multiple possibilities
type Status = 'idle' | 'loading' | 'success' | 'error';

// Use const assertions for literals
const CONFIG = {
  apiUrl: 'https://api.eatsential.com',
  timeout: 5000,
} as const;
```

### 4.4 Import Organization

```typescript
// 1. External imports (sorted alphabetically)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

// 2. Internal absolute imports
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// 3. Relative imports
import { UserProfile } from './UserProfile';
import { calculateAge } from './utils';

// 4. Style imports
import styles from './Dashboard.module.css';
```

## 5. React Standards

### 5.1 Component Structure

```typescript
// Functional components with TypeScript
interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
  className?: string;
}

export function UserCard({ user, onEdit, className }: UserCardProps) {
  // 1. Hooks
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  
  // 2. Derived state
  const fullName = `${user.firstName} ${user.lastName}`;
  
  // 3. Event handlers
  const handleEdit = () => {
    setIsEditing(true);
    onEdit?.(user);
  };
  
  // 4. Effects
  useEffect(() => {
    // Effect logic
  }, [user.id]);
  
  // 5. Render
  return (
    <div className={className}>
      <h3>{fullName}</h3>
      <Button onClick={handleEdit}>Edit</Button>
    </div>
  );
}
```

### 5.2 Hooks Best Practices

```typescript
// Custom hooks start with 'use'
function useUserProfile(userId: string) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await api.getUserProfile(userId);
        setProfile(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [userId]);
  
  return { profile, loading, error };
}

// Use early returns for conditional rendering
function UserDashboard() {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return <DashboardContent user={user} />;
}
```

### 5.3 Performance Optimization

```typescript
// Memoize expensive computations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(props.data);
}, [props.data]);

// Memoize callbacks
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);

// Memoize components when needed
const MemoizedComponent = React.memo(ExpensiveComponent);

// Use lazy loading for routes
const Dashboard = lazy(() => import('./pages/Dashboard'));
```

## 6. API Design Standards

### 6.1 RESTful Principles

```yaml
# Resource naming: plural nouns
GET    /api/users          # Get all users
GET    /api/users/{id}     # Get specific user
POST   /api/users          # Create user
PUT    /api/users/{id}     # Update entire user
PATCH  /api/users/{id}     # Update partial user
DELETE /api/users/{id}     # Delete user

# Nested resources
GET    /api/users/{id}/allergies      # Get user's allergies
POST   /api/users/{id}/allergies      # Add allergy
DELETE /api/users/{id}/allergies/{id} # Remove allergy

# Query parameters for filtering
GET    /api/restaurants?cuisine=italian&maxPrice=30
GET    /api/meals?allergenFree=peanuts,shellfish
```

### 6.2 Request/Response Format

```typescript
// Request format
interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
}

// Success response
interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    totalPages?: number;
    totalCount?: number;
  };
}

// Error response
interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
  timestamp: string;
}

// Example responses
// Success: 200 OK
{
  "success": true,
  "data": {
    "id": "123",
    "username": "johndoe",
    "email": "john@example.com"
  }
}

// Error: 400 Bad Request
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "email": ["Invalid email format"],
      "password": ["Password too short"]
    }
  },
  "timestamp": "2025-10-21T10:30:00Z"
}
```

### 6.3 Status Codes

```python
# Use appropriate HTTP status codes
200 OK              # Successful GET, PUT
201 Created         # Successful POST
204 No Content      # Successful DELETE
400 Bad Request     # Client error (validation)
401 Unauthorized    # Authentication required
403 Forbidden       # Authenticated but not authorized
404 Not Found       # Resource doesn't exist
409 Conflict        # Resource conflict (duplicate)
422 Unprocessable   # Validation error with details
429 Too Many Requests # Rate limit exceeded
500 Internal Error  # Server error
```

## 7. Database Standards

### 7.1 Naming Conventions

```sql
-- Tables: plural, snake_case
CREATE TABLE users (...);
CREATE TABLE user_allergies (...);
CREATE TABLE meal_ingredients (...);

-- Columns: snake_case
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes: idx_table_columns
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- Foreign keys: fk_table_column_reference
ALTER TABLE user_allergies 
ADD CONSTRAINT fk_user_allergies_user_id 
FOREIGN KEY (user_id) REFERENCES users(id);

-- Constraints: constraint_table_description
ALTER TABLE users 
ADD CONSTRAINT constraint_users_email_format 
CHECK (email ~ '^[^@]+@[^@]+\.[^@]+$');
```

### 7.2 Query Best Practices

```python
# Use parameterized queries (SQLAlchemy handles this)
user = db.query(User).filter(User.email == email).first()

# Use joins over multiple queries
query = db.query(User, HealthProfile)\
    .join(HealthProfile, User.id == HealthProfile.user_id)\
    .filter(User.is_active == True)

# Limit query results
users = db.query(User)\
    .filter(User.created_at >= start_date)\
    .limit(100)\
    .all()

# Use indexes for frequent queries
# Add index hint in SQLAlchemy if needed
query = db.query(User).with_hint(User, "USE INDEX (idx_users_email)")
```

### 7.3 Migration Standards

```python
"""Add user allergies table

Revision ID: 002_add_user_allergies
Revises: 001_initial_schema
Create Date: 2025-10-21 10:00:00

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = '002_add_user_allergies'
down_revision = '001_initial_schema'

def upgrade():
    # Create new table
    op.create_table(
        'user_allergies',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('allergen_name', sa.String(100), nullable=False),
        sa.Column('severity', sa.String(20), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.UniqueConstraint('user_id', 'allergen_name')
    )
    
    # Create indexes
    op.create_index('idx_user_allergies_user_id', 'user_allergies', ['user_id'])

def downgrade():
    # Drop indexes first
    op.drop_index('idx_user_allergies_user_id', 'user_allergies')
    
    # Drop table
    op.drop_table('user_allergies')
```

## 8. Documentation Standards

### 8.1 Code Documentation

#### Python Docstrings
```python
def calculate_meal_nutrition(
    meal: Meal,
    portion_size: float = 1.0,
    user_profile: Optional[UserProfile] = None
) -> NutritionInfo:
    """
    Calculate nutritional information for a meal.
    
    This function computes the total nutritional content of a meal,
    adjusting for portion size and user-specific requirements.
    
    Args:
        meal: The meal to analyze
        portion_size: Multiplier for portion (default: 1.0 = standard serving)
        user_profile: Optional user profile for personalized calculations
        
    Returns:
        NutritionInfo object containing:
            - Macronutrients (calories, protein, carbs, fat)
            - Micronutrients (vitamins, minerals)
            - Allergen warnings
            
    Raises:
        ValueError: If portion_size is negative
        MealNotFoundError: If meal data is incomplete
        
    Example:
        >>> meal = get_meal("salad_001")
        >>> nutrition = calculate_meal_nutrition(meal, portion_size=1.5)
        >>> print(f"Calories: {nutrition.calories}")
        Calories: 450
    """
    if portion_size < 0:
        raise ValueError("Portion size cannot be negative")
    
    # Implementation
    pass
```

#### TypeScript JSDoc
```typescript
/**
 * Calculate the age of a user from their birth date
 * 
 * @param birthDate - User's date of birth
 * @returns Age in years
 * @throws {Error} If birth date is in the future
 * 
 * @example
 * ```typescript
 * const age = calculateAge(new Date('1990-01-01'));
 * console.log(`User is ${age} years old`);
 * ```
 */
export function calculateAge(birthDate: Date): number {
  const today = new Date();
  if (birthDate > today) {
    throw new Error('Birth date cannot be in the future');
  }
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}
```

### 8.2 README Standards

Every directory should have a README.md explaining:
- Purpose of the directory
- Structure and organization
- How to use/run the code
- Dependencies
- Examples

```markdown
# User Service Module

This module handles all user-related operations including registration,
authentication, and profile management.

## Structure

```
user-service/
├── __init__.py
├── models.py       # SQLAlchemy models
├── schemas.py      # Pydantic schemas
├── service.py      # Business logic
├── router.py       # FastAPI routes
└── tests/          # Unit tests
```

## Usage

```python
from user_service import UserService

service = UserService(db_session)
user = await service.create_user(user_data)
```

## Testing

```bash
pytest user-service/tests/
```
```

## 9. Testing Standards

### 9.1 Test Organization

```
tests/
├── unit/           # Unit tests
├── integration/    # Integration tests
├── e2e/           # End-to-end tests
├── fixtures/      # Test data
├── mocks/         # Mock objects
└── utils/         # Test utilities
```

### 9.2 Test Naming

```python
# Python test naming
class TestUserService:
    def test_create_user_with_valid_data_succeeds(self):
        """Test that creating a user with valid data succeeds."""
        pass
    
    def test_create_user_with_duplicate_email_raises_error(self):
        """Test that creating a user with duplicate email raises error."""
        pass

# TypeScript test naming
describe('UserProfile Component', () => {
  it('should render user information correctly', () => {
    // Test implementation
  });
  
  it('should handle edit button click', () => {
    // Test implementation
  });
  
  describe('when user is not verified', () => {
    it('should show verification warning', () => {
      // Test implementation
    });
  });
});
```

### 9.3 Test Structure

```python
# Arrange-Act-Assert pattern
def test_user_registration():
    # Arrange
    user_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "SecurePass123!"
    }
    
    # Act
    response = client.post("/api/auth/register", json=user_data)
    
    # Assert
    assert response.status_code == 201
    assert response.json()["email"] == user_data["email"]
    
    # Verify side effects
    user = db.query(User).filter_by(email=user_data["email"]).first()
    assert user is not None
    assert user.is_email_verified is False
```

### 9.4 Test Coverage

- Minimum 80% code coverage
- 100% coverage for critical paths (authentication, allergies)
- Test edge cases and error conditions
- Include both positive and negative tests

## 10. Version Control Standards

### 10.1 Branch Naming

```bash
# Feature branches
feature/add-user-registration
feature/issue-123-meal-recommendations

# Bug fix branches
fix/login-error-handling
fix/issue-456-allergen-detection

# Hotfix branches
hotfix/critical-security-patch

# Documentation branches
docs/update-api-documentation
docs/add-setup-guide

# Refactoring branches
refactor/optimize-database-queries
refactor/extract-email-service
```

### 10.2 Commit Message Format

Follow the Conventional Commits specification:

```bash
# Format: <type>(<scope>): <subject>

# Types:
feat:     # New feature
fix:      # Bug fix
docs:     # Documentation changes
style:    # Code style changes (formatting, etc)
refactor: # Code refactoring
test:     # Test additions or changes
chore:    # Build process or auxiliary tool changes

# Examples:
feat(auth): add email verification flow
fix(api): handle null values in user profile update
docs(readme): update installation instructions
style(frontend): apply consistent button styling
refactor(database): optimize user query performance
test(auth): add integration tests for login flow
chore(deps): update FastAPI to version 0.100.0

# Breaking changes:
feat(api)!: change user endpoint response format

BREAKING CHANGE: The user endpoint now returns a nested structure
instead of flat JSON. Update clients accordingly.
```

### 10.3 Pull Request Standards

```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- List specific changes
- Include file paths if helpful

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests added/updated
- [ ] All tests passing

## Screenshots (if applicable)
Add screenshots for UI changes

## Related Issues
Closes #123
```

### 10.4 Code Review Checklist

1. **Functionality**
   - Does the code do what it's supposed to?
   - Are edge cases handled?
   - Is error handling appropriate?

2. **Code Quality**
   - Follows coding standards?
   - No code duplication?
   - Proper abstractions?

3. **Testing**
   - Adequate test coverage?
   - Tests are meaningful?
   - Edge cases tested?

4. **Security**
   - No hardcoded secrets?
   - Input validation present?
   - SQL injection prevented?

5. **Performance**
   - No N+1 queries?
   - Appropriate caching?
   - Efficient algorithms?

---

**Document Status:** COMPLETE  
**Last Review:** October 21, 2025  
**Next Review:** Quarterly

**Enforcement Tools:**
- Python: Black, isort, pylint, mypy
- TypeScript: ESLint, Prettier
- Pre-commit hooks configured
- CI/CD pipeline validation
