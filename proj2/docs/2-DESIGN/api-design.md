# API Detailed Design

**Project:** Eatsential - Dual-Dimension Health Platform (Physical + Mental Wellness)  
**Document Type:** API Design Specification  
**Version:** 2.0 (Mental Wellness APIs Added)  
**Date:** October 25, 2025  
**API Version:** v1

**Version 2.0 Updates**:

- Added 31 Mental Wellness API endpoints (Section 9A)
- 7 endpoint categories: Goals, Mood, Stress, Sleep, Health Tags, Dual-Dimension Recs, AI Concierge
- Enhanced security requirements for mental health data
- Added AI-powered health tagging and recommendation features
- Streaming support for AI Concierge chat

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

### 3.1 Current Implementation (JWT + Email Verification)

**Status**: ✅ **Implemented**

```python
# JWT token-based authentication - IMPLEMENTED
POST /api/auth/register -> Create account and send verification email
POST /api/auth/login -> Get JWT access token
GET /api/auth/verify-email/{token} -> Verify email address
POST /api/auth/resend-verification -> Resend verification email
```

**JWT Token Details**:

- Algorithm: HS256
- Token Location: Authorization header (`Bearer <token>`)
- Token Payload: `{sub: user_id, exp: expiration_time}`
- Protected Routes: Require valid JWT token via `Depends(get_current_user)`

### 3.2 Future Enhancements

```python
# Not yet implemented
POST /api/auth/refresh -> Refresh access token
POST /api/auth/logout -> Invalidate token
POST /api/auth/forgot-password -> Password reset request
POST /api/auth/reset-password -> Reset password with token
```

### 3.3 Authorization Levels

| Level         | Description                | Access                       | Status         |
| ------------- | -------------------------- | ---------------------------- | -------------- |
| Public        | No authentication required | Health check, auth endpoints | ✅ Implemented |
| Authenticated | Valid JWT token            | Own profile, health data     | ✅ Implemented |
| Verified      | Email verified             | Required before login        | ✅ Implemented |
| Admin         | Admin role (USER/ADMIN)    | Future admin features        | ✅ Implemented |

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

**Status**: ✅ **Implemented**

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
  "role": "user",
  "message": "Success! Please check your email for verification instructions."
}
```

**Error Responses:**

```json
422 Unprocessable Entity
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "This email address is already registered",
      "type": "value_error"
    }
  ]
}

422 Unprocessable Entity
{
  "detail": [
    {
      "loc": ["body", "username"],
      "msg": "This username is already taken",
      "type": "value_error"
    }
  ]
}
```

---

#### POST /api/auth/login

**Status**: ✅ **Implemented**

Authenticate user and receive JWT access token.

**Request Body:**

```json
{
  "username_or_email": "johndoe", // Username or email
  "password": "SecurePass123!"
}
```

**Response:**

```json
200 OK
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "johndoe",
  "email": "john@example.com",
  "role": "user",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "message": "Login successful",
  "has_completed_wizard": true
}
```

**Error Responses:**

```json
400 Bad Request
{
  "detail": "Please verify your email before logging in"
}

400 Bad Request
{
  "detail": "Invalid credentials"
}
```

---

#### GET /api/auth/verify-email/{token}

**Status**: ✅ **Implemented**

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

---

#### POST /api/auth/resend-verification

**Status**: ✅ **Implemented**

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

---

### 4.3 User Management

**Status**: ✅ **Partially Implemented**

#### GET /api/users/me

**Status**: ✅ **Implemented**

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
  "role": "user",
  "message": "Profile retrieved successfully"
}
```

---

#### PUT /api/users/me

**Status**: ❌ **Not Implemented**

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

---

#### DELETE /api/users/me

**Status**: ❌ **Not Implemented**

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

---

### 4.4 Health Profile Management

**Status**: ✅ **Implemented**

#### POST /api/health/profile

**Status**: ✅ **Implemented**

Create health profile for current user.

**Headers:**

```http
Authorization: Bearer <jwt_token>
```

**Request Body:**

```json
{
  "height_cm": 175.5, // Optional: 50-300
  "weight_kg": 70.5, // Optional: 20-500
  "activity_level": "moderate", // Optional: sedentary|light|moderate|active|very_active
  "metabolic_rate": 2000 // Optional: calculated BMR
}
```

**Response:**

```json
201 Created
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "height_cm": 175.5,
  "weight_kg": 70.5,
  "activity_level": "moderate",
  "metabolic_rate": 2000,
  "allergies": [],
  "dietary_preferences": [],
  "created_at": "2025-10-22T10:00:00Z",
  "updated_at": "2025-10-22T10:00:00Z"
}
```

**Error Responses:**

```json
400 Bad Request
{
  "detail": "Health profile already exists for this user"
}
```

---

#### GET /api/health/profile

**Status**: ✅ **Implemented**

Get current user's health profile.

**Headers:**

```http
Authorization: Bearer <jwt_token>
```

**Response:**

```json
200 OK
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "height_cm": 175.5,
  "weight_kg": 70.5,
  "activity_level": "moderate",
  "metabolic_rate": 2000,
  "allergies": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "allergen": {
        "id": "880e8400-e29b-41d4-a716-446655440003",
        "name": "Peanuts",
        "category": "nuts",
        "is_major_allergen": true
      },
      "severity": "severe",
      "diagnosed_date": "2020-01-15",
      "reaction_type": "anaphylaxis",
      "notes": "Epipen required",
      "is_verified": true,
      "created_at": "2025-10-22T10:00:00Z",
      "updated_at": "2025-10-22T10:00:00Z"
    }
  ],
  "dietary_preferences": [
    {
      "id": "990e8400-e29b-41d4-a716-446655440004",
      "preference_type": "diet",
      "preference_name": "vegetarian",
      "is_strict": true,
      "reason": "ethical",
      "notes": "No meat, poultry, or fish",
      "created_at": "2025-10-22T10:00:00Z",
      "updated_at": "2025-10-22T10:00:00Z"
    }
  ],
  "created_at": "2025-10-22T10:00:00Z",
  "updated_at": "2025-10-22T10:00:00Z"
}
```

**Error Response:**

```json
404 Not Found
{
  "detail": "Health profile not found"
}
```

---

#### PUT /api/health/profile

**Status**: ✅ **Implemented**

Update current user's health profile.

**Headers:**

```http
Authorization: Bearer <jwt_token>
```

**Request Body:**

```json
{
  "height_cm": 176.0, // Optional
  "weight_kg": 72.0, // Optional
  "activity_level": "active", // Optional
  "metabolic_rate": 2100 // Optional
}
```

**Response:**

```json
200 OK
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "height_cm": 176.0,
  "weight_kg": 72.0,
  "activity_level": "active",
  "metabolic_rate": 2100,
  "allergies": [...],
  "dietary_preferences": [...],
  "created_at": "2025-10-22T10:00:00Z",
  "updated_at": "2025-10-22T11:00:00Z"
}
```

**Error Response:**

```json
404 Not Found
{
  "detail": "Health profile not found"
}
```

---

#### DELETE /api/health/profile

**Status**: ✅ **Implemented**

Delete current user's health profile.

**Headers:**

```http
Authorization: Bearer <jwt_token>
```

**Response:**

```json
200 OK
{
  "message": "Health profile deleted successfully"
}
```

**Error Response:**

```json
404 Not Found
{
  "detail": "Health profile not found"
}
```

---

### 4.5 Allergy Management

**Status**: ✅ **Implemented**

#### GET /api/health/allergens

**Status**: ✅ **Implemented**

Get list of all available allergens from database.

**Headers:**

```http
Authorization: Bearer <jwt_token>
```

**Response:**

```json
200 OK
[
  {
    "id": "880e8400-e29b-41d4-a716-446655440003",
    "name": "Peanuts",
    "category": "nuts",
    "is_major_allergen": true,
    "description": "Common tree nut allergen",
    "created_at": "2025-01-01T00:00:00Z"
  },
  {
    "id": "880e8400-e29b-41d4-a716-446655440004",
    "name": "Shellfish",
    "category": "seafood",
    "is_major_allergen": true,
    "description": "Includes shrimp, crab, lobster",
    "created_at": "2025-01-01T00:00:00Z"
  }
]
```

---

#### GET /api/health/allergies

**Status**: ✅ **Implemented**

Get all allergies for current user.

**Headers:**

```http
Authorization: Bearer <jwt_token>
```

**Response:**

```json
200 OK
[
  {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "health_profile_id": "660e8400-e29b-41d4-a716-446655440001",
    "allergen": {
      "id": "880e8400-e29b-41d4-a716-446655440003",
      "name": "Peanuts",
      "category": "nuts",
      "is_major_allergen": true
    },
    "severity": "severe",
    "diagnosed_date": "2020-01-15",
    "reaction_type": "anaphylaxis",
    "notes": "Epipen required",
    "is_verified": true,
    "created_at": "2025-10-22T10:00:00Z",
    "updated_at": "2025-10-22T10:00:00Z"
  }
]
```

---

#### POST /api/health/allergies

**Status**: ✅ **Implemented**

Add new allergy to current user's health profile.

**Headers:**

```http
Authorization: Bearer <jwt_token>
```

**Request Body:**

```json
{
  "allergen_name": "Peanuts", // Name from allergen database
  "severity": "severe", // mild|moderate|severe|life_threatening
  "diagnosed_date": "2020-01-15", // Optional: YYYY-MM-DD
  "reaction_type": "anaphylaxis", // Optional
  "notes": "Epipen required", // Optional
  "is_verified": true // Optional, default false
}
```

**Response:**

```json
201 Created
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "health_profile_id": "660e8400-e29b-41d4-a716-446655440001",
  "allergen": {
    "id": "880e8400-e29b-41d4-a716-446655440003",
    "name": "Peanuts",
    "category": "nuts",
    "is_major_allergen": true
  },
  "severity": "severe",
  "diagnosed_date": "2020-01-15",
  "reaction_type": "anaphylaxis",
  "notes": "Epipen required",
  "is_verified": true,
  "created_at": "2025-10-22T10:00:00Z",
  "updated_at": "2025-10-22T10:00:00Z"
}
```

**Error Responses:**

```json
400 Bad Request
{
  "detail": "Health profile not found"
}

400 Bad Request
{
  "detail": "Allergen 'Unknown Food' not found in database"
}
```

---

#### PUT /api/health/allergies/{allergy_id}

**Status**: ✅ **Implemented**

Update existing allergy.

**Headers:**

```http
Authorization: Bearer <jwt_token>
```

**Path Parameters:**

- `allergy_id`: UUID of the allergy to update

**Request Body:**

```json
{
  "severity": "moderate", // Optional
  "diagnosed_date": "2020-06-01", // Optional
  "reaction_type": "hives", // Optional
  "notes": "Updated notes", // Optional
  "is_verified": true // Optional
}
```

**Response:**

```json
200 OK
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "health_profile_id": "660e8400-e29b-41d4-a716-446655440001",
  "allergen": {...},
  "severity": "moderate",
  "diagnosed_date": "2020-06-01",
  "reaction_type": "hives",
  "notes": "Updated notes",
  "is_verified": true,
  "created_at": "2025-10-22T10:00:00Z",
  "updated_at": "2025-10-22T11:00:00Z"
}
```

**Error Response:**

```json
404 Not Found
{
  "detail": "Allergy not found"
}
```

---

#### DELETE /api/health/allergies/{allergy_id}

**Status**: ✅ **Implemented**

Remove allergy from user's profile.

**Headers:**

```http
Authorization: Bearer <jwt_token>
```

**Path Parameters:**

- `allergy_id`: UUID of the allergy to delete

**Response:**

```json
200 OK
{
  "message": "Allergy deleted successfully"
}
```

**Error Response:**

```json
404 Not Found
{
  "detail": "Allergy not found"
}
```

---

### 4.6 Dietary Preferences Management

**Status**: ✅ **Implemented**

#### GET /api/health/dietary-preferences

**Status**: ✅ **Implemented**

Get all dietary preferences for current user.

**Headers:**

```http
Authorization: Bearer <jwt_token>
```

**Response:**

```json
200 OK
[
  {
    "id": "990e8400-e29b-41d4-a716-446655440004",
    "health_profile_id": "660e8400-e29b-41d4-a716-446655440001",
    "preference_type": "diet",
    "preference_name": "vegetarian",
    "is_strict": true,
    "reason": "ethical",
    "notes": "No meat, poultry, or fish",
    "created_at": "2025-10-22T10:00:00Z",
    "updated_at": "2025-10-22T10:00:00Z"
  }
]
```

---

#### POST /api/health/dietary-preferences

**Status**: ✅ **Implemented**

Add new dietary preference.

**Headers:**

```http
Authorization: Bearer <jwt_token>
```

**Request Body:**

```json
{
  "preference_type": "diet", // diet|cuisine|ingredient|preparation
  "preference_name": "vegetarian",
  "is_strict": true, // Optional, default true
  "reason": "ethical", // Optional
  "notes": "No meat, poultry, or fish" // Optional
}
```

**Response:**

```json
201 Created
{
  "id": "990e8400-e29b-41d4-a716-446655440004",
  "health_profile_id": "660e8400-e29b-41d4-a716-446655440001",
  "preference_type": "diet",
  "preference_name": "vegetarian",
  "is_strict": true,
  "reason": "ethical",
  "notes": "No meat, poultry, or fish",
  "created_at": "2025-10-22T10:00:00Z",
  "updated_at": "2025-10-22T10:00:00Z"
}
```

**Error Response:**

```json
400 Bad Request
{
  "detail": "Health profile not found"
}
```

---

#### PUT /api/health/dietary-preferences/{preference_id}

**Status**: ✅ **Implemented**

Update existing dietary preference.

**Headers:**

```http
Authorization: Bearer <jwt_token>
```

**Path Parameters:**

- `preference_id`: UUID of the preference to update

**Request Body:**

```json
{
  "preference_name": "vegan", // Optional
  "is_strict": false, // Optional
  "reason": "health", // Optional
  "notes": "Updated preferences" // Optional
}
```

**Response:**

```json
200 OK
{
  "id": "990e8400-e29b-41d4-a716-446655440004",
  "health_profile_id": "660e8400-e29b-41d4-a716-446655440001",
  "preference_type": "diet",
  "preference_name": "vegan",
  "is_strict": false,
  "reason": "health",
  "notes": "Updated preferences",
  "created_at": "2025-10-22T10:00:00Z",
  "updated_at": "2025-10-22T11:00:00Z"
}
```

**Error Response:**

```json
404 Not Found
{
  "detail": "Dietary preference not found"
}
```

---

#### DELETE /api/health/dietary-preferences/{preference_id}

**Status**: ✅ **Implemented**

Remove dietary preference from user's profile.

**Headers:**

```http
Authorization: Bearer <jwt_token>
```

**Path Parameters:**

- `preference_id`: UUID of the preference to delete

**Response:**

```json
200 OK
{
  "message": "Dietary preference deleted successfully"
}
```

**Error Response:**

```json
404 Not Found
{
  "detail": "Dietary preference not found"
}
```

---

### 4.7 Meal Recommendations

## **Status**: ❌ **Not Implemented**

### 4.8 Meal Recommendations (Future)

**Status**: ❌ **Not Implemented**

This section will include endpoints for AI-powered meal recommendations once implemented.

---

## 5. Data Models

### 5.1 Core Models

## 5. Data Models

**Note**: These models reflect the actual database schema as implemented.

### 5.1 Core Models

#### User Model (UserDB)

```python
class UserDB(Base):
    """SQLAlchemy ORM model for users table"""
    __tablename__ = "users"

    id: str  # UUID string, primary key
    email: str  # unique, indexed, case-insensitive
    username: str  # 3-20 chars, unique, indexed, case-insensitive
    password_hash: str  # bcrypt hashed password
    created_at: datetime
    updated_at: datetime
    account_status: str  # PENDING|VERIFIED|SUSPENDED
    email_verified: bool  # default False
    verification_token: Optional[str]  # UUID for email verification
    verification_token_expires: Optional[datetime]  # 24h expiry
    role: str  # USER|ADMIN, indexed

    # Relationships
    health_profile: Optional[HealthProfileDB]  # one-to-one, cascade delete
```

#### HealthProfile Model (HealthProfileDB)

```python
class HealthProfileDB(Base):
    """SQLAlchemy ORM model for health_profiles table"""
    __tablename__ = "health_profiles"

    id: str  # UUID string, primary key
    user_id: str  # FK to users.id, unique, CASCADE on delete
    height_cm: Optional[float]  # Numeric(5,2), range: 50-300
    weight_kg: Optional[float]  # Numeric(5,2), range: 20-500
    activity_level: Optional[str]  # sedentary|light|moderate|active|very_active
    metabolic_rate: Optional[int]  # BMR calculation result

    created_at: datetime
    updated_at: datetime

    # Relationships
    user: UserDB  # back_populates to user.health_profile
    allergies: List[UserAllergyDB]  # one-to-many, cascade delete
    dietary_preferences: List[DietaryPreferenceDB]  # one-to-many, cascade delete
```

#### Allergen Database Model (AllergenDB)

```python
class AllergenDB(Base):
    """Master allergen database table"""
    __tablename__ = "allergen_database"

    id: str  # UUID string, primary key
    name: str  # unique, max 100 chars (e.g., "Peanuts")
    category: str  # max 50 chars (e.g., "nuts", "seafood")
    is_major_allergen: bool  # True for top 8 allergens
    description: Optional[str]  # text field for details
    created_at: datetime

    # Relationships
    user_allergies: List[UserAllergyDB]
```

#### User Allergy Model (UserAllergyDB)

```python
class UserAllergyDB(Base):
    """User-specific allergies table"""
    __tablename__ = "user_allergies"

    id: str  # UUID string, primary key
    health_profile_id: str  # FK to health_profiles.id, CASCADE on delete
    allergen_id: str  # FK to allergen_database.id

    # Allergy Information
    severity: str  # mild|moderate|severe|life_threatening (max 20 chars)
    diagnosed_date: Optional[date]  # when allergy was diagnosed
    reaction_type: Optional[str]  # max 50 chars (e.g., "anaphylaxis", "hives")
    notes: Optional[str]  # text field for additional info
    is_verified: bool  # default False, for medical verification

    created_at: datetime
    updated_at: datetime

    # Relationships
    health_profile: HealthProfileDB
    allergen: AllergenDB
```

#### Dietary Preference Model (DietaryPreferenceDB)

```python
class DietaryPreferenceDB(Base):
    """User dietary preferences table"""
    __tablename__ = "dietary_preferences"

    id: str  # UUID string, primary key
    health_profile_id: str  # FK to health_profiles.id, CASCADE on delete

    # Preference Details
    preference_type: str  # diet|cuisine|ingredient|preparation (max 50 chars)
    preference_name: str  # max 100 chars (e.g., "vegetarian", "Italian")
    is_strict: bool  # default True, whether preference is mandatory

    # Reason and Notes
    reason: Optional[str]  # max 50 chars (e.g., "ethical", "health")
    notes: Optional[str]  # text field for additional details

    created_at: datetime
    updated_at: datetime

    # Relationships
    health_profile: HealthProfileDB
```

---

### 5.2 Enums

```python
class AccountStatus(str, Enum):
    """User account status"""
    PENDING = "pending"  # Email not verified
    VERIFIED = "verified"  # Email verified, can log in
    SUSPENDED = "suspended"  # Account suspended by admin

class UserRole(str, Enum):
    """User role for access control"""
    USER = "user"  # Standard user
    ADMIN = "admin"  # Administrator

class ActivityLevel(str, Enum):
    """Physical activity level for BMR calculation"""
    SEDENTARY = "sedentary"  # Little or no exercise
    LIGHT = "light"  # Exercise 1-3 days/week
    MODERATE = "moderate"  # Exercise 3-5 days/week
    ACTIVE = "active"  # Exercise 6-7 days/week
    VERY_ACTIVE = "very_active"  # Intense exercise daily

class AllergySeverity(str, Enum):
    """Allergy severity levels"""
    MILD = "mild"  # Minor discomfort
    MODERATE = "moderate"  # Noticeable reaction
    SEVERE = "severe"  # Serious reaction
    LIFE_THREATENING = "life_threatening"  # Anaphylaxis risk

class PreferenceType(str, Enum):
    """Types of dietary preferences"""
    DIET = "diet"  # e.g., vegetarian, vegan, keto
    CUISINE = "cuisine"  # e.g., Italian, Asian, Mexican
    INGREDIENT = "ingredient"  # e.g., gluten-free, dairy-free
    PREPARATION = "preparation"  # e.g., raw, steamed, grilled
```

---

### 5.3 Pydantic Schemas (API Request/Response)

**Note**: These are used for API validation and serialization

```python
# Request schemas
class UserCreate(BaseModel):
    username: str  # constr(min_length=3, max_length=20)
    email: EmailStr
    password: str  # constr(min_length=8, max_length=48)

class UserLogin(BaseModel):
    username_or_email: str
    password: str

class HealthProfileCreate(BaseModel):
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    activity_level: Optional[ActivityLevel] = None
    metabolic_rate: Optional[int] = None

class UserAllergyCreate(BaseModel):
    allergen_name: str  # Name from AllergenDB
    severity: AllergySeverity
    diagnosed_date: Optional[date] = None
    reaction_type: Optional[str] = None
    notes: Optional[str] = None
    is_verified: bool = False

class DietaryPreferenceCreate(BaseModel):
    preference_type: PreferenceType
    preference_name: str
    is_strict: bool = True
    reason: Optional[str] = None
    notes: Optional[str] = None

# Response schemas
class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    role: str
    message: str

class LoginResponse(UserResponse):
    access_token: str
    token_type: str
    has_completed_wizard: bool

class HealthProfileResponse(BaseModel):
    id: str
    user_id: str
    height_cm: Optional[float]
    weight_kg: Optional[float]
    activity_level: Optional[str]
    metabolic_rate: Optional[int]
    allergies: List[UserAllergyResponse]
    dietary_preferences: List[DietaryPreferenceResponse]
    created_at: datetime
    updated_at: datetime
```

---

## 6. Error Handling

### 6.1 Error Response Format

```json
{
  "detail": "Human-readable error message"
}

// Or for validation errors:
{
  "detail": [
    {
      "loc": ["body", "field_name"],
      "msg": "Error description",
      "type": "value_error"
    }
  ]
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

## 9A. Mental Wellness API Endpoints (NEW - v2.0)

**Status**: ❌ **Not Implemented** (Planned for Dual-Dimension Health Platform)

This section defines the 31 Mental Wellness API endpoints that extend Eatsential into a comprehensive Dual-Dimension Health platform. These endpoints support mood tracking, stress management, sleep analysis, health tagging, dual-dimension recommendations, and AI health concierge features.

### 9A.1 Mental Wellness Goals

#### POST /api/mental-wellness/goals

Create a new mental wellness goal.

**Authentication**: Required (JWT)

**Request Body**:

```json
{
  "goal_type": "mood_improvement",
  "target_value": 7.5,
  "target_unit": "score",
  "frequency": "daily",
  "start_date": "2025-11-01",
  "end_date": "2025-12-31",
  "notes": "Improve overall mood through diet and mindfulness"
}
```

**Response (201 Created)**:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "goal_type": "mood_improvement",
  "target_value": 7.5,
  "target_unit": "score",
  "frequency": "daily",
  "start_date": "2025-11-01",
  "end_date": "2025-12-31",
  "status": "ACTIVE",
  "progress_percentage": 0.0,
  "created_at": "2025-10-25T10:00:00Z"
}
```

#### GET /api/mental-wellness/goals

Retrieve all mental wellness goals for the authenticated user.

**Query Parameters**:

- `status` (optional): Filter by status (ACTIVE, PAUSED, COMPLETED, ABANDONED)
- `goal_type` (optional): Filter by goal type

**Response (200 OK)**:

```json
{
  "total": 3,
  "goals": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "goal_type": "mood_improvement",
      "target_value": 7.5,
      "status": "ACTIVE",
      "progress_percentage": 45.0,
      "days_active": 30,
      "created_at": "2025-10-01T10:00:00Z"
    }
  ]
}
```

#### GET /api/mental-wellness/goals/{goal_id}

Retrieve a specific mental wellness goal with detailed progress.

#### PATCH /api/mental-wellness/goals/{goal_id}

Update a mental wellness goal (status, target, notes).

#### DELETE /api/mental-wellness/goals/{goal_id}

Delete a mental wellness goal.

#### GET /api/mental-wellness/dashboard

Get comprehensive mental wellness dashboard data.

**Response (200 OK)**:

```json
{
  "current_week_summary": {
    "mood_average": 7.2,
    "stress_average": 4.3,
    "sleep_hours_average": 7.5,
    "sleep_quality_average": 8.1
  },
  "active_goals": 3,
  "goals_on_track": 2,
  "current_streak": {
    "mood_logging": 15,
    "sleep_logging": 22
  },
  "recent_insights": [
    {
      "type": "correlation",
      "message": "Your mood improves by 15% on days with 8+ hours of sleep",
      "confidence": 0.87
    }
  ]
}
```

#### GET /api/mental-wellness/reports

Generate mental wellness progress reports (weekly/monthly).

**Query Parameters**:

- `period`: "weekly" | "monthly" | "custom"
- `start_date`, `end_date` (for custom period)

---

### 9A.2 Mood Tracking

#### POST /api/mood-tracking/logs

Log a mood entry.

**Request Body**:

```json
{
  "mood_score": 8,
  "mood_label": "good",
  "energy_level": 7,
  "context": "After morning workout",
  "notes": "Feeling energized and positive",
  "logged_at": "2025-10-25T09:30:00Z"
}
```

**Response (201 Created)**:

```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "mood_score": 8,
  "mood_label": "good",
  "energy_level": 7,
  "logged_at": "2025-10-25T09:30:00Z",
  "created_at": "2025-10-25T09:30:00Z"
}
```

#### GET /api/mood-tracking/logs

Retrieve mood logs with filtering and pagination.

**Query Parameters**:

- `start_date`, `end_date`: Date range filter
- `limit`: Number of results (default 30)
- `page`: Page number (default 1)

#### GET /api/mood-tracking/patterns

Analyze mood patterns and correlations.

**Response (200 OK)**:

```json
{
  "trend": "improving",
  "average_score_30d": 7.2,
  "average_score_7d": 7.8,
  "best_day_of_week": "Saturday",
  "worst_day_of_week": "Monday",
  "correlations": [
    {
      "factor": "sleep_hours",
      "correlation_coefficient": 0.76,
      "insight": "Mood improves significantly with 7-8 hours of sleep"
    },
    {
      "factor": "stress_level",
      "correlation_coefficient": -0.68,
      "insight": "High stress days correlate with lower mood scores"
    }
  ]
}
```

---

### 9A.3 Stress Tracking

#### POST /api/stress-tracking/logs

Log a stress level entry.

**Request Body**:

```json
{
  "stress_level": 6,
  "stress_label": "moderate",
  "triggers": ["Work deadline", "Traffic"],
  "coping_strategies": ["Deep breathing", "Exercise"],
  "notes": "Managed to reduce stress with workout",
  "logged_at": "2025-10-25T14:00:00Z"
}
```

#### GET /api/stress-tracking/logs

Retrieve stress logs with filtering.

#### GET /api/stress-tracking/patterns

Analyze stress patterns, common triggers, and effective coping strategies.

**Response (200 OK)**:

```json
{
  "average_stress_level_30d": 5.2,
  "trend": "decreasing",
  "most_common_triggers": [
    { "trigger": "Work deadline", "frequency": 15 },
    { "trigger": "Traffic", "frequency": 10 }
  ],
  "most_effective_coping": [
    { "strategy": "Exercise", "effectiveness_score": 8.5 },
    { "strategy": "Deep breathing", "effectiveness_score": 7.2 }
  ],
  "high_stress_days": 8,
  "recommended_foods": [
    {
      "food_name": "Dark chocolate",
      "tags": ["#StressRelief"],
      "reason": "Rich in magnesium and mood-boosting compounds"
    }
  ]
}
```

---

### 9A.4 Sleep Tracking

#### POST /api/sleep-tracking/logs

Log a sleep entry.

**Request Body**:

```json
{
  "sleep_date": "2025-10-24",
  "bedtime": "23:00:00",
  "wake_time": "07:00:00",
  "quality_score": 8,
  "quality_label": "good",
  "interruptions": 1,
  "notes": "Slept well after avoiding caffeine"
}
```

**Response (201 Created)**:

```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "sleep_date": "2025-10-24",
  "duration_hours": 8.0,
  "quality_score": 8,
  "quality_label": "good",
  "created_at": "2025-10-25T08:00:00Z"
}
```

#### GET /api/sleep-tracking/logs

Retrieve sleep logs with date range filtering.

#### GET /api/sleep-tracking/correlations

Analyze sleep-food-mood correlations.

**Response (200 OK)**:

```json
{
  "average_sleep_hours_30d": 7.3,
  "average_quality_30d": 7.8,
  "sleep_debt": -1.5,
  "correlations": [
    {
      "factor": "caffeine_intake",
      "time_window": "after_2pm",
      "impact_on_quality": -1.5,
      "confidence": 0.82
    },
    {
      "factor": "mood_score",
      "correlation": 0.71,
      "insight": "Better sleep strongly correlates with improved mood"
    }
  ],
  "recommendations": [
    "Avoid caffeine after 2 PM",
    "Foods with #SleepAid: Cherries, almonds, turkey"
  ]
}
```

---

### 9A.5 Health Tagging System

#### GET /api/health-tags

Retrieve all active health tags.

**Query Parameters**:

- `category` (optional): Filter by category (Mental Wellness, Physical Health, Sleep, etc.)
- `min_effectiveness` (optional): Minimum effectiveness rating

**Response (200 OK)**:

```json
{
  "total": 25,
  "tags": [
    {
      "id": "880e8400-e29b-41d4-a716-446655440003",
      "tag_name": "#StressRelief",
      "category": "Mental Wellness",
      "description": "Foods that help reduce cortisol levels and promote relaxation",
      "key_nutrients": ["Magnesium", "Vitamin B6", "Omega-3"],
      "effectiveness_rating": 4.2,
      "food_count": 47
    },
    {
      "id": "880e8400-e29b-41d4-a716-446655440004",
      "tag_name": "#MoodBoost",
      "category": "Mental Wellness",
      "description": "Foods rich in mood-enhancing nutrients",
      "key_nutrients": ["Tryptophan", "Vitamin D", "Folate"],
      "effectiveness_rating": 4.0,
      "food_count": 52
    }
  ]
}
```

#### GET /api/health-tags/{tag_id}

Get detailed information about a specific health tag including scientific basis and related research.

#### GET /api/foods/by-tag/{tag_name}

Search foods by health tag.

**Query Parameters**:

- `min_confidence` (optional): Minimum confidence score (0.0-1.0)
- `verified_only` (optional): Only return verified tag associations
- `limit`, `page`: Pagination

**Response (200 OK)**:

```json
{
  "tag_name": "#StressRelief",
  "total_foods": 47,
  "foods": [
    {
      "food_id": "990e8400-e29b-41d4-a716-446655440005",
      "food_name": "Dark Chocolate (70% cacao)",
      "confidence_score": 0.92,
      "verified": true,
      "key_nutrients": {
        "magnesium_mg": 64,
        "flavonoids_mg": 120
      },
      "serving_size": "1 oz (28g)"
    }
  ]
}
```

#### POST /api/health-tags/ai-suggest

Get AI-powered health tag suggestions for a food item.

**Request Body**:

```json
{
  "food_name": "Salmon",
  "nutritional_data": {
    "omega3_g": 2.2,
    "protein_g": 25,
    "vitamin_d_ug": 12
  }
}
```

**Response (200 OK)**:

```json
{
  "suggested_tags": [
    {
      "tag_name": "#BrainFood",
      "confidence": 0.94,
      "reason": "High in omega-3 fatty acids (EPA/DHA) known for cognitive benefits"
    },
    {
      "tag_name": "#MoodBoost",
      "confidence": 0.87,
      "reason": "Rich in vitamin D and tryptophan, both linked to serotonin production"
    }
  ]
}
```

---

### 9A.6 Dual-Dimension Recommendation Engine

#### POST /api/recommendations/dual-dimension

Get meal recommendations balancing physical health + mental wellness.

**Request Body**:

```json
{
  "meal_type": "lunch",
  "max_calories": 600,
  "physical_goals": ["weight_loss", "muscle_gain"],
  "mental_goals": ["stress_relief", "mood_improvement"],
  "current_mood_score": 6,
  "current_stress_level": 7,
  "sleep_quality_last_night": 5,
  "user_context": "high_stress_day"
}
```

**Response (200 OK)**:

```json
{
  "recommendations": [
    {
      "meal_id": "aa0e8400-e29b-41d4-a716-446655440006",
      "meal_name": "Grilled Salmon with Quinoa & Spinach",
      "total_score": 9.2,
      "physical_score": 9.0,
      "mental_score": 9.5,
      "preference_score": 8.9,
      "calories": 580,
      "health_tags": ["#BrainFood", "#StressRelief", "#MoodBoost"],
      "why_recommended": {
        "physical": "High protein (35g) supports muscle recovery, balanced macros",
        "mental": "Omega-3 from salmon reduces stress, magnesium in spinach promotes calm",
        "context": "Ideal for high-stress days - nutrients support stress hormone regulation"
      },
      "key_nutrients_for_mental_wellness": {
        "omega3_g": 2.1,
        "magnesium_mg": 157,
        "vitamin_b6_mg": 0.9
      }
    }
  ],
  "algorithm_explanation": {
    "physical_weight": 0.4,
    "mental_weight": 0.4,
    "preference_weight": 0.2,
    "context_boost_applied": "high_stress_day (+15% to #StressRelief foods)"
  }
}
```

#### POST /api/recommendations/explain

Get detailed explanation of why a specific food/meal was recommended.

**Request Body**:

```json
{
  "meal_id": "aa0e8400-e29b-41d4-a716-446655440006",
  "user_context": {
    "current_goals": ["weight_loss", "stress_relief"],
    "recent_mood_average": 6.5,
    "recent_stress_average": 7.2
  }
}
```

#### GET /api/recommendations/contextual

Get context-aware recommendations based on time of day, recent logs, and patterns.

**Query Parameters**:

- `context_type`: "morning_boost", "pre_workout", "evening_calm", "high_stress", "low_energy"

#### POST /api/recommendations/smart-substitutions

Suggest mental-wellness-optimized alternatives for a meal.

**Request Body**:

```json
{
  "current_meal_id": "bb0e8400-e29b-41d4-a716-446655440007",
  "optimization_goal": "stress_relief",
  "maintain_calories": true
}
```

**Response (200 OK)**:

```json
{
  "original_meal": {
    "name": "Pasta with Marinara",
    "mental_wellness_score": 5.2
  },
  "substitutions": [
    {
      "meal_name": "Whole Wheat Pasta with Salmon & Spinach",
      "mental_wellness_score": 8.7,
      "improvement": "+67%",
      "key_changes": [
        "Added salmon (omega-3 for stress relief)",
        "Switched to whole wheat (complex carbs for stable mood)",
        "Added spinach (magnesium for relaxation)"
      ],
      "calorie_difference": +20
    }
  ]
}
```

---

### 9A.7 AI Health Concierge

#### POST /api/ai-concierge/chat

Send a message to the AI health concierge.

**Request Body**:

```json
{
  "session_id": "cc0e8400-e29b-41d4-a716-446655440008",
  "message": "I'm feeling stressed and having trouble sleeping. What foods should I eat?",
  "include_user_context": true
}
```

**Response (200 OK)** - Streaming Response:

```json
{
  "session_id": "cc0e8400-e29b-41d4-a716-446655440008",
  "response": "Based on your recent stress levels (averaging 7.2/10) and sleep quality (6.1/10), I recommend foods rich in magnesium and tryptophan...",
  "recommendations": [
    {
      "food_name": "Almonds",
      "tags": ["#StressRelief", "#SleepAid"],
      "reason": "High in magnesium (76mg per oz) which helps reduce cortisol"
    }
  ],
  "safety_disclaimer": "This is general nutritional guidance. For medical concerns, please consult a healthcare professional.",
  "sources": ["Journal of Clinical Sleep Medicine, 2020", "Nutrients, 2019 - Magnesium and Stress"],
  "tokens_used": 450
}
```

#### GET /api/ai-concierge/session/{session_id}

Retrieve chat session history.

#### GET /api/ai-concierge/insights

Get proactive AI-generated wellness insights based on user data patterns.

**Response (200 OK)**:

```json
{
  "insights": [
    {
      "type": "pattern_detected",
      "title": "Sleep-Mood Connection",
      "message": "I've noticed your mood drops by 20% on days with less than 7 hours of sleep. Would you like meal suggestions to improve sleep quality?",
      "confidence": 0.89,
      "data_points_analyzed": 45,
      "suggested_action": "Enable nightly #SleepAid food recommendations"
    },
    {
      "type": "goal_support",
      "title": "Stress Reduction Progress",
      "message": "Great news! Your stress levels have decreased 15% since adding magnesium-rich foods. Continue with foods tagged #StressRelief.",
      "confidence": 0.92
    }
  ]
}
```

#### POST /api/ai-concierge/adjust-goals

Let AI suggest goal adjustments based on progress and patterns.

**Request Body**:

```json
{
  "goal_id": "dd0e8400-e29b-41d4-a716-446655440009",
  "current_progress": 0.65,
  "struggling_areas": ["consistency", "weekend_adherence"]
}
```

**Response (200 OK)**:

```json
{
  "suggested_adjustments": [
    {
      "adjustment_type": "target_value",
      "current": 8.0,
      "suggested": 7.5,
      "reason": "Based on your patterns, a slightly lower target may improve consistency and reduce pressure"
    },
    {
      "adjustment_type": "add_weekend_flexibility",
      "suggestion": "Allow 20% variance on weekends based on your lifestyle patterns"
    }
  ],
  "predicted_success_rate": {
    "current_target": 0.45,
    "adjusted_target": 0.78
  }
}
```

---

### 9A.8 Security & Privacy for Mental Wellness APIs

**Additional Security Requirements** (per NFR-007A, NFR-021):

1. **Encryption**:
   - All mental wellness data encrypted at rest (AES-256)
   - Separate encryption keys for mental health data
   - TLS 1.3 for data in transit

2. **Authentication**:
   - JWT required for all mental wellness endpoints
   - Refresh token rotation every 24 hours
   - Session invalidation on suspicious activity

3. **Rate Limiting**:
   - AI Concierge: 20 requests/hour per user
   - Other Mental Wellness APIs: 100 requests/hour per user
   - Prevents abuse and controls LLM costs

4. **Data Access Logging**:
   - All mental wellness data access logged
   - Audit trail for compliance (HIPAA, GDPR)
   - User-accessible access logs

5. **Medical Advice Declination**:
   - AI Concierge programmed to decline medical advice (100% requirement)
   - Safety validation layer checks all responses
   - Automatic healthcare professional referral for medical concerns

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
