"""Update job.experience data type: varchar -> integer

Revision ID: f86724c7eb47
Revises: d6f6a4fee132
Create Date: 2026-05-27 16:58:51.042907

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f86724c7eb47'
down_revision: Union[str, Sequence[str], None] = 'd6f6a4fee132'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema: cast varchar->integer using explicit USING clause."""
    # Perform an explicit SQL ALTER using PostgreSQL's USING cast
    op.execute(
        "ALTER TABLE jobs ALTER COLUMN experience TYPE integer USING (experience::integer)"
    )
    # Also update Alembic/SQLAlchemy metadata for consistency
    op.alter_column(
        "jobs",
        "experience",
        existing_type=sa.VARCHAR(length=10),
        type_=sa.Integer(),
        existing_nullable=False,
    )


def downgrade() -> None:
    """Downgrade schema: cast integer->varchar using explicit USING clause."""
    op.execute(
        "ALTER TABLE jobs ALTER COLUMN experience TYPE varchar(10) USING (experience::varchar)"
    )
    op.alter_column(
        "jobs",
        "experience",
        existing_type=sa.Integer(),
        type_=sa.VARCHAR(length=10),
        existing_nullable=False,
    )
