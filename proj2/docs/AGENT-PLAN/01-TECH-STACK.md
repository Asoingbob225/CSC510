# Tech Stack

## Frontend

- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** for styling
- **React Hook Form** + **Zod** for forms
- **Vitest** for testing

## Backend

- **FastAPI** + **Python 3.11+**
- **PostgreSQL** (production) / **SQLite** (development)
- **SQLAlchemy 2.0** ORM
- **Alembic** for migrations
- **Pytest** + **pytest-asyncio** for testing
- **passlib[bcrypt]** for password hashing
- **python-jose** for JWT tokens

## Key Libraries

### Frontend

```json
{
  "react": "^18.3.1",
  "react-hook-form": "^7.53.2",
  "zod": "^3.23.8",
  "@radix-ui/react-*": "UI components"
}
```

### Backend

```toml
[project.dependencies]
fastapi = "^0.115.4"
sqlalchemy = "^2.0.36"
pydantic = "^2.10.2"
bcrypt = "^4.2.0"
```

## File Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/          # Base UI components (button, input, etc.)
│   │   └── *.tsx        # Feature components (SignupField, etc.)
│   ├── pages/           # Route pages (Welcome, Signup, VerifyEmail, Dashboard)
│   ├── lib/             # Utilities (utils.ts)
│   └── assets/          # Images and static files
│
backend/
├── src/
│   └── eatsential/
│       ├── __init__.py
│       ├── index.py
│       ├── db/
│       │   └── database.py
│       ├── core/
│       │   ├── __init__.py
│       │   ├── config.py
│       │   └── dependencies.py
│       ├── models/
│       │   └── models.py
│       ├── schemas/
│       │   └── schemas.py
│       ├── services/
│       │   ├── __init__.py
│       │   ├── auth_service.py
│       │   ├── user_service.py
│       │   ├── emailer.py
│       │   └── emailer_ses.py
│       ├── utils/
│       │   └── auth_util.py
│       ├── middleware/
│       │   └── ... (existing middleware files)
│       └── routers/
│           └── ... (existing router files)
├── alembic/             # Database migrations
└── tests/               # Test files
```

---

**Need examples?** Check existing code:

- Frontend: `src/components/SignupField.tsx`, `src/pages/VerifyEmail.tsx`
- Backend: `src/eatsential/routers/auth.py`, `src/eatsential/services/user_service.py`
- Database: `src/eatsential/models.py`, `src/eatsential/schemas.py`
