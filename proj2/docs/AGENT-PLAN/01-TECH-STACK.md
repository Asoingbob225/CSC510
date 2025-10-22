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
│       ├── routers/     # API endpoints (auth.py, users.py)
│       ├── services/    # Business logic (user_service.py)
│       ├── middleware/  # Middleware (rate_limit.py)
│       ├── models.py    # SQLAlchemy models
│       ├── schemas.py   # Pydantic schemas
│       ├── database.py  # Database configuration
│       ├── auth_util.py # Authentication utilities
│       ├── emailer.py   # Email service
│       └── index.py     # FastAPI app entry point
├── alembic/             # Database migrations
└── tests/               # Test files
```

---

**Need examples?** Check existing code:

- Frontend: `src/components/SignupField.tsx`, `src/pages/VerifyEmail.tsx`
- Backend: `src/eatsential/routers/auth.py`, `src/eatsential/services/user_service.py`
- Database: `src/eatsential/models.py`, `src/eatsential/schemas.py`
