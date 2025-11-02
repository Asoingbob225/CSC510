"""009_add_user_timezone_field

Revision ID: 009_add_user_timezone_field
Revises: 008_add_restaurant_and_menu_items_tables
Create Date: 2025-11-01 01:13:58.048039

"""

from collections.abc import Sequence
from typing import Union

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "009_add_user_timezone_field"
down_revision: Union[str, Sequence[str], None] = (
    "008_add_restaurant_and_menu_items_tables"
)
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add timezone column to users table with default value
    with op.batch_alter_table("users", schema=None) as batch_op:
        batch_op.add_column(
            sa.Column(
                "timezone",
                sa.String(length=50),
                nullable=False,
                server_default="America/New_York",
            )
        )


def downgrade() -> None:
    """Downgrade schema."""
    # Remove timezone column from users table
    with op.batch_alter_table("users", schema=None) as batch_op:
        batch_op.drop_column("timezone")
