# Backend API

FastAPI backend application for the Eatsential project - a meal planning and dietary management system.

## Quick Start

### 1. Install Dependencies

```bash
# Using uv (recommended)
uv sync

# Or using pip
pip install -e .
```

### 2. Database Setup

Follow the detailed [Database Setup Guide](DATABASE_SETUP.md) for initial configuration.

Quick setup:

```bash
# Copy environment configuration
cp env.example .env

# Create initial database
python create_init_database.py

# Apply migrations
uv run alembic upgrade head
```

### 3. Run the Application

```bash
# Development server with hot reload
uv run uvicorn src.eatsential.index:app --reload

# Or using python directly
python -m uvicorn src.eatsential.index:app --reload
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, visit:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
- **Health Check**: `http://localhost:8000/api`

## Architecture

### Project Structure

```
backend/
├── alembic/                    # Database migrations
│   └── versions/               # Migration files
├── src/
│   └── eatsential/            # Main application package
│       ├── __init__.py
│       ├── index.py           # FastAPI app instance & configuration
│       ├── database.py        # Database connection & session management
│       ├── models.py          # SQLAlchemy ORM models
│       ├── schemas.py         # Pydantic models for request/response
│       ├── auth_util.py       # Authentication utilities
│       ├── emailer.py         # Email service (mock)
│       ├── emailer_ses.py     # AWS SES email service
│       ├── middleware/        # Custom middleware
│       │   ├── __init__.py
│       │   └── rate_limit.py  # Rate limiting middleware
│       ├── routers/           # API route handlers
│       │   ├── auth.py        # Authentication endpoints
│       │   └── users.py       # User resource endpoints
│       └── services/          # Business logic layer
│           ├── __init__.py
│           └── user_service.py # User-related business logic
├── tests/                     # Test files
│   ├── conftest.py           # Pytest fixtures & configuration
│   ├── test_auth.py          # Authentication tests
│   ├── test_verification.py  # Email verification tests
│   └── routers/
│       └── test_api.py       # API endpoint tests
├── pyproject.toml            # Project dependencies & metadata
├── pytest.ini                # Pytest configuration
├── ruff.toml                 # Ruff linter configuration
└── README.md                 # This file
```

### Architecture Layers

1. **Router Layer** (`routers/`)
   - Handle HTTP requests and responses
   - Input validation via Pydantic schemas
   - Delegate business logic to service layer

2. **Service Layer** (`services/`)
   - Business logic and workflows
   - Transaction management
   - Domain validations

3. **Data Layer** (`models.py`, `database.py`)
   - SQLAlchemy ORM models
   - Database connection management
   - Migration support via Alembic

4. **Middleware** (`middleware/`)
   - Rate limiting
   - CORS configuration
   - Request/response processing

### Current Features

- ✅ User registration with email verification
- ✅ Email verification system
- ✅ Rate limiting middleware
- ✅ CORS configuration
- ✅ UTC timezone support throughout application
- ✅ Comprehensive input validation
- ✅ Password hashing with Argon2
- ✅ PostgreSQL/SQLite support

## Development

### Database Migrations

When you modify database models:

1. Create a migration:

   ```bash
   uv run alembic revision --autogenerate -m "Description of changes"
   ```

2. Review the generated migration file in `alembic/versions/`

3. Apply the migration:

   ```bash
   uv run alembic upgrade head
   ```

4. To rollback a migration:
   ```bash
   uv run alembic downgrade -1
   ```

### Testing

Run all tests:

```bash
uv run pytest
```

Run tests with coverage:

```bash
uv run pytest --cov=src/eatsential --cov-report=html
```

Run specific test file:

```bash
uv run pytest tests/test_auth.py -v
```

### Code Quality

Format and lint code with Ruff:

```bash
# Check for issues
uv run ruff check .

# Auto-fix issues
uv run ruff check . --fix

# Format code
uv run ruff format .
```

## Environment Variables

Copy `env.example` to `.env` and configure:

- `DATABASE_URL`: Database connection string (default: `sqlite:///./eatsential.db`)
- `ENVIRONMENT`: Application environment (`development`/`production`)
- `AWS_ACCESS_KEY_ID`: AWS access key for SES (optional, for production email)
- `AWS_SECRET_ACCESS_KEY`: AWS secret key for SES (optional, for production email)
- `AWS_REGION`: AWS region for SES (optional, default: `us-east-1`)

Example `.env` file:

```env
DATABASE_URL=sqlite:///./eatsential.db
ENVIRONMENT=development
```

## API Endpoints

### Authentication (`/api/auth`)

- `POST /api/auth/register` - Register a new user
- `GET /api/auth/verify-email/{token}` - Verify user email
- `POST /api/auth/resend-verification` - Resend verification email

### Users (`/users`)

- Future: User profile management endpoints

### Health Check

- `GET /api` - Server health check

## Models

### UserDB

Main user model with the following fields:

- `id`: Unique user identifier (UUID)
- `email`: User email (unique, lowercase)
- `username`: Username (unique, 3-20 characters)
- `password_hash`: Hashed password (Argon2)
- `created_at`: Account creation timestamp (UTC)
- `updated_at`: Last update timestamp (UTC)
- `account_status`: Account status (pending/verified/suspended)
- `email_verified`: Email verification status
- `verification_token`: Email verification token
- `verification_token_expires`: Token expiration time (UTC)

## Design Decisions

### UTC Time

All datetime values use UTC timezone throughout the application:

- Database stores naive UTC datetimes
- Application logic uses `datetime.now(timezone.utc)`
- Ensures consistency across different deployment environments

### Email Service

Two implementations available:

- `emailer.py`: Mock email service for development
- `emailer_ses.py`: AWS SES integration for production

Configure via environment variables.

### Rate Limiting

Custom middleware provides basic rate limiting:

- Prevents abuse and DoS attacks
- Configurable per-endpoint limits
- In-memory storage (consider Redis for production)

### Password Security

- Argon2 hashing algorithm (PHC winner)
- Strong password requirements enforced
- No plain text password storage

## Testing Strategy

- **Unit tests**: Service layer business logic
- **Integration tests**: API endpoints with test database
- **Fixtures**: Shared test setup in `conftest.py`
- **Coverage**: Aim for >80% code coverage

## Documentation

- [Database Setup Guide](DATABASE_SETUP.md) - Detailed database configuration
- [API Documentation](http://localhost:8000/docs) - Interactive API docs (when running)

## Contributing

1. Create a feature branch
2. Make your changes
3. Ensure tests pass: `uv run pytest`
4. Ensure code quality: `uv run ruff check . && uv run ruff format .`
5. Submit a pull request

## Troubleshooting

### Database Issues

If you encounter database errors:

```bash
# Reset database (WARNING: deletes all data)
rm eatsential.db
python create_init_database.py
uv run alembic upgrade head
```

### Import Errors

Ensure the package is installed in development mode:

```bash
uv sync
# or
pip install -e .
```

### Port Already in Use

Change the port when running:

```bash
uv run uvicorn src.eatsential.index:app --reload --port 8001
```
