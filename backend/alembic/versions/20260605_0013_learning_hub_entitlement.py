"""learning hub entitlement columns

Revision ID: 20260605_0013
Revises: 20260605_0012
Create Date: 2026-06-05

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "20260605_0013"
down_revision: Union[str, None] = "20260605_0012"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "payments",
        sa.Column("purpose", sa.String(40), nullable=False, server_default="program_fee"),
    )
    op.add_column(
        "leads",
        sa.Column("learning_hub_unlocked_at", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("leads", "learning_hub_unlocked_at")
    op.drop_column("payments", "purpose")
