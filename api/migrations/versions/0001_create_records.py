"""Create schema sync and table sync.records

Revision ID: 0001
Revises:
"""
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import JSONB

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("CREATE SCHEMA sync")
    op.create_table(
        "records",
        sa.Column("key", sa.Text, primary_key=True),
        sa.Column("value", JSONB, nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        schema="sync",
    )


def downgrade() -> None:
    op.drop_table("records", schema="sync")
    op.execute("DROP SCHEMA sync")
