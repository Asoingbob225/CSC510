# API Specifications

## Base URL

```
/api/v1
```

## Response Format

```json
// Success
{
  "success": true,
  "data": { ... }
}

// Error
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

## Status Codes

- `200` - Success (GET, PUT)
- `201` - Created (POST)
- `204` - Deleted (DELETE)
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict

## Authentication

```
Authorization: Bearer <jwt_token>
```

## Endpoints

### Auth

```
POST   /auth/register
POST   /auth/login
POST   /auth/refresh
POST   /auth/logout
POST   /auth/verify-email/{token}
```

### Users

```
GET    /users/me
PUT    /users/me
DELETE /users/me
```

### Health Profile

```
GET    /users/{id}/health-profile
POST   /users/{id}/health-profile
PUT    /users/{id}/health-profile
DELETE /users/{id}/health-profile
```

## Validation Example

```python
from pydantic import BaseModel, EmailStr

class UserRegister(BaseModel):
    email: EmailStr
    username: str = Field(min_length=3, max_length=20)
    password: str = Field(min_length=8, pattern=r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])")
```

---

**See existing code**: `backend/index.py`
