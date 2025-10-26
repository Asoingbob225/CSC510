"""Add allergen audit log table

Revision ID: 004_add_allergen_audit_log_table
Revises: 003_add_user_role
Create Date: 2025-10-26 13:39:38.352581

"""

from collections.abc import Sequence
from typing import Union

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "004_add_allergen_audit_log_table"
down_revision: Union[str, Sequence[str], None] = "003_add_user_role"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema.

    Create allergen_audit_logs table for tracking all allergen changes.
    """
    op.create_table(
        "allergen_audit_logs",
        # Primary key
        sa.Column("id", sa.String(), nullable=False),
        # Allergen reference (nullable for bulk operations)
        sa.Column("allergen_id", sa.String(), nullable=True),
        sa.Column("allergen_name", sa.String(length=100), nullable=False),
        # Action tracking (create/update/delete/bulk_import)
        sa.Column("action", sa.String(length=20), nullable=False),
        # Admin user who performed the action
        sa.Column("admin_user_id", sa.String(), nullable=False),
        sa.Column("admin_username", sa.String(length=20), nullable=False),
        # Change details (JSON format)
        sa.Column("changes", sa.Text(), nullable=True),
        # Timestamp
        sa.Column("created_at", sa.DateTime(), nullable=False),
        # Foreign key to users table
        sa.ForeignKeyConstraint(["admin_user_id"], ["users.id"]),
        # Primary key constraint
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    """Downgrade schema: Drop allergen_audit_logs table."""
    op.drop_table("allergen_audit_logs")
