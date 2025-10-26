# API Changelog

**Project**: Eatsential MVP  
**Purpose**: Track API changes, versions, and breaking changes  
**Version Control**: Semantic Versioning (SemVer)

---

## Versioning Strategy

We follow [Semantic Versioning](https://semver.org/):
- **MAJOR** version: Incompatible API changes
- **MINOR** version: Add functionality (backwards compatible)
- **PATCH** version: Bug fixes (backwards compatible)

Format: `v{MAJOR}.{MINOR}.{PATCH}`

---

## Current Version

**v0.1.0** (October 2025) - MVP Release

---

## Version History

### v0.1.0 (October 2025) - Initial MVP Release

**Status**: Current  
**Release Date**: October 2025  
**Breaking Changes**: None (initial release)

#### New Endpoints

**Authentication (5 endpoints)**

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | User registration | ✅ Implemented |
| GET | `/api/auth/verify-email/{token}` | Email verification | ✅ Implemented |
| POST | `/api/auth/resend-verification` | Resend verification email | ✅ Implemented |
| POST | `/api/auth/login` | User login (JWT) | ✅ Implemented |
| GET | `/api/users/me` | Get current user profile | ✅ Implemented |

**Health Profiles (4 endpoints)**

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| POST | `/api/health-profiles` | Create health profile | ✅ Implemented |
| GET | `/api/health-profiles/me` | Get current user's profile | ✅ Implemented |
| PUT | `/api/health-profiles/{id}` | Update health profile | ✅ Implemented |
| DELETE | `/api/health-profiles/{id}` | Delete health profile | ✅ Implemented |

**Allergy Management (3 endpoints)**

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| POST | `/api/allergies/user` | Add user allergy | ✅ Implemented |
| GET | `/api/allergies/user/me` | Get user's allergies | ✅ Implemented |
| DELETE | `/api/allergies/user/{id}` | Delete user allergy | ✅ Implemented |

**Dietary Preferences (3 endpoints)**

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| POST | `/api/dietary-preferences` | Add dietary preference | ✅ Implemented |
| GET | `/api/dietary-preferences/me` | Get user's preferences | ✅ Implemented |
| DELETE | `/api/dietary-preferences/{id}` | Delete preference | ✅ Implemented |

**System Health (2 endpoints)**

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| GET | `/` | Root endpoint (welcome message) | ✅ Implemented |
| GET | `/health` | Health check | ✅ Implemented |

#### Authentication

- JWT token-based authentication (HS256 algorithm)
- Bearer token in `Authorization` header
- Email verification required before login
- Password hashing with bcrypt (12 rounds)

#### Request/Response Format

- Content-Type: `application/json`
- Character encoding: UTF-8
- Date format: ISO 8601 (`YYYY-MM-DDTHH:MM:SS.sssZ`)
- UUID format: Standard UUID v4

#### Error Responses

Standard HTTP status codes:
- `200`: Success
- `201`: Created
- `204`: No Content
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `422`: Validation Error
- `500`: Internal Server Error

#### Security

- CORS enabled for specified origins
- Password complexity requirements enforced
- SQL injection prevention via ORM
- Input validation with Pydantic

---

## Planned Changes

### v0.2.0 (Planned - Next Sprint)

**New Features**:
- Password reset flow (`POST /api/auth/forgot-password`, `POST /api/auth/reset-password`)
- User profile update (`PUT /api/users/me`)
- Profile picture upload (`POST /api/users/me/avatar`)
- Update dietary preferences (`PUT /api/dietary-preferences/{id}`)

**Enhancements**:
- Rate limiting on authentication endpoints
- Refresh token support
- Account lockout after failed login attempts

### v0.3.0 (Planned - Future Sprint)

**AI Features**:
- Meal recommendations (`POST /api/recommendations/meals`)
- Restaurant search (`GET /api/restaurants/search`)
- AI nutritionist chat (`POST /api/chat/nutrition`)

**Breaking Changes**:
- None planned

---

## Breaking Changes Log

### v0.1.0 → Future

No breaking changes planned. We will maintain backward compatibility through v0.x.x series.

---

## Deprecation Schedule

No deprecated endpoints currently.

**Deprecation Policy**:
- Endpoints will be marked deprecated 3 months before removal
- Deprecated endpoints will return `Deprecation` header
- Migration guide provided for all deprecated features

---

## Migration Guides

### Future Migrations

Migration guides will be provided here when breaking changes occur.

---

## API Documentation

**Interactive API Docs**: `http://localhost:8000/docs` (Swagger UI)  
**Alternative Docs**: `http://localhost:8000/redoc` (ReDoc)  
**OpenAPI Spec**: `http://localhost:8000/openapi.json`

---

## Related Documents

- [API Design](../2-DESIGN/api-design.md) - Detailed API specifications
- [Functional Requirements](../1-REQUIREMENTS/functional-requirements.md) - Feature requirements
- [Implementation Status](./implementation-status.md) - Current implementation details

---

**Last Updated**: October 2025  
**Maintained By**: Backend Development Team
