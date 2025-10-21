"""Database connection and session management."""

import os

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker


class Base(DeclarativeBase):
    """Base class for all database models."""

    pass


# Get database URL from environment variable, default to SQLite
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./eatsential.db",  # Default to SQLite database in current directory
)

# Create SQLAlchemy engine
# Note: check_same_thread=False is needed for SQLite
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
    if DATABASE_URL.startswith("sqlite")
    else {},
)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():  # type: ignore
    """Get database session

    Yields:
        Database session

    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_database_path() -> str:
    """Get the full path to the database file.

    Returns:
        Full path to the database file or the DATABASE_URL if not SQLite

    """
    if DATABASE_URL.startswith("sqlite:///"):
        db_path = DATABASE_URL.replace("sqlite:///", "")
        db_path = os.path.normpath(db_path)
        return os.path.abspath(db_path)
    return DATABASE_URL
