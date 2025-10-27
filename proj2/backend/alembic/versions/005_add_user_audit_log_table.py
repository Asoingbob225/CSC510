"""Add user audit log table

Revision ID: 005_add_user_audit_log_table
Revises: 004_add_allergen_audit_log_table
Create Date: 2025-10-26 14:05:16.141446

"""

from collections.abc import Sequence
from typing import Union

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "005_add_user_audit_log_table"
down_revision: Union[str, Sequence[str], None] = "004_add_allergen_audit_log_table"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema - Add user audit log table."""
    op.create_table(
        "user_audit_logs",
        # Primary key
        sa.Column("id", sa.String(), nullable=False),
        # Target user information (who was modified)
        sa.Column("target_user_id", sa.String(), nullable=False),
        sa.Column("target_username", sa.String(length=20), nullable=False),
        # Action details
        sa.Column("action", sa.String(length=20), nullable=False),
        # Admin user information (who made the change)
        sa.Column("admin_user_id", sa.String(), nullable=False),
        sa.Column("admin_username", sa.String(length=20), nullable=False),
        # Change details (JSON string)
        sa.Column("changes", sa.Text(), nullable=True),
        # Timestamp
        sa.Column("created_at", sa.DateTime(), nullable=False),
        # Constraints
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(
            ["admin_user_id"], ["users.id"], name="fk_user_audit_logs_admin_user_id"
        ),
    )


def downgrade() -> None:
    """Downgrade schema - Drop user audit log table."""
    op.drop_table("user_audit_logs")
