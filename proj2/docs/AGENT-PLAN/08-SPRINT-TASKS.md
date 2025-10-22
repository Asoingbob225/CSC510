# Sprint Tasks

**Current Sprint**: Sprint 1 (Oct 19-26, 2025)  
**Theme**: Authentication & Health Profile Foundation

---

## 🚨 Critical Issues (Resolved)

| Issue                                                   | Description                              | Task ID   | Status   |
| ------------------------------------------------------- | ---------------------------------------- | --------- | -------- |
| [#41](https://github.com/Asoingbob225/CSC510/issues/41) | Password validation doesn't match FR-001 | FE-S1-001 | ✅ Fixed |
| [#42](https://github.com/Asoingbob225/CSC510/issues/42) | Email verification flow missing          | BE-S1-002 | ✅ Fixed |
| [#43](https://github.com/Asoingbob225/CSC510/issues/43) | User registration API missing            | BE-S1-001 | ✅ Fixed |

---

## Frontend Tasks

### FE-S1-001: Fix Password Validation ⚠️

**Status**: ✅ Complete  
**Estimate**: 2 hours  
**Dependencies**: None  
**Completion**: Implemented in SignupField.tsx and schemas.py

```typescript
// Required Changes in SignupField.tsx
password: z
  .string()
  .min(8, { message: 'Password must be at least 8 characters' })
  .max(48, { message: 'Password must be at most 48 characters' })
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    { message: 'Password must contain uppercase, lowercase, number and special character' }
  ),
```

**Acceptance Criteria**:

- [ ] Password requires 8+ characters
- [ ] Password requires uppercase, lowercase, number, special char
- [ ] Error messages are clear
- [ ] All tests pass

---

### FE-S1-002: Email Verification UI

**Status**: ✅ Complete  
**Estimate**: 4 hours  
**Dependencies**: BE-S1-002  
**Completion**: Implemented in VerifyEmail.tsx

**Files to Create**:

1. `frontend/src/pages/EmailVerification.tsx`
2. `frontend/src/pages/VerificationSuccess.tsx`
3. `frontend/src/components/ResendEmail.tsx`

**Key Features**:

- Show pending verification message
- Resend email button (rate limited)
- Success page after verification
- Handle expired tokens

---

### FE-S1-003: Health Profile Form 🏥

**Status**: 🔴 Not Started  
**Estimate**: 8 hours  
**Dependencies**: BE-S1-003

**Files to Create**:

1. `frontend/src/pages/HealthProfile.tsx`
2. `frontend/src/components/AllergyInput.tsx`
3. `frontend/src/components/AllergySeverityWarning.tsx`
4. `frontend/src/lib/api.ts` (extend with health profile endpoints)

**Critical Requirements**:

```typescript
// Allergen severity levels
enum AllergySeverity {
  MILD = 'MILD',
  MODERATE = 'MODERATE',
  SEVERE = 'SEVERE',
  LIFE_THREATENING = 'LIFE_THREATENING',
}

// Visual warnings based on severity
const severityStyles = {
  MILD: 'bg-yellow-100 border-yellow-500',
  MODERATE: 'bg-orange-100 border-orange-500',
  SEVERE: 'bg-red-100 border-red-500',
  LIFE_THREATENING: 'bg-red-600 text-white animate-pulse',
};
```

---

## Backend Tasks

### BE-S1-001: User Registration API ⚠️

**Status**: ✅ Complete  
**Estimate**: 4 hours  
**Completion**: Implemented in auth.py with /auth/register endpoint  
**Dependencies**: BE-S1-004

**Files Created**:

1. `backend/src/eatsential/routers/auth.py`
2. `backend/src/eatsential/models.py`
3. `backend/src/eatsential/schemas.py`
4. `backend/src/eatsential/services/auth_service.py`

**Endpoint Specification**:

```python
@router.post("/auth/register", response_model=UserResponse, status_code=201)
async def register(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    # Validate email uniqueness
    # Hash password with bcrypt
    # Create user with email_verified=False
    # Send verification email
    # Return user data (no password)
```

---

### BE-S1-002: Email Verification System

**Status**: ✅ Complete  
**Estimate**: 6 hours  
**Completion**: Implemented with verify-email endpoint and email service  
**Dependencies**: BE-S1-001

**Files Created**:

1. `backend/src/eatsential/emailer.py` (SMTP)
2. `backend/src/eatsential/emailer_ses.py` (AWS SES)
3. `backend/src/eatsential/auth_util.py` (token handling)

**Key Features**:

```python
# Token generation
def generate_verification_token() -> str:
    return secrets.token_urlsafe(32)

# Email template
def send_verification_email(email: str, token: str):
    link = f"{FRONTEND_URL}/verify-email?token={token}"
    # Send email with link
```

---

### BE-S1-003: Health Profile CRUD 🏥

**Status**: 🔴 Not Started  
**Estimate**: 8 hours  
**Dependencies**: BE-S1-001

**Files to Create**:

1. `backend/src/eatsential/routers/health.py`
2. `backend/src/eatsential/models.py` (extend with health models)
3. `backend/src/eatsential/schemas.py` (add health schemas)
4. `backend/src/eatsential/services/health_service.py`

**Critical Validation**:

```python
APPROVED_ALLERGENS = [
    "Peanuts", "Tree Nuts", "Milk", "Eggs",
    "Wheat", "Soy", "Fish", "Shellfish",
    "Sesame", "Mustard", "Celery", "Lupin"
]

def validate_allergen(name: str) -> bool:
    if name not in APPROVED_ALLERGENS:
        raise ValueError(f"'{name}' is not a recognized allergen")
    return True
```

---

### BE-S1-004: Database Setup

**Status**: ✅ Complete  
**Estimate**: 4 hours  
**Dependencies**: None  
**Completion**: Database configuration and migrations are set up

**Files Created**:

1. `backend/alembic.ini` ✓
2. `backend/alembic/env.py` ✓
3. `backend/src/eatsential/database.py` ✓

**Initial Migration**:

```bash
# Already completed
# Users table created with proper schema
# SQLite for development, PostgreSQL for production
```

---

## Sprint Summary

### Completed Tasks ✅

- FE-S1-001: Password Validation Fixed
- FE-S1-002: Email Verification UI
- BE-S1-001: User Registration API
- BE-S1-002: Email Verification System
- BE-S1-004: Database Setup

### Remaining Tasks 🔴

- FE-S1-003: Health Profile Form
- BE-S1-003: Health Profile CRUD

### Sprint Progress: 50% Complete (4/8 tasks)

## Task Assignment

| Developer | Focus Area     | Tasks                | Status         |
| --------- | -------------- | -------------------- | -------------- |
| Dev 1     | Frontend Auth  | FE-S1-001, FE-S1-002 | ✅ Complete    |
| Dev 2     | Backend Auth   | BE-S1-001, BE-S1-002 | ✅ Complete    |
| Dev 3     | Health Profile | FE-S1-003, BE-S1-003 | 🔴 In Progress |
| Dev 4     | Infrastructure | BE-S1-004            | ✅ Complete    |

---

## Definition of Done

### For ALL Tasks:

- [ ] Code implements requirements
- [ ] Unit tests written (80% coverage)
- [ ] Integration tests pass
- [ ] No linting errors
- [ ] Documentation updated
- [ ] PR approved by reviewer

### For Health-Related Tasks:

- [ ] Allergen validation tested
- [ ] Safety warnings prominent
- [ ] Audit logging implemented
- [ ] Error states handled

---

## Daily Standup Template

```markdown
**Date**: [DATE]
**Developer**: [NAME]

**Yesterday**:

- Completed [TASK-ID]: [description]

**Today**:

- Working on [TASK-ID]: [description]
- Blocked by: [blocker or "None"]

**Help Needed**:

- [Specific help needed or "None"]
```

---

## Sprint Metrics

| Metric          | Target   | Current |
| --------------- | -------- | ------- |
| Tasks Completed | 8        | 4       |
| Test Coverage   | 80%      | 75%     |
| PR Cycle Time   | <4 hours | 2 hours |
| Critical Bugs   | 0        | 0       |

---

## Current Code Structure

The implementation follows this structure:

```
backend/
└── src/
    └── eatsential/
        ├── __init__.py
        ├── index.py           # FastAPI app with CORS and rate limiting
        ├── database.py        # SQLAlchemy setup (SQLite/PostgreSQL)
        ├── models.py          # User model with SQLAlchemy
        ├── schemas.py         # Pydantic schemas with validation
        ├── auth_util.py       # JWT token and password handling
        ├── emailer.py         # SMTP email service
        ├── emailer_ses.py     # AWS SES email service
        ├── middleware/
        │   ├── jwt_auth.py    # JWT authentication middleware
        │   └── rate_limit.py  # Rate limiting middleware
        ├── routers/
        │   ├── auth.py        # /api/register, /api/verify-email
        │   └── users.py       # User endpoints
        └── services/
            ├── auth_service.py # Authentication business logic
            └── user_service.py # User management logic

frontend/
└── src/
    ├── components/
    │   ├── SignupField.tsx    # Signup form with Zod validation
    │   ├── LoginField.tsx     # Login form
    │   └── ui/                # Shadcn/ui components
    ├── pages/
    │   ├── Signup.tsx         # Signup page
    │   ├── Login.tsx          # Login page
    │   ├── VerifyEmail.tsx    # Email verification page
    │   └── Dashboard.tsx      # Post-login dashboard
    └── lib/
        └── api.ts             # API client with axios
```

---

**Remember**: Update task status as you work!
