#!/usr/bin/env python3
"""Development environment setup script.

This script sets up the complete development environment for the proj2 backend.
Run this script when setting up your development environment for the first time.

Usage:
    python setup_dev_environment.py
"""

import os
import subprocess
import sys


def run_command(command, description):
    """Run a command and handle errors."""
    print(f"[RUNNING] {description}...")
    try:
        result = subprocess.run(
            command, shell=True, check=True, capture_output=True, text=True
        )
        print(f"✅ {description} completed successfully!")
        if result.stdout:
            print(f"   Output: {result.stdout.strip()}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed!")
        print(f"   Error: {e.stderr.strip()}")
        return False


def main():
    """Main setup function."""
    print("🚀 Setting up proj2 backend development environment...")
    print("=" * 60)

    # Check if we're in the right directory
    if not os.path.exists("pyproject.toml"):
        print(
            "❌ Error: pyproject.toml not found. Please run this script from the backend directory."
        )
        sys.exit(1)

    # Step 1: Install dependencies
    print("\n📦 Step 1: Installing dependencies")
    if not run_command("uv sync", "Installing dependencies with uv"):
        print("   Trying with pip...")
        if not run_command("pip install -e .", "Installing dependencies with pip"):
            print(
                "❌ Failed to install dependencies. Please check your Python environment."
            )
            sys.exit(1)

    # Step 2: Set up environment file
    print("\n🔧 Step 2: Setting up environment configuration")
    if not os.path.exists(".env"):
        if os.path.exists("env.example"):
            run_command("cp env.example .env", "Copying environment configuration")
            print(
                "   ✅ Environment file created. You can edit .env to customize settings."
            )
        else:
            print("   ⚠️  No env.example found. Creating basic .env file...")
            with open(".env", "w") as f:
                f.write("DATABASE_URL=sqlite:///./app.db\n")
                f.write("DATABASE_NAME=app.db\n")
                f.write("ENVIRONMENT=development\n")
            print("   ✅ Basic environment file created.")
    else:
        print("   ✅ Environment file already exists.")

    # Step 3: Initialize database
    print("\n🗄️  Step 3: Setting up database")
    if not run_command("python create_init_database.py", "Creating initial database"):
        print("❌ Failed to create database. Please check the error messages above.")
        sys.exit(1)

    # Step 4: Apply migrations
    print("\n🔄 Step 4: Applying database migrations")
    if not run_command("alembic upgrade head", "Applying database migrations"):
        print("❌ Failed to apply migrations. Please check the error messages above.")
        sys.exit(1)

    # Step 5: Verify setup
    print("\n✅ Step 5: Verifying setup")
    if os.path.exists("app.db"):
        print("   ✅ Database file created successfully")
    else:
        print("   ❌ Database file not found")

    # Check migration status
    result = subprocess.run(
        "alembic current", shell=True, capture_output=True, text=True
    )
    if result.returncode == 0:
        print("   ✅ Database migrations applied successfully")
    else:
        print("   ❌ Migration status check failed")

    print("\n" + "=" * 60)
    print("🎉 Development environment setup completed!")
    print("\nNext steps:")
    print("1. Start the development server: uvicorn index:app --reload")
    print("2. Visit http://localhost:8000/docs to see the API documentation")
    print("3. Visit http://localhost:8000/api/users to test the database connection")
    print("\nFor more information, see:")
    print("- README.md - General project information")
    print("- DATABASE_SETUP.md - Detailed database setup guide")


if __name__ == "__main__":
    main()
