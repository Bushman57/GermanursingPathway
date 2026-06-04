from collections.abc import Generator

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from app.config import get_settings
from app.db.models import EligibilityCheck
from app.db.session import get_db

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
    locale: str = Field(default="en", max_length=5)


@router.post("/checks", status_code=201)
def submit_eligibility_check(
    body: EligibilitySubmitBody,
    db: Session = Depends(require_db),
) -> dict[str, str]:
    row = EligibilityCheck(
        email=str(body.email) if body.email else None,
        payload=body.payload,
        score=body.score,
        status=body.status,
        locale=body.locale,
    )
    db.add(row)
    db.commit()
    return {"message": "Eligibility result saved", "id": str(row.id)}
