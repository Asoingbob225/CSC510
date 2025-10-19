# Tech Stack

## Frontend

- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** for styling
- **React Hook Form** + **Zod** for forms
- **Vitest** for testing

## Backend

- **FastAPI** + **Python 3.9**
- **PostgreSQL** + **SQLAlchemy**
- **Alembic** for migrations
- **Pytest** for testing

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
│   ├── components/   # Reusable UI
│   ├── pages/       # Route pages
│   ├── hooks/       # Custom hooks
│   └── services/    # API calls
│
backend/
├── api/         # Endpoints
├── models/      # Database
├── services/    # Business logic
└── tests/       # Tests
```

---

**Need examples?** Check existing code:

- Frontend: `SignupField.tsx`
- Backend: `index.py`
