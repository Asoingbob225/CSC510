# API Specifications

## Base URL

```
Development: http://localhost:8000/api
Production: https://api.eatsential.com/api
```

## Current Endpoints

### Health Check

```
GET /api
```

Response:

```json
{
  "The server is running": "Hello World"
}
```

### Authentication

#### Register User

```
POST /api/auth/register
```

Request Body:

```json
{
  "username": "string", // 3-20 characters
  "email": "user@example.com",
  "password": "string" // 8-48 chars, must include upper, lower, number, special
}
```

Response (201):

```json
{
  "id": "uuid",
  "username": "string",
  "email": "user@example.com",
  "message": "Success! Please check your email for verification instructions."
}
```

Error Response (400):

```json
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

#### Verify Email

```
GET /api/auth/verify-email/{token}
```

Response (200):

```json
{
  "message": "Email verified successfully! You can now log in."
}
```

Error Response (400):

```json
{
  "detail": "Invalid or expired verification token"
}
```

#### Resend Verification

```
POST /api/auth/resend-verification
```

Request Body:

```json
{
  "email": "user@example.com"
}
```

Response (201):

```json
{
  "message": "Verification email sent! Please check your inbox."
}
```

## Common Response Formats

### Validation Error (422)

```json
{
  "detail": [
    {
      "loc": ["body", "field_name"],
      "msg": "error message",
      "type": "error_type"
    }
  ]
}
```

### Server Error (500)

```json
{
  "detail": "An error occurred during registration. Please try again later."
}
```

## Rate Limiting

- **Limit**: 100 requests per minute per IP
- **Headers**:
  - `X-RateLimit-Limit`: 100
  - `X-RateLimit-Remaining`: Number of requests remaining
  - `X-RateLimit-Reset`: Unix timestamp when limit resets

## CORS Configuration

Allowed Origins:

- `http://localhost:5173` (development)
- `https://eatsential.com` (production)

## Planned Endpoints (Not Yet Implemented)

### Authentication

- `POST /api/auth/login` - User login with JWT
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - Logout and invalidate token

### User Management

- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update user profile
- `DELETE /api/users/me` - Delete user account

### Health Profile

- `GET /api/health-profile` - Get user's health profile
- `POST /api/health-profile` - Create health profile
- `PUT /api/health-profile` - Update health profile

### Recommendations

- `GET /api/recommendations` - Get meal recommendations
- `POST /api/recommendations/feedback` - Submit feedback

---

**See existing code**:

- Backend: `src/eatsential/routers/auth.py`
- Schemas: `src/eatsential/schemas.py`
