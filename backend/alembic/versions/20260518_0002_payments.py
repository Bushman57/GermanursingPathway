"""payments table for KCB STK Push

Revision ID: 0002
Revises: 0001
Create Date: 2026-05-18

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "payments",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("phone_number", sa.String(20), nullable=False),
        sa.Column("amount_kes", sa.Integer(), nullable=False),
        sa.Column("invoice_number", sa.String(64), nullable=False),
        sa.Column("merchant_request_id", sa.String(80), nullable=True),
        sa.Column("checkout_request_id", sa.String(80), nullable=True),
        sa.Column("status", sa.String(30), nullable=False, server_default="pending"),
        sa.Column("result_code", sa.Integer(), nullable=True),
        sa.Column("result_desc", sa.String(500), nullable=True),
        sa.Column("mpesa_receipt_number", sa.String(40), nullable=True),
        sa.Column("callback_payload", postgresql.JSONB(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("idx_payments_status", "payments", ["status"])
    op.create_index("idx_payments_checkout_request_id", "payments", ["checkout_request_id"], unique=True)
    op.create_index("idx_payments_invoice_number", "payments", ["invoice_number"], unique=True)


def downgrade() -> None:
    op.drop_index("idx_payments_invoice_number", table_name="payments")
    op.drop_index("idx_payments_checkout_request_id", table_name="payments")
    op.drop_index("idx_payments_status", table_name="payments")
    op.drop_table("payments")
