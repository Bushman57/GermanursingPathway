from collections.abc import Generator

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.config import get_settings
from app.db.models import Scholarship
from app.db.session import get_db
from app.deps.portal_auth import PortalUser, require_plus_subscription
from app.services.scholarship_mapper import row_to_public
from app.services.scholarship_query import scholarship_list_query

router = APIRouter(prefix="/api/scholarships", tags=["scholarships"])


def require_db() -> Generator[Session, None, None]:
    if not get_settings().database_url:
        raise HTTPException(
            status_code=503,
            detail="Database is not configured. Set DATABASE_URL in backend/.env",
        )
    yield from get_db()


@router.get("")
def list_scholarships(
    _user: PortalUser = Depends(require_plus_subscription),
    db: Session = Depends(require_db),
    application_status: str | None = Query(None, alias="application_status"),
    program_type: str | None = Query(None, alias="program_type"),
    german_level_required: str | None = Query(None, alias="german_level_required"),
    intake_month: str | None = Query(None, alias="intake_month"),
) -> list[dict]:
    q = scholarship_list_query(
        db,
        application_status=application_status,
        program_type=program_type,
        german_level_required=german_level_required,
        intake_month=intake_month,
    )
    rows = q.all()
    return [row_to_public(r, include_detail=False) for r in rows]


@router.get("/{slug}")
def get_scholarship(
    slug: str,
    _user: PortalUser = Depends(require_plus_subscription),
    db: Session = Depends(require_db),
) -> dict:
    row = (
        db.query(Scholarship)
        .options(joinedload(Scholarship.partner))
        .filter(Scholarship.slug == slug)
        .one_or_none()
    )
    if row is None:
        raise HTTPException(status_code=404, detail="Scholarship not found")
    return row_to_public(row)
