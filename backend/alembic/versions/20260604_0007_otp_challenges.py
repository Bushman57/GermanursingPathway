"""otp_challenges for portal email OTP

Revision ID: 0007
Revises: 0006
Create Date: 2026-06-04

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import UUID

revision: str = "0007"
down_revision: Union[str, None] = "0006"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "otp_challenges",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(320), nullable=False),
        sa.Column("code_hash", sa.String(64), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("attempts", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("consumed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("ip_hash", sa.String(64), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )
    op.create_index("ix_otp_challenges_email", "otp_challenges", ["email"])
    op.create_index("ix_otp_challenges_email_created", "otp_challenges", ["email", "created_at"])


def downgrade() -> None:
    op.drop_index("ix_otp_challenges_email_created", table_name="otp_challenges")
    op.drop_index("ix_otp_challenges_email", table_name="otp_challenges")
    op.drop_table("otp_challenges")
