"""Add goals table for goal tracking

Revision ID: 006_add_goals_table
Revises: 004_add_meal_tables
Create Date: 2025-10-26 14:24:02.345619

"""

from collections.abc import Sequence
from typing import Union

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "006_add_goals_table"
down_revision: Union[str, Sequence[str], None] = "004_add_meal_tables"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Table and index names
TABLE_NAME = "goals"
INDEX_USER_ID = "ix_goals_user_id"
INDEX_GOAL_TYPE = "ix_goals_goal_type"
INDEX_STATUS = "ix_goals_status"
INDEX_START_DATE = "ix_goals_start_date"


def upgrade() -> None:
    """Create goals table for tracking user wellness and nutrition goals."""
    # Create goals table
    op.create_table(
        TABLE_NAME,
        # Primary key
        sa.Column("id", sa.String(), nullable=False),
        # Foreign key to users
        sa.Column("user_id", sa.String(), nullable=False),
        # Goal metadata
        sa.Column("goal_type", sa.String(length=50), nullable=False),
        sa.Column("target_type", sa.String(length=100), nullable=False),
        sa.Column("target_value", sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column("current_value", sa.Numeric(precision=10, scale=2), nullable=False),
        # Date range
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("end_date", sa.Date(), nullable=False),
        # Status tracking
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        # Timestamps
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        # Constraints
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    # Create indexes for query optimization
    op.create_index(INDEX_USER_ID, TABLE_NAME, ["user_id"], unique=False)
    op.create_index(INDEX_GOAL_TYPE, TABLE_NAME, ["goal_type"], unique=False)
    op.create_index(INDEX_STATUS, TABLE_NAME, ["status"], unique=False)
    op.create_index(INDEX_START_DATE, TABLE_NAME, ["start_date"], unique=False)


def downgrade() -> None:
    """Remove goals table and related indexes."""
    # Drop indexes first
    op.drop_index(INDEX_USER_ID, table_name=TABLE_NAME)
    op.drop_index(INDEX_STATUS, table_name=TABLE_NAME)
    op.drop_index(INDEX_START_DATE, table_name=TABLE_NAME)
    op.drop_index(INDEX_GOAL_TYPE, table_name=TABLE_NAME)

    # Drop table
    op.drop_table(TABLE_NAME)
