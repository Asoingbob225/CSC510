"""Database connection and session management."""

import os

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session, sessionmaker

Base = declarative_base()

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


def get_db() -> Session:  # type: ignore
    """Get database session

    Yields:
        Database session

    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
