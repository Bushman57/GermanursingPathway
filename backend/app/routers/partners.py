from collections.abc import Generator

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.config import get_settings
from app.db.models import PartnerSchool
from app.db.session import get_db

router = APIRouter(prefix="/api/partner-schools", tags=["partners"])


def require_db() -> Generator[Session, None, None]:
    if not get_settings().database_url:
        raise HTTPException(
            status_code=503,
            detail="Database is not configured. Set DATABASE_URL in backend/.env",
        )
    yield from get_db()


@router.get("")
def list_partner_schools(db: Session = Depends(require_db)) -> list[dict]:
    rows = (
        db.query(PartnerSchool)
        .filter(PartnerSchool.is_active.is_(True))
        .order_by(PartnerSchool.sort_order, PartnerSchool.name_en)
        .all()
    )
    return [
        {
            "slug": r.slug,
            "nameEn": r.name_en,
            "nameDe": r.name_de,
            "descriptionEn": r.description_en,
            "descriptionDe": r.description_de,
            "logoUrl": r.logo_url,
            "websiteUrl": r.website_url,
            "city": r.city,
            "verified": r.verified,
        }
        for r in rows
    ]
