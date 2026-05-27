"""scholarship questionnaire columns

Revision ID: 0006
Revises: 0005
Create Date: 2026-05-26

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0006"
down_revision: Union[str, None] = "0005"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

_COLUMNS: list[tuple[str, int]] = [
    ("verification_status", 20),
    ("data_verification_status", 30),
    ("application_status", 30),
    ("degree_level", 60),
    ("german_level_required", 30),
    ("visa_sponsorship", 20),
    ("accommodation_support", 40),
    ("intake_month", 20),
    ("program_duration", 30),
    ("recognition_support", 40),
    ("interview_required", 10),
    ("application_method", 40),
    ("provider_type", 40),
]

# camelCase program_data key -> snake_case column
_BACKFILL_MAP: list[tuple[str, str]] = [
    ("verificationStatus", "verification_status"),
    ("dataVerificationStatus", "data_verification_status"),
    ("applicationStatus", "application_status"),
    ("degreeLevel", "degree_level"),
    ("germanLevelRequired", "german_level_required"),
    ("visaSponsorship", "visa_sponsorship"),
    ("accommodationSupport", "accommodation_support"),
    ("intakeMonth", "intake_month"),
    ("programDuration", "program_duration"),
    ("recognitionSupport", "recognition_support"),
    ("interviewRequired", "interview_required"),
    ("applicationMethod", "application_method"),
    ("providerType", "provider_type"),
]


def upgrade() -> None:
    for name, length in _COLUMNS:
        op.add_column("scholarships", sa.Column(name, sa.String(length), nullable=True))

    col_lengths = dict(_COLUMNS)
    for json_key, col in _BACKFILL_MAP:
        max_len = col_lengths[col]
        op.execute(
            f"""
            UPDATE scholarships
            SET {col} = LEFT(program_data->>'{json_key}', {max_len})
            WHERE {col} IS NULL
              AND program_data ? '{json_key}'
              AND TRIM(program_data->>'{json_key}') <> ''
            """
        )

    op.execute(
        """
        UPDATE scholarships
        SET verification_status = CASE WHEN verified THEN 'yes' ELSE 'no' END
        WHERE verification_status IS NULL
        """
    )

    op.create_index("ix_scholarships_application_status", "scholarships", ["application_status"])
    op.create_index("ix_scholarships_data_verification_status", "scholarships", ["data_verification_status"])
    op.create_index("ix_scholarships_program_type", "scholarships", ["program_type"])


def downgrade() -> None:
    op.drop_index("ix_scholarships_program_type", table_name="scholarships")
    op.drop_index("ix_scholarships_data_verification_status", table_name="scholarships")
    op.drop_index("ix_scholarships_application_status", table_name="scholarships")
    for name, _ in reversed(_COLUMNS):
        op.drop_column("scholarships", name)
