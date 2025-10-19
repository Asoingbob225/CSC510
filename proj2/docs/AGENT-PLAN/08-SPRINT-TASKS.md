# Sprint Tasks

**Current Sprint**: Sprint 1 (Oct 19-26, 2025)  
**Theme**: Authentication & Health Profile Foundation

---

## 🚨 Critical Issues (Fix First)

| Issue | Description | Task ID |
|-------|-------------|---------|
| [#41](https://github.com/Asoingbob225/CSC510/issues/41) | Password validation doesn't match FR-001 | FE-S1-001 |
| [#42](https://github.com/Asoingbob225/CSC510/issues/42) | Email verification flow missing | BE-S1-002 |
| [#43](https://github.com/Asoingbob225/CSC510/issues/43) | User registration API missing | BE-S1-001 |

---

## Frontend Tasks

### FE-S1-001: Fix Password Validation ⚠️
**Status**: 🔴 Not Started  
**Estimate**: 2 hours  
**Dependencies**: None

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
**Status**: 🔴 Not Started  
**Estimate**: 4 hours  
**Dependencies**: BE-S1-002

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

**Critical Requirements**:
```typescript
// Allergen severity levels
enum AllergySeverity {
  MILD = "MILD",
  MODERATE = "MODERATE", 
  SEVERE = "SEVERE",
  LIFE_THREATENING = "LIFE_THREATENING"
}

// Visual warnings based on severity
const severityStyles = {
  MILD: "bg-yellow-100 border-yellow-500",
  MODERATE: "bg-orange-100 border-orange-500",
  SEVERE: "bg-red-100 border-red-500",
  LIFE_THREATENING: "bg-red-600 text-white animate-pulse"
};
```

---

## Backend Tasks

### BE-S1-001: User Registration API ⚠️
**Status**: 🔴 Not Started  
**Estimate**: 4 hours  
**Dependencies**: BE-S1-004

**Files to Create**:
1. `backend/api/auth.py`
2. `backend/models/user.py`
3. `backend/schemas/user.py`
4. `backend/services/auth.py`

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
**Status**: 🔴 Not Started  
**Estimate**: 6 hours  
**Dependencies**: BE-S1-001

**Files to Create**:
1. `backend/services/email.py`
2. `backend/utils/tokens.py`

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
1. `backend/api/health.py`
2. `backend/models/health.py`
3. `backend/schemas/health.py`
4. `backend/services/health.py`

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
**Status**: 🔴 Not Started  
**Estimate**: 4 hours  
**Dependencies**: None

**Files to Create**:
1. `backend/alembic.ini`
2. `backend/alembic/env.py`
3. `backend/core/database.py`

**Initial Migration**:
```bash
# Commands to run
alembic init alembic
alembic revision --autogenerate -m "Initial tables"
alembic upgrade head
```

---

## Task Assignment

| Developer | Focus Area | Tasks |
|-----------|-----------|-------|
| Dev 1 | Frontend Auth | FE-S1-001, FE-S1-002 |
| Dev 2 | Backend Auth | BE-S1-001, BE-S1-002 |
| Dev 3 | Health Profile | FE-S1-003, BE-S1-003 |
| Dev 4 | Infrastructure | BE-S1-004 |

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

| Metric | Target | Current |
|--------|--------|---------|
| Tasks Completed | 8 | 0 |
| Test Coverage | 80% | 0% |
| PR Cycle Time | <4 hours | N/A |
| Critical Bugs | 0 | 3 |

---

**Remember**: Update task status as you work!
