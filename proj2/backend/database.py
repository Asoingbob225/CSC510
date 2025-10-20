"""
Database configuration and connection management.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./proj2.db")
DATABASE_NAME = os.getenv("DATABASE_NAME", "proj2.db")

# Create SQLAlchemy engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class for models
Base = declarative_base()


def get_db():
    """
    Dependency to get database session.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_database():
    """
    Create the database file and tables.
    """
    # Import models to ensure they are registered with Base
    import models  # noqa: F401

    # Create all tables defined in models
    Base.metadata.create_all(bind=engine)
    print(f"Database created successfully at: {DATABASE_NAME}")


def get_database_path():
    """
    Get the full path to the database file.
    """
    if DATABASE_URL.startswith("sqlite:///"):
        db_path = DATABASE_URL.replace("sqlite:///", "")
        return os.path.abspath(db_path)
    return DATABASE_URL
