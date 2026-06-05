"""lead notification prefs

Revision ID: 20260605_0010
Revises: 20260604_0009
Create Date: 2026-06-05

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "20260605_0010"
down_revision: Union[str, None] = "20260604_0009"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "leads",
        sa.Column("notify_deadlines", sa.Boolean(), nullable=False, server_default=sa.text("true")),
    )
    op.add_column(
        "leads",
        sa.Column("notify_documents", sa.Boolean(), nullable=False, server_default=sa.text("true")),
    )
    op.create_index("ix_leads_email_lower", "leads", [sa.text("lower(email)")])


def downgrade() -> None:
    op.drop_index("ix_leads_email_lower", table_name="leads")
    op.drop_column("leads", "notify_documents")
    op.drop_column("leads", "notify_deadlines")
