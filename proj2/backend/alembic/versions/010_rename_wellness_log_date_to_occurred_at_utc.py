"""010_rename_wellness_log_date_to_occurred_at_utc

Revision ID: 010_rename_wellness_log_date_to_occurred_at_utc
Revises: 009_add_user_timezone_field
Create Date: 2025-11-01 01:14:22.615385

"""

from collections.abc import Sequence
from typing import Union

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "010_rename_wellness_log_date_to_occurred_at_utc"
down_revision: Union[str, Sequence[str], None] = "009_add_user_timezone_field"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Rename log_date to occurred_at_utc in mood_logs
    with op.batch_alter_table("mood_logs", schema=None) as batch_op:
        batch_op.alter_column(
            "log_date",
            new_column_name="occurred_at_utc",
            existing_type=sa.DateTime(),
            existing_nullable=False,
        )

    # Rename log_date to occurred_at_utc in stress_logs
    with op.batch_alter_table("stress_logs", schema=None) as batch_op:
        batch_op.alter_column(
            "log_date",
            new_column_name="occurred_at_utc",
            existing_type=sa.DateTime(),
            existing_nullable=False,
        )

    # Rename log_date to occurred_at_utc in sleep_logs
    with op.batch_alter_table("sleep_logs", schema=None) as batch_op:
        batch_op.alter_column(
            "log_date",
            new_column_name="occurred_at_utc",
            existing_type=sa.DateTime(),
            existing_nullable=False,
        )


def downgrade() -> None:
    """Downgrade schema."""
    # Rename occurred_at_utc back to log_date in sleep_logs
    with op.batch_alter_table("sleep_logs", schema=None) as batch_op:
        batch_op.alter_column(
            "occurred_at_utc",
            new_column_name="log_date",
            existing_type=sa.DateTime(),
            existing_nullable=False,
        )

    # Rename occurred_at_utc back to log_date in stress_logs
    with op.batch_alter_table("stress_logs", schema=None) as batch_op:
        batch_op.alter_column(
            "occurred_at_utc",
            new_column_name="log_date",
            existing_type=sa.DateTime(),
            existing_nullable=False,
        )

    # Rename occurred_at_utc back to log_date in mood_logs
    with op.batch_alter_table("mood_logs", schema=None) as batch_op:
        batch_op.alter_column(
            "occurred_at_utc",
            new_column_name="log_date",
            existing_type=sa.DateTime(),
            existing_nullable=False,
        )
