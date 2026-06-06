from collections.abc import Generator

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.config import Settings, get_settings
from app.db.models import ResourceArticle
from app.db.session import get_db
from app.deps.portal_auth import PortalUser, optional_portal_user
from app.services.resource_mapper import row_to_public
from app.services.user_service import has_learning_hub_access

router = APIRouter(prefix="/api/resources", tags=["resources"])


def require_db() -> Generator[Session, None, None]:
    if not get_settings().database_url:
        raise HTTPException(
            status_code=503,
            detail="Database is not configured. Set DATABASE_URL in backend/.env",
        )
    yield from get_db()


def _is_premium_article(article: ResourceArticle, settings: Settings) -> bool:
    free_id = settings.learning_hub_free_module_id
    data = article.article_data or {}
    module_id = data.get("moduleId") or data.get("module_id")
    if module_id:
        return str(module_id) != free_id
    return False


def _can_read_premium(db: Session, user: PortalUser | None, settings: Settings) -> bool:
    if user is None:
        return False
    return has_learning_hub_access(db, user.email)


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
def get_resource(
    slug: str,
    db: Session = Depends(require_db),
    user: PortalUser | None = Depends(optional_portal_user),
    settings: Settings = Depends(get_settings),
) -> dict:
    row = (
        db.query(ResourceArticle)
        .filter(ResourceArticle.slug == slug, ResourceArticle.is_published.is_(True))
        .one_or_none()
    )
    if row is None:
        raise HTTPException(status_code=404, detail="Resource not found")

    out = row_to_public(row, include_body=True)
    if _is_premium_article(row, settings) and not _can_read_premium(db, user, settings):
        out["bodyEn"] = ""
        out["bodyDe"] = ""
        out["locked"] = True
    else:
        out["locked"] = False
    return out
