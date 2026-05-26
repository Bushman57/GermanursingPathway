"""scholarships.application_link column

Revision ID: 0005
Revises: 0004
Create Date: 2026-05-25

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0005"
down_revision: Union[str, None] = "0004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("scholarships", sa.Column("application_link", sa.String(500), nullable=True))
    op.execute(
        """
        UPDATE scholarships
        SET application_link = LEFT(program_data->>'applicationLink', 500)
        WHERE program_data->>'applicationLink' IS NOT NULL
          AND TRIM(program_data->>'applicationLink') <> ''
        """
    )
    op.execute(
        """
        UPDATE scholarships
        SET application_link = LEFT(official_link, 500)
        WHERE application_link IS NULL
          AND official_link IS NOT NULL
          AND TRIM(official_link) <> ''
          AND (
            official_link = '/register'
            OR official_link NOT ILIKE 'http://%'
            AND official_link NOT ILIKE 'https://%'
          )
        """
    )
    op.execute(
        """
        UPDATE scholarships
        SET official_link = NULL
        WHERE official_link IS NOT NULL
          AND TRIM(official_link) <> ''
          AND official_link NOT ILIKE 'http://%'
          AND official_link NOT ILIKE 'https://%'
        """
    )


def downgrade() -> None:
    op.drop_column("scholarships", "application_link")
