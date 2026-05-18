"""initial schema — leads, partners, scholarships, portal tables

Revision ID: 0001
Revises:
Create Date: 2026-05-18

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute('CREATE EXTENSION IF NOT EXISTS "pgcrypto"')

    op.create_table(
        "leads",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("full_name", sa.String(200), nullable=False),
        sa.Column("email", sa.String(320), nullable=False),
        sa.Column("phone", sa.String(40), nullable=True),
        sa.Column("nursing_qualification", sa.String(120), nullable=False),
        sa.Column("german_level", sa.String(40), nullable=False),
        sa.Column("timeline", sa.String(120), nullable=False),
        sa.Column("message", sa.Text(), nullable=True),
        sa.Column("source", sa.String(60), nullable=False, server_default="homepage"),
        sa.Column("locale", sa.String(5), nullable=False, server_default="en"),
        sa.Column("status", sa.String(30), nullable=False, server_default="new"),
        sa.Column("whatsapp_joined", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("idx_leads_status", "leads", ["status"])
    op.create_index("idx_leads_created", "leads", ["created_at"])

    op.create_table(
        "partner_schools",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("slug", sa.String(120), nullable=False),
        sa.Column("name_en", sa.String(200), nullable=False),
        sa.Column("name_de", sa.String(200), nullable=True),
        sa.Column("description_en", sa.Text(), nullable=False),
        sa.Column("description_de", sa.Text(), nullable=True),
        sa.Column("logo_url", sa.String(500), nullable=True),
        sa.Column("website_url", sa.String(500), nullable=True),
        sa.Column("city", sa.String(100), nullable=True),
        sa.Column("verified", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.UniqueConstraint("slug", name="uq_partner_schools_slug"),
    )

    op.create_table(
        "scholarships",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("slug", sa.String(120), nullable=False),
        sa.Column("partner_school_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("program_type", sa.String(60), nullable=False),
        sa.Column("title_en", sa.String(300), nullable=False),
        sa.Column("title_de", sa.String(300), nullable=True),
        sa.Column("short_description_en", sa.Text(), nullable=False),
        sa.Column("short_description_de", sa.Text(), nullable=True),
        sa.Column("funding", sa.String(80), nullable=True),
        sa.Column("deadline", sa.Date(), nullable=True),
        sa.Column("verified", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("program_data", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.ForeignKeyConstraint(["partner_school_id"], ["partner_schools.id"], name="fk_scholarships_partner_school_id"),
        sa.UniqueConstraint("slug", name="uq_scholarships_slug"),
    )
    op.create_index("idx_scholarships_program", "scholarships", ["program_type"])
    op.create_index("idx_scholarships_verified", "scholarships", ["verified"])

    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("email", sa.String(320), nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("role", sa.String(30), nullable=False, server_default="candidate"),
        sa.UniqueConstraint("email", name="uq_users_email"),
    )

    op.create_table(
        "candidates",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("lead_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("full_name", sa.String(200), nullable=False),
        sa.Column("email", sa.String(320), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["lead_id"], ["leads.id"], name="fk_candidates_lead_id"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name="fk_candidates_user_id"),
    )

    op.create_table(
        "applications",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("candidate_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("scholarship_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("stage", sa.String(40), nullable=False, server_default="registered"),
        sa.Column("checklist", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["candidate_id"], ["candidates.id"], name="fk_applications_candidate_id"),
        sa.ForeignKeyConstraint(["scholarship_id"], ["scholarships.id"], name="fk_applications_scholarship_id"),
    )


def downgrade() -> None:
    op.drop_table("applications")
    op.drop_table("candidates")
    op.drop_table("users")
    op.drop_index("idx_scholarships_verified", table_name="scholarships")
    op.drop_index("idx_scholarships_program", table_name="scholarships")
    op.drop_table("scholarships")
    op.drop_table("partner_schools")
    op.drop_index("idx_leads_created", table_name="leads")
    op.drop_index("idx_leads_status", table_name="leads")
    op.drop_table("leads")
