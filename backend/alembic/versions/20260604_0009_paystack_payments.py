"""payments paystack fields

Revision ID: 20260604_0009
Revises: 20260604_0008
Create Date: 2026-06-04

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "20260604_0009"
down_revision: Union[str, None] = "20260604_0008"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "payments",
        sa.Column("provider", sa.String(20), nullable=False, server_default="paystack"),
    )
    op.add_column("payments", sa.Column("email", sa.String(320), nullable=True))
    op.alter_column("payments", "phone_number", existing_type=sa.String(20), nullable=True)


def downgrade() -> None:
    op.alter_column("payments", "phone_number", existing_type=sa.String(20), nullable=False)
    op.drop_column("payments", "email")
    op.drop_column("payments", "provider")
