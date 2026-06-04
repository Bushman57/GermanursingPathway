"""Shared scholarship list query filters."""

from __future__ import annotations

from sqlalchemy.orm import Query
from sqlalchemy.orm.session import Session

from app.db.models import Scholarship


def scholarship_list_query(
    db: Session,
    *,
    application_status: str | None = None,
    program_type: str | None = None,
    data_verification_status: str | None = None,
    german_level_required: str | None = None,
    intake_month: str | None = None,
) -> Query:
    q = db.query(Scholarship)
    if application_status:
        q = q.filter(Scholarship.application_status == application_status)
    if program_type:
        q = q.filter(Scholarship.program_type == program_type)
    if data_verification_status:
        q = q.filter(Scholarship.data_verification_status == data_verification_status)
    if german_level_required:
        q = q.filter(Scholarship.german_level_required == german_level_required)
    if intake_month:
        q = q.filter(Scholarship.intake_month == intake_month)
    return q.order_by(Scholarship.title_en)
