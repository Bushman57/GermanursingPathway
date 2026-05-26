from collections.abc import Generator

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.config import get_settings
from app.db.models import Scholarship
from app.db.session import get_db
from app.services.scholarship_mapper import row_to_public

router = APIRouter(prefix="/api/scholarships", tags=["scholarships"])


def require_db() -> Generator[Session, None, None]:
    if not get_settings().database_url:
        raise HTTPException(
            status_code=503,
            detail="Database is not configured. Set DATABASE_URL in backend/.env",
        )
    yield from get_db()


@router.get("")
def list_scholarships(db: Session = Depends(require_db)) -> list[dict]:
    rows = db.query(Scholarship).order_by(Scholarship.title_en).all()
    return [row_to_public(r, include_detail=False) for r in rows]


@router.get("/{slug}")
def get_scholarship(slug: str, db: Session = Depends(require_db)) -> dict:
    row = db.query(Scholarship).filter(Scholarship.slug == slug).one_or_none()
    if row is None:
        raise HTTPException(status_code=404, detail="Scholarship not found")
    return row_to_public(row)
