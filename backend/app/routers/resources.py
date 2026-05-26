from collections.abc import Generator

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.config import get_settings
from app.db.models import ResourceArticle
from app.db.session import get_db
from app.services.resource_mapper import row_to_public

router = APIRouter(prefix="/api/resources", tags=["resources"])


def require_db() -> Generator[Session, None, None]:
    if not get_settings().database_url:
        raise HTTPException(
            status_code=503,
            detail="Database is not configured. Set DATABASE_URL in backend/.env",
        )
    yield from get_db()


@router.get("")
def list_resources(db: Session = Depends(require_db)) -> list[dict]:
    rows = (
        db.query(ResourceArticle)
        .filter(ResourceArticle.is_published.is_(True))
        .order_by(ResourceArticle.sort_order, ResourceArticle.title_en)
        .all()
    )
    return [row_to_public(r, include_body=False) for r in rows]


@router.get("/{slug}")
def get_resource(slug: str, db: Session = Depends(require_db)) -> dict:
    row = (
        db.query(ResourceArticle)
        .filter(ResourceArticle.slug == slug, ResourceArticle.is_published.is_(True))
        .one_or_none()
    )
    if row is None:
        raise HTTPException(status_code=404, detail="Resource not found")
    return row_to_public(row, include_body=True)
