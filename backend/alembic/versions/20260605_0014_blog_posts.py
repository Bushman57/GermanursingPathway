"""blog_posts table

Revision ID: 20260605_0014
Revises: 20260605_0013
Create Date: 2026-06-06

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "20260605_0014"
down_revision: Union[str, None] = "20260605_0013"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "blog_posts",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("slug", sa.String(120), nullable=False),
        sa.Column("title_en", sa.String(300), nullable=False),
        sa.Column("title_de", sa.String(300), nullable=True),
        sa.Column("excerpt_en", sa.Text(), nullable=False),
        sa.Column("excerpt_de", sa.Text(), nullable=True),
        sa.Column("body_en", sa.Text(), nullable=True),
        sa.Column("body_de", sa.Text(), nullable=True),
        sa.Column("module_id", sa.String(60), nullable=True),
        sa.Column("topic_index", sa.Integer(), nullable=True),
        sa.Column("category", sa.String(40), nullable=False),
        sa.Column("author", sa.String(120), nullable=True),
        sa.Column("read_minutes", sa.Integer(), nullable=False, server_default="5"),
        sa.Column("featured_image_url", sa.String(500), nullable=True),
        sa.Column("external_url", sa.String(500), nullable=True),
        sa.Column("is_published", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.UniqueConstraint("slug", name="uq_blog_posts_slug"),
    )
    op.create_index("idx_blog_posts_published", "blog_posts", ["is_published"])
    op.create_index("idx_blog_posts_module_topic", "blog_posts", ["module_id", "topic_index"])


def downgrade() -> None:
    op.drop_index("idx_blog_posts_module_topic", table_name="blog_posts")
    op.drop_index("idx_blog_posts_published", table_name="blog_posts")
    op.drop_table("blog_posts")
