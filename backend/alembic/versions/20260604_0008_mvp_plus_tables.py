"""mvp plus tables

Revision ID: 20260604_0008
Revises: 20260604_0007
Create Date: 2026-06-04

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "20260604_0008"
down_revision: Union[str, None] = "0007"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "eligibility_checks",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(320), nullable=True),
        sa.Column("payload", postgresql.JSONB(), nullable=False),
        sa.Column("score", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(30), nullable=False),
        sa.Column("locale", sa.String(5), server_default="en"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_eligibility_checks_email", "eligibility_checks", ["email"])

    op.create_table(
        "portal_documents",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(320), nullable=False),
        sa.Column("doc_type", sa.String(60), nullable=False),
        sa.Column("filename", sa.String(300), nullable=False),
        sa.Column("storage_path", sa.String(500), nullable=False),
        sa.Column("status", sa.String(30), server_default="uploaded"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_portal_documents_email", "portal_documents", ["email"])


def downgrade() -> None:
    op.drop_index("ix_portal_documents_email", table_name="portal_documents")
    op.drop_table("portal_documents")
    op.drop_index("ix_eligibility_checks_email", table_name="eligibility_checks")
    op.drop_table("eligibility_checks")
