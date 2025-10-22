# API Detailed Design

**Project:** Eatsential - Precision Nutrition Platform  
**Document Type:** API Design Specification  
**Version:** 1.0  
**Date:** October 22, 2025  
**API Version:** v1

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [API Architecture](#2-api-architecture)
3. [Authentication & Authorization](#3-authentication--authorization)
4. [API Endpoints](#4-api-endpoints)
5. [Data Models](#5-data-models)
6. [Error Handling](#6-error-handling)
7. [Rate Limiting](#7-rate-limiting)
8. [API Versioning](#8-api-versioning)
9. [Security](#9-security)
10. [Testing](#10-testing)

---

## 1. Introduction

### 1.1 Purpose

This document provides a detailed design specification for the Eatsential REST API, defining all endpoints, data models, and interaction patterns.

### 1.2 API Design Principles

1. **RESTful Design**: Follow REST conventions
2. **Consistency**: Uniform response formats and naming
3. **Security First**: Authentication, authorization, and data protection
4. **Performance**: Efficient queries and response times
5. **Developer Experience**: Clear documentation and error messages

### 1.3 Base URL

```
Development: http://localhost:8000/api
Staging: https://staging-api.eatsential.com/api
Production: https://api.eatsential.com/api
```

---

## 2. API Architecture

### 2.1 Technology Stack

- **Framework**: FastAPI 0.115.4
- **Validation**: Pydantic 2.10.2
- **Database**: PostgreSQL with SQLAlchemy 2.0.36
- **Authentication**: JWT (future), Email verification (current)
- **Documentation**: OpenAPI 3.0 (Swagger)

### 2.2 Request/Response Format

All requests and responses use JSON format with UTF-8 encoding.

**Request Headers:**

```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer <token>  # Future implementation
```

**Response Headers:**

```http
Content-Type: application/json
X-Request-ID: <uuid>
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1698000000
```

---

## 3. Authentication & Authorization

### 3.1 Current Implementation (Email Verification)

```python
# No bearer token yet, using email verification for account activation
POST /api/auth/register -> Send verification email
GET /api/auth/verify-email/{token} -> Verify email address
```

### 3.2 Future Implementation (JWT)

```python
# JWT token-based authentication
POST /api/auth/login -> Get access token
POST /api/auth/refresh -> Refresh access token
POST /api/auth/logout -> Invalidate token
```

### 3.3 Authorization Levels

| Level         | Description                | Access                        |
| ------------- | -------------------------- | ----------------------------- |
| Public        | No authentication required | Health check, public data     |
| Authenticated | Valid JWT token            | Own profile, general features |
| Verified      | Email verified             | Full platform access          |
| Admin         | Admin role                 | All resources                 |

---

## 4. API Endpoints

### 4.1 Health Check

#### GET /api

Check API health status.

**Response:**

```json
200 OK
{
  "The server is running": "Hello World"
}
```

### 4.2 Authentication Endpoints

#### POST /api/auth/register

Register a new user account.

**Request Body:**

```json
{
  "username": "string", // 3-20 characters, alphanumeric
  "email": "user@example.com",
  "password": "string" // 8-48 chars, requires upper, lower, number, special
}
```

**Response:**

```json
201 Created
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "johndoe",
  "email": "john@example.com",
  "message": "Success! Please check your email for verification instructions."
}
```

**Error Responses:**

```json
400 Bad Request
{
  "detail": "Email already registered"
}

422 Unprocessable Entity
{
  "detail": [
    {
      "loc": ["body", "password"],
      "msg": "password must contain at least one uppercase letter",
      "type": "value_error"
    }
  ]
}
```

#### GET /api/auth/verify-email/{token}

Verify user email address.

**Path Parameters:**

- `token`: Email verification token (UUID format)

**Response:**

```json
200 OK
{
  "message": "Email verified successfully! You can now log in."
}
```

**Error Response:**

```json
400 Bad Request
{
  "detail": "Invalid or expired verification token"
}
```

#### POST /api/auth/resend-verification

Resend verification email.

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Response:**

```json
201 Created
{
  "message": "Verification email sent! Please check your inbox."
}
```

**Error Responses:**

```json
404 Not Found
{
  "detail": "User not found"
}

400 Bad Request
{
  "detail": "Email already verified"
}
```

### 4.3 User Management (Future Implementation)

#### GET /api/users/me

Get current user profile.

**Headers:**

```http
Authorization: Bearer <jwt_token>
```

**Response:**

```json
200 OK
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "johndoe",
  "email": "john@example.com",
  "is_email_verified": true,
  "created_at": "2025-10-22T10:00:00Z",
  "updated_at": "2025-10-22T10:00:00Z",
  "health_profile": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "has_allergies": true,
    "allergy_count": 2
  }
}
```

#### PUT /api/users/me

Update current user profile.

**Request Body:**

```json
{
  "username": "newusername", // Optional
  "email": "newemail@example.com" // Optional, requires re-verification
}
```

**Response:**

```json
200 OK
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "newusername",
  "email": "newemail@example.com",
  "message": "Profile updated successfully"
}
```

#### DELETE /api/users/me

Delete user account.

**Headers:**

```http
Authorization: Bearer <jwt_token>
```

**Request Body:**

```json
{
  "password": "current_password",
  "confirmation": "DELETE MY ACCOUNT"
}
```

**Response:**

```json
204 No Content
```

### 4.4 Health Profile Management (Future Implementation)

#### GET /api/health-profile

Get user's health profile.

**Response:**

```json
200 OK
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "height_cm": 175,
  "weight_kg": 70.5,
  "date_of_birth": "1990-01-01",
  "gender": "male",
  "activity_level": "moderate",
  "allergies": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "name": "Peanuts",
      "severity": "SEVERE",
      "notes": "Anaphylactic reaction"
    },
    {
      "id": "880e8400-e29b-41d4-a716-446655440003",
      "name": "Shellfish",
      "severity": "MODERATE",
      "notes": "Causes hives"
    }
  ],
  "dietary_restrictions": ["vegetarian", "gluten_free"],
  "medical_conditions": ["diabetes_type_2", "hypertension"],
  "fitness_goals": ["weight_loss", "muscle_gain"],
  "created_at": "2025-10-22T10:00:00Z",
  "updated_at": "2025-10-22T10:00:00Z"
}
```

#### POST /api/health-profile

Create health profile.

**Request Body:**

```json
{
  "height_cm": 175,
  "weight_kg": 70.5,
  "date_of_birth": "1990-01-01",
  "gender": "male",
  "activity_level": "moderate",
  "allergies": [
    {
      "name": "Peanuts",
      "severity": "SEVERE",
      "notes": "Anaphylactic reaction"
    }
  ],
  "dietary_restrictions": ["vegetarian"],
  "medical_conditions": ["diabetes_type_2"],
  "fitness_goals": ["weight_loss"]
}
```

**Validation Rules:**

- `height_cm`: 50-300
- `weight_kg`: 20-500
- `date_of_birth`: Must be in the past, user must be 13+ years old
- `gender`: ["male", "female", "other", "prefer_not_to_say"]
- `activity_level`: ["sedentary", "light", "moderate", "active", "very_active"]
- `allergies.severity`: ["MILD", "MODERATE", "SEVERE", "LIFE_THREATENING"]
- `allergies.name`: Must be from approved allergen list

**Response:**

```json
201 Created
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  // ... full profile data
  "message": "Health profile created successfully"
}
```

#### PUT /api/health-profile

Update health profile.

**Request Body:** (Partial update supported)

```json
{
  "weight_kg": 68.5,
  "allergies": [
    {
      "name": "Peanuts",
      "severity": "SEVERE",
      "notes": "Updated: Carry EpiPen"
    },
    {
      "name": "Tree Nuts",
      "severity": "MILD",
      "notes": "New allergy discovered"
    }
  ]
}
```

**Response:**

```json
200 OK
{
  // ... updated profile data
  "message": "Health profile updated successfully"
}
```

#### DELETE /api/health-profile/{allergy_id}

Remove specific allergy.

**Response:**

```json
200 OK
{
  "message": "Allergy removed successfully"
}
```

### 4.5 Recommendations (Future Implementation)

#### GET /api/recommendations

Get personalized meal recommendations.

**Query Parameters:**

- `meal_type`: breakfast|lunch|dinner|snack
- `cuisine`: italian|chinese|mexican|etc
- `max_calories`: integer
- `location`: latitude,longitude
- `radius_km`: integer (default: 5)

**Response:**

```json
200 OK
{
  "recommendations": [
    {
      "id": "990e8400-e29b-41d4-a716-446655440004",
      "restaurant": {
        "id": "rest_001",
        "name": "Healthy Eats",
        "cuisine": "Mediterranean",
        "distance_km": 1.2,
        "rating": 4.5
      },
      "meal": {
        "id": "meal_001",
        "name": "Grilled Chicken Salad",
        "description": "Fresh greens with grilled chicken...",
        "calories": 350,
        "price": 12.99,
        "image_url": "https://..."
      },
      "safety_score": 98,
      "safety_notes": "Safe for your allergies",
      "nutrition": {
        "protein_g": 35,
        "carbs_g": 20,
        "fat_g": 15,
        "fiber_g": 8
      },
      "match_reasons": [
        "High protein for muscle gain",
        "Low carb for weight loss",
        "Free from all your allergens"
      ]
    }
  ],
  "total_count": 15,
  "filter_stats": {
    "total_meals": 50,
    "excluded_allergens": 35,
    "calorie_filtered": 0
  }
}
```

#### POST /api/recommendations/{recommendation_id}/feedback

Submit feedback on recommendation.

**Request Body:**

```json
{
  "rating": 5, // 1-5
  "tried_it": true,
  "comments": "Great recommendation, very tasty!",
  "accuracy": {
    "taste": 5,
    "portion_size": 4,
    "allergen_safety": 5
  }
}
```

**Response:**

```json
201 Created
{
  "message": "Thank you for your feedback!"
}
```

---

## 5. Data Models

### 5.1 Core Models

#### User Model

```python
class User(BaseModel):
    id: UUID
    username: str  # 3-20 chars, unique
    email: EmailStr  # unique
    is_email_verified: bool
    created_at: datetime
    updated_at: datetime

    # Relationships
    health_profile: Optional[HealthProfile]
```

#### HealthProfile Model

```python
class HealthProfile(BaseModel):
    id: UUID
    user_id: UUID
    height_cm: Optional[int]  # 50-300
    weight_kg: Optional[float]  # 20-500
    date_of_birth: Optional[date]
    gender: Optional[Gender]
    activity_level: Optional[ActivityLevel]

    # Relationships
    allergies: List[UserAllergy]
    dietary_restrictions: List[str]
    medical_conditions: List[str]
    fitness_goals: List[str]

    created_at: datetime
    updated_at: datetime
```

#### UserAllergy Model

```python
class UserAllergy(BaseModel):
    id: UUID
    user_id: UUID
    name: AllergenName  # From approved list
    severity: AllergySeverity
    notes: Optional[str]  # Max 500 chars
    created_at: datetime
```

### 5.2 Enums

```python
class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"
    PREFER_NOT_TO_SAY = "prefer_not_to_say"

class ActivityLevel(str, Enum):
    SEDENTARY = "sedentary"
    LIGHT = "light"
    MODERATE = "moderate"
    ACTIVE = "active"
    VERY_ACTIVE = "very_active"

class AllergySeverity(str, Enum):
    MILD = "MILD"
    MODERATE = "MODERATE"
    SEVERE = "SEVERE"
    LIFE_THREATENING = "LIFE_THREATENING"

class AllergenName(str, Enum):
    PEANUTS = "Peanuts"
    TREE_NUTS = "Tree Nuts"
    MILK = "Milk"
    EGGS = "Eggs"
    WHEAT = "Wheat"
    SOY = "Soy"
    FISH = "Fish"
    SHELLFISH = "Shellfish"
    SESAME = "Sesame"
    MUSTARD = "Mustard"
    CELERY = "Celery"
    LUPIN = "Lupin"
```

---

## 6. Error Handling

### 6.1 Error Response Format

```json
{
  "detail": "Human-readable error message",
  "code": "ERROR_CODE", // Optional, for specific errors
  "field": "field_name", // Optional, for validation errors
  "request_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

### 6.2 HTTP Status Codes

| Code | Meaning               | Use Case                            |
| ---- | --------------------- | ----------------------------------- |
| 200  | OK                    | Successful GET, PUT                 |
| 201  | Created               | Successful POST                     |
| 204  | No Content            | Successful DELETE                   |
| 400  | Bad Request           | Invalid input, business logic error |
| 401  | Unauthorized          | Missing or invalid authentication   |
| 403  | Forbidden             | Insufficient permissions            |
| 404  | Not Found             | Resource not found                  |
| 409  | Conflict              | Duplicate resource                  |
| 422  | Unprocessable Entity  | Validation error                    |
| 429  | Too Many Requests     | Rate limit exceeded                 |
| 500  | Internal Server Error | Unexpected server error             |
| 503  | Service Unavailable   | Maintenance or overload             |

### 6.3 Common Error Codes

```python
class ErrorCode(str, Enum):
    # Authentication
    INVALID_CREDENTIALS = "INVALID_CREDENTIALS"
    TOKEN_EXPIRED = "TOKEN_EXPIRED"
    EMAIL_NOT_VERIFIED = "EMAIL_NOT_VERIFIED"

    # User
    USER_NOT_FOUND = "USER_NOT_FOUND"
    USERNAME_TAKEN = "USERNAME_TAKEN"
    EMAIL_TAKEN = "EMAIL_TAKEN"

    # Health Profile
    PROFILE_EXISTS = "PROFILE_EXISTS"
    INVALID_ALLERGEN = "INVALID_ALLERGEN"

    # General
    VALIDATION_ERROR = "VALIDATION_ERROR"
    RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED"
    INTERNAL_ERROR = "INTERNAL_ERROR"
```

---

## 7. Rate Limiting

### 7.1 Rate Limit Rules

| Endpoint Type           | Limit        | Window    |
| ----------------------- | ------------ | --------- |
| Public endpoints        | 100 requests | 1 minute  |
| Authenticated endpoints | 500 requests | 1 minute  |
| Auth endpoints          | 10 requests  | 5 minutes |
| Heavy operations        | 10 requests  | 1 hour    |

### 7.2 Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1698000000
Retry-After: 60  # When rate limited
```

### 7.3 Rate Limit Response

```json
429 Too Many Requests
{
  "detail": "Rate limit exceeded",
  "code": "RATE_LIMIT_EXCEEDED",
  "retry_after": 60
}
```

---

## 8. API Versioning

### 8.1 Versioning Strategy

- Version in URL path: `/api/v1/`
- Major versions only (v1, v2)
- Backward compatibility within major version
- Deprecation notices via headers

### 8.2 Version Headers

```http
X-API-Version: 1.0
X-API-Deprecated: true  # If using deprecated endpoint
X-API-Sunset-Date: 2026-01-01  # When endpoint will be removed
```

### 8.3 Migration Support

```http
# Request specific version
Accept: application/vnd.eatsential.v1+json

# Response includes version
Content-Type: application/vnd.eatsential.v1+json
```

---

## 9. Security

### 9.1 HTTPS Requirements

- All production API calls must use HTTPS
- HTTP Strict Transport Security (HSTS) enabled
- Certificate pinning for mobile apps

### 9.2 Input Validation

```python
# Pydantic validation example
class UserCreate(BaseModel):
    username: constr(min_length=3, max_length=20, regex="^[a-zA-Z0-9_]+$")
    email: EmailStr
    password: SecretStr

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: SecretStr) -> SecretStr:
        password = v.get_secret_value()
        if len(password) < 8:
            raise ValueError("Password too short")
        # Additional validation...
        return v
```

### 9.3 SQL Injection Prevention

```python
# Use parameterized queries
def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

# Never use string formatting
# BAD: query = f"SELECT * FROM users WHERE email = '{email}'"
```

### 9.4 XSS Prevention

- Sanitize all user input
- Set Content-Type headers correctly
- Use Content Security Policy (CSP)

---

## 10. Testing

### 10.1 API Testing Strategy

```python
# Test example
@pytest.mark.asyncio
async def test_register_user(client: AsyncClient):
    response = await client.post(
        "/api/auth/register",
        json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "TestPass123!"
        }
    )
    assert response.status_code == 201
    assert response.json()["email"] == "test@example.com"
```

### 10.2 Test Coverage Requirements

- Unit tests: 80% minimum
- Integration tests: All endpoints
- Security tests: Authentication, authorization
- Performance tests: Load testing for recommendations

### 10.3 API Documentation Testing

```python
# Ensure OpenAPI spec is valid
def test_openapi_schema():
    response = client.get("/api/openapi.json")
    assert response.status_code == 200
    schema = response.json()
    assert schema["openapi"].startswith("3.")
```

---

## Appendix A: OpenAPI Specification

The complete OpenAPI specification is available at:

- Development: http://localhost:8000/docs
- Staging: https://staging-api.eatsential.com/docs
- Production: https://api.eatsential.com/docs

## Appendix B: SDK Examples

### Python SDK Example

```python
from eatsential import EatsentialClient

client = EatsentialClient(api_key="your_api_key")

# Register user
user = client.auth.register(
    username="johndoe",
    email="john@example.com",
    password="SecurePass123!"
)

# Get recommendations
recommendations = client.recommendations.get(
    meal_type="lunch",
    max_calories=600
)
```

### JavaScript SDK Example

```javascript
import { EatsentialClient } from '@eatsential/sdk';

const client = new EatsentialClient({ apiKey: 'your_api_key' });

// Register user
const user = await client.auth.register({
  username: 'johndoe',
  email: 'john@example.com',
  password: 'SecurePass123!',
});

// Get recommendations
const recommendations = await client.recommendations.get({
  mealType: 'lunch',
  maxCalories: 600,
});
```
