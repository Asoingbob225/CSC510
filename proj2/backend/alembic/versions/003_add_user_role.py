"""Add role column to users table

Revision ID: 003_add_user_role
Revises: 002_health_profile
Create Date: 2025-10-24 00:00:00.000000
"""

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "003_add_user_role"
down_revision = "002_health_profile"
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add role column to users table."""
    # Add role column with default value 'user'
    op.add_column(
        "users",
        sa.Column(
            "role",
            sa.String(),
            nullable=False,
            server_default="user",
        ),
    )

    # Create index on role column for better query performance
    op.create_index(
        op.f("ix_users_role"),
        "users",
        ["role"],
        unique=False,
    )


def downgrade() -> None:
    """Remove role column from users table."""
    # Drop index first
    op.drop_index(op.f("ix_users_role"), table_name="users")

    # Drop role column
    op.drop_column("users", "role")
