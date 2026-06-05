from collections.abc import Generator

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from app.config import get_settings
from app.db.models import EligibilityCheck
from app.db.session import get_db
from app.services.otp_service import normalize_email
from app.services.user_service import eligibility_to_dict, get_latest_eligibility, get_latest_lead

router = APIRouter(prefix="/api/eligibility", tags=["eligibility"])


def require_db() -> Generator[Session, None, None]:
    if not get_settings().database_url:
        raise HTTPException(
            status_code=503,
            detail="Database is not configured. Set DATABASE_URL in backend/.env",
        )
    yield from get_db()


class EligibilitySubmitBody(BaseModel):
    email: EmailStr | None = None
    payload: dict = Field(default_factory=dict)
    score: int = Field(ge=0, le=100)
    status: str = Field(max_length=30)
    gaps: list[str] | None = None
    source: str = Field(default="public", max_length=30)
    locale: str = Field(default="en", max_length=5)


@router.post("/checks", status_code=201)
def submit_eligibility_check(
    body: EligibilitySubmitBody,
    db: Session = Depends(require_db),
) -> dict[str, str]:
    lead = None
    email: str | None = None
    if body.email:
        email = normalize_email(str(body.email))
        lead = get_latest_lead(db, email)

    row = EligibilityCheck(
        email=email,
        lead_id=lead.id if lead else None,
        payload=body.payload,
        score=body.score,
        status=body.status,
        gaps=body.gaps,
        source=body.source,
        locale=body.locale,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return {"message": "Eligibility result saved", "id": str(row.id)}


@router.get("/latest")
def get_latest_check(
    email: EmailStr = Query(...),
    db: Session = Depends(require_db),
) -> dict:
    row = get_latest_eligibility(db, str(email))
    if row is None:
        raise HTTPException(status_code=404, detail="No eligibility check found for this email")
    return eligibility_to_dict(row)
