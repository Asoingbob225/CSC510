#!/usr/bin/env python3
"""Initial database setup script.

This script creates the initial SQLite database file and sets up the basic schema.
Run this script once when setting up your development environment.

Usage:
    python create_init_database.py
"""

import os
import sys
from pathlib import Path

# Add the current directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

from dotenv import load_dotenv

from src.eatsential.db.database import get_database_path


def main():
    """Initialize the database."""
    print("Initializing database...")

    # Load environment variables
    load_dotenv()

    # Get database path
    db_path = get_database_path()

    # Check if database already exists
    if os.path.exists(db_path):
        print(f"Database already exists at: {db_path}")
        response = input("Do you want to recreate it? (y/N): ").strip().lower()
        if response in ["y", "yes"]:
            os.remove(db_path)
            print("Existing database removed.")
        else:
            print("Keeping existing database.")
            print("\nNext steps:")
            print("1. Run 'alembic upgrade head' to apply any migrations")
            print("2. Start your FastAPI application")
            return

    try:
        # Create the database file (empty)
        # Tables will be created by Alembic migrations
        print(f"Creating database file at: {db_path}")

        # Create the directory if it doesn't exist
        os.makedirs(os.path.dirname(os.path.abspath(db_path)), exist_ok=True)

        # Create an empty database file
        import sqlite3

        conn = sqlite3.connect(db_path)
        conn.close()

        print("✅ Database file created successfully!")
        print(f"📁 Database location: {db_path}")
        print("\nNext steps:")
        print("1. Run 'alembic upgrade head' to apply any migrations")
        print("2. Start your FastAPI application")

    except Exception as e:
        print(f"❌ Error creating database: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
