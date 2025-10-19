# Backend API

FastAPI backend application for the proj2 project.

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
alembic upgrade head
```

### 3. Run the Application

```bash
# Development server
uvicorn index:app --reload

# Or using python directly
python -m uvicorn index:app --reload
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, visit:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## Development

### Database Migrations

When you modify database models:

1. Create a migration:
   ```bash
   alembic revision --autogenerate -m "Description of changes"
   ```

2. Apply the migration:
   ```bash
   alembic upgrade head
   ```

### Testing

Run tests with:

```bash
pytest
```

### Code Quality

Format and lint code:

```bash
ruff check .
ruff format .
```

## Project Structure

```
backend/
├── alembic/                 # Database migrations
├── tests/                   # Test files
├── database.py             # Database configuration
├── models.py               # SQLAlchemy models
├── index.py                # FastAPI application
├── create_init_database.py # Database initialization
└── pyproject.toml          # Project dependencies
```

## Environment Variables

Copy `env.example` to `.env` and configure:

- `DATABASE_URL`: Database connection string
- `DATABASE_NAME`: Database file name
- `ENVIRONMENT`: Application environment (development/production)

## Documentation

- [Database Setup Guide](DATABASE_SETUP.md) - Detailed database configuration
- [API Documentation](http://localhost:8000/docs) - Interactive API docs (when running)
