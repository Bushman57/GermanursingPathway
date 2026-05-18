from collections.abc import Generator

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.config import get_settings
from app.db.models import Lead
from app.db.session import get_db
from app.models.lead import LeadCreate, LeadResponse

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
    lead = Lead(
        full_name=body.full_name.strip(),
        email=body.email.strip().lower(),
        phone=body.phone.strip() if body.phone else None,
        nursing_qualification=body.nursing_qualification,
        german_level=body.german_level,
        timeline=body.timeline,
        message=body.message,
        source=body.source,
        locale=body.locale,
        whatsapp_joined=body.whatsapp_joined,
        status="new",
    )
    db.add(lead)
    db.commit()
    db.refresh(lead)
    return LeadResponse(id=str(lead.id), status=lead.status)
