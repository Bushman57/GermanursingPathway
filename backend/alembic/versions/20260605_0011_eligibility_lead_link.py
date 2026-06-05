"""eligibility lead link and gaps

Revision ID: 20260605_0011
Revises: 20260605_0010
Create Date: 2026-06-05

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "20260605_0011"
down_revision: Union[str, None] = "20260605_0010"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "eligibility_checks",
        sa.Column("lead_id", postgresql.UUID(as_uuid=True), nullable=True),
    )
    op.add_column(
        "eligibility_checks",
        sa.Column("gaps", postgresql.JSONB(), nullable=True),
    )
    op.add_column(
        "eligibility_checks",
        sa.Column("source", sa.String(30), nullable=False, server_default="public"),
    )
    op.create_foreign_key(
        "fk_eligibility_checks_lead_id",
        "eligibility_checks",
        "leads",
        ["lead_id"],
        ["id"],
    )
    op.create_index("ix_eligibility_checks_lead_id", "eligibility_checks", ["lead_id"])


def downgrade() -> None:
    op.drop_index("ix_eligibility_checks_lead_id", table_name="eligibility_checks")
    op.drop_constraint("fk_eligibility_checks_lead_id", "eligibility_checks", type_="foreignkey")
    op.drop_column("eligibility_checks", "source")
    op.drop_column("eligibility_checks", "gaps")
    op.drop_column("eligibility_checks", "lead_id")
