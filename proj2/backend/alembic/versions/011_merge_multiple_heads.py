"""Merge multiple heads

Revision ID: 011_merge_multiple_heads
Revises: 005_add_user_audit_log_table, 010_rename_wellness_log_date_to_occurred_at_utc
Create Date: 2025-11-01 14:00:13.209882

"""

from collections.abc import Sequence
from typing import Union

# revision identifiers, used by Alembic.
revision: str = "011_merge_multiple_heads"
down_revision: Union[str, Sequence[str], None] = (
    "005_add_user_audit_log_table",
    "010_rename_wellness_log_date_to_occurred_at_utc",
)
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
