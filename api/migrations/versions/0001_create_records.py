"""create schema sync and table sync.records"""
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("CREATE SCHEMA sync")
    op.create_table(
        "records",
        sa.Column("key", sa.Text(), primary_key=True),
        sa.Column("value", postgresql.JSONB(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        schema="sync",
    )


def downgrade() -> None:
    op.drop_table("records", schema="sync")
    op.execute("DROP SCHEMA sync")
