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

- [x] Password requires 8+ characters
- [x] Password requires uppercase, lowercase, number, special char
- [x] Error messages are clear
- [x] All tests pass

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

**Status**: ⚡ In Progress (See sub-issues: [#61], [#62])

**Estimate**: 8 hours

**Dependencies**: BE-S1-003

**Sub-issues**:

- [#61] Define Health Profile Data Fields and Validation

- [#62] Implement Multi-Step Health Profile Wizard UI

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

**Status**: ✅ Complete
**Estimate**: 8 hours  
**Dependencies**: BE-S1-001

**Files Created**:

1. `backend/src/eatsential/routers/health.py`
2. `backend/src/eatsential/models/models.py` (extended with health models)
3. `backend/src/eatsential/schemas/schemas.py` (added health schemas)
4. `backend/src/eatsential/services/health_service.py`
5. `backend/tests/health/test_profile.py`
6. `backend/tests/health/test_allergies.py`
7. `backend/tests/health/test_dietary_preferences.py`

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
- BE-S1-003: Health Profile CRUD
- BE-S1-004: Database Setup

### Remaining Tasks 🔴

- FE-S1-003: Health Profile Form

### Sprint Progress: 75% Complete (6/8 tasks)

## Task Assignment

| Developer | Focus Area     | Tasks                | Status         |
| --------- | -------------- | -------------------- | -------------- |
| Dev 1     | Frontend Auth  | FE-S1-001, FE-S1-002 | ✅ Complete    |
| Dev 2     | Backend Auth   | BE-S1-001, BE-S1-002 | ✅ Complete    |
| Dev 3     | Health Profile | FE-S1-003, BE-S1-003 | ✅ Complete    |
| Dev 4     | Infrastructure | BE-S1-004            | ✅ Complete    |

---

## Definition of Done

### For ALL Tasks:

- [x] Code implements requirements
- [x] Unit tests written (88% coverage)
- [x] Integration tests pass
- [x] No linting errors
- [x] Documentation updated
- [x] PR approved by reviewer

### For Health-Related Tasks:

- [x] Allergen validation tested
- [x] Safety warnings prominent
- [x] Audit logging implemented
- [x] Error states handled

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
| Tasks Completed | 8        | 6       |
| Test Coverage   | 80%      | 88%     |
| PR Cycle Time   | <4 hours | 2 hours |
| Critical Bugs   | 0        | 0       |

---