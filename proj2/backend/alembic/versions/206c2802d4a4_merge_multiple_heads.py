"""Merge multiple heads

Revision ID: 206c2802d4a4
Revises: 005_add_user_audit_log_table, 008_add_restaurant_and_menu_items_tables
Create Date: 2025-11-01 14:00:13.209882

"""

from collections.abc import Sequence
from typing import Union

# revision identifiers, used by Alembic.
revision: str = "206c2802d4a4"
down_revision: Union[str, Sequence[str], None] = (
    "005_add_user_audit_log_table",
    "008_add_restaurant_and_menu_items_tables",
)
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
