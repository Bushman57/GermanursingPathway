from collections.abc import Generator
import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.config import get_settings
from app.db.session import get_db
from app.models.lead import LeadCreate, LeadResponse
from app.services.user_service import (
    ensure_user_and_candidate,
    link_eligibility_checks,
    upsert_lead,
)

router = APIRouter(prefix="/api", tags=["leads"])


def optional_db() -> Generator[Session, None, None]:
    if not get_settings().database_url:
        raise HTTPException(
            status_code=503,
            detail="Database is not configured. Set DATABASE_URL in backend/.env",
        )
    yield from get_db()


@router.post("/leads", response_model=LeadResponse)
def create_lead(body: LeadCreate, db: Session = Depends(optional_db)) -> LeadResponse:
    lead = upsert_lead(db, body)
    ensure_user_and_candidate(db, lead)

    check_id: uuid.UUID | None = None
    if body.eligibility_check_id:
        try:
            check_id = uuid.UUID(body.eligibility_check_id)
        except ValueError:
            pass

    link_eligibility_checks(
        db,
        lead.email,
        check_id=check_id,
        full_name=lead.full_name,
    )

    db.commit()
    db.refresh(lead)
    return LeadResponse(id=str(lead.id), status=lead.status)
