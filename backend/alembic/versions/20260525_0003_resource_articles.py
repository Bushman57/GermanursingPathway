"""resource_articles table

Revision ID: 0003
Revises: 0002
Create Date: 2026-05-25

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0003"
down_revision: Union[str, None] = "0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "resource_articles",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("slug", sa.String(120), nullable=False),
        sa.Column("title_en", sa.String(300), nullable=False),
        sa.Column("title_de", sa.String(300), nullable=True),
        sa.Column("excerpt_en", sa.Text(), nullable=False),
        sa.Column("excerpt_de", sa.Text(), nullable=True),
        sa.Column("body_en", sa.Text(), nullable=True),
        sa.Column("body_de", sa.Text(), nullable=True),
        sa.Column("category", sa.String(40), nullable=False),
        sa.Column("read_minutes", sa.Integer(), nullable=False, server_default="5"),
        sa.Column("is_published", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.UniqueConstraint("slug", name="uq_resource_articles_slug"),
    )
    op.create_index("idx_resource_articles_published", "resource_articles", ["is_published"])


def downgrade() -> None:
    op.drop_index("idx_resource_articles_published", table_name="resource_articles")
    op.drop_table("resource_articles")
