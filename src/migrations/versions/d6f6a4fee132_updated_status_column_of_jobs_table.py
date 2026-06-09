"""Updated  status column of jobs table

Revision ID: d6f6a4fee132
Revises: a9919c48bc63
Create Date: 2026-05-25 14:18:29.918360

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd6f6a4fee132'
down_revision: Union[str, Sequence[str], None] = 'a9919c48bc63'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
# ensure no NULLs
    op.execute("UPDATE jobs SET status = true WHERE status IS NULL;")
    # set DB default to true
    op.alter_column(
    "jobs",
    "status",
    existing_type=sa.Boolean(),
    nullable=False,
    server_default=sa.text("true"),
    )

def downgrade() -> None:
# remove DB default (or set to false if you prefer)
    op.alter_column(
    "jobs",
    "status",
    existing_type=sa.Boolean(),
    nullable=False,
    server_default=None,
    )