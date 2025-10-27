"""add mental wellness logging tables

Revision ID: 007_add_mental_wellness_tables
Revises: 006_add_goals_table
Create Date: 2025-10-26 15:34:18.939825

"""

from collections.abc import Sequence
from typing import Union

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "007_add_mental_wellness_tables"
down_revision: Union[str, Sequence[str], None] = "006_add_goals_table"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Table names
MOOD_LOGS_TABLE = "mood_logs"
STRESS_LOGS_TABLE = "stress_logs"
SLEEP_LOGS_TABLE = "sleep_logs"

# Common column definitions
COMMON_COLUMNS = [
    sa.Column("id", sa.String(), nullable=False),
    sa.Column("user_id", sa.String(), nullable=False),
    sa.Column("log_date", sa.Date(), nullable=False),
]

TIMESTAMP_COLUMNS = [
    sa.Column("created_at", sa.DateTime(), nullable=False),
    sa.Column("updated_at", sa.DateTime(), nullable=False),
]


def _create_common_indexes(table_name: str) -> None:
    """Create common indexes for wellness logging tables."""
    op.create_index(f"ix_{table_name}_user_id", table_name, ["user_id"], unique=False)
    op.create_index(f"ix_{table_name}_log_date", table_name, ["log_date"], unique=False)
    op.create_index(
        f"ix_{table_name}_created_at", table_name, ["created_at"], unique=False
    )


def _drop_common_indexes(table_name: str) -> None:
    """Drop common indexes for wellness logging tables."""
    op.drop_index(f"ix_{table_name}_user_id", table_name=table_name)
    op.drop_index(f"ix_{table_name}_log_date", table_name=table_name)
    op.drop_index(f"ix_{table_name}_created_at", table_name=table_name)


def upgrade() -> None:
    """Create mental wellness logging tables with encryption support."""
    # Create mood logs table
    op.create_table(
        MOOD_LOGS_TABLE,
        *COMMON_COLUMNS,
        sa.Column("mood_score", sa.Numeric(precision=2, scale=0), nullable=False),
        sa.Column("encrypted_notes", sa.Text(), nullable=True),
        *TIMESTAMP_COLUMNS,
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    _create_common_indexes(MOOD_LOGS_TABLE)

    # Create sleep logs table
    op.create_table(
        SLEEP_LOGS_TABLE,
        *COMMON_COLUMNS,
        sa.Column("duration_hours", sa.Numeric(precision=4, scale=2), nullable=False),
        sa.Column("quality_score", sa.Numeric(precision=2, scale=0), nullable=False),
        sa.Column("encrypted_notes", sa.Text(), nullable=True),
        *TIMESTAMP_COLUMNS,
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    _create_common_indexes(SLEEP_LOGS_TABLE)

    # Create stress logs table
    op.create_table(
        STRESS_LOGS_TABLE,
        *COMMON_COLUMNS,
        sa.Column("stress_level", sa.Numeric(precision=2, scale=0), nullable=False),
        sa.Column("encrypted_triggers", sa.Text(), nullable=True),
        sa.Column("encrypted_notes", sa.Text(), nullable=True),
        *TIMESTAMP_COLUMNS,
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    _create_common_indexes(STRESS_LOGS_TABLE)


def downgrade() -> None:
    """Remove mental wellness logging tables and related indexes."""
    # Drop stress logs
    _drop_common_indexes(STRESS_LOGS_TABLE)
    op.drop_table(STRESS_LOGS_TABLE)

    # Drop sleep logs
    _drop_common_indexes(SLEEP_LOGS_TABLE)
    op.drop_table(SLEEP_LOGS_TABLE)

    # Drop mood logs
    _drop_common_indexes(MOOD_LOGS_TABLE)
    op.drop_table(MOOD_LOGS_TABLE)
