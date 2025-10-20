"""Initial user model migration

Revision ID: 001_initial
Create Date: 2025-10-19 10:00:00.000000
"""

import sqlalchemy as sa

from alembic import op


def upgrade() -> None:
    """Create initial database schema."""
    # Create users table
    op.create_table(
        "users",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("username", sa.String(length=20), nullable=False),
        sa.Column("password_hash", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("email_verified", sa.Boolean(), nullable=False, default=False),
        sa.Column("verification_token", sa.String(), nullable=True),
        sa.Column("verification_token_expires", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )

    # Create indexes
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)
    op.create_index(op.f("ix_users_username"), "users", ["username"], unique=True)


def downgrade() -> None:
    """Revert the initial database schema creation."""
    # Drop indexes
    op.drop_index(op.f("ix_users_username"), table_name="users")
    op.drop_index(op.f("ix_users_email"), table_name="users")

    # Drop users table
    op.drop_table("users")
