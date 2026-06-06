from collections.abc import Generator

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.config import Settings, get_settings
from app.db.models import BlogPost
from app.db.session import get_db
from app.deps.portal_auth import PortalUser, optional_portal_user
from app.services.blog_mapper import row_to_public
from app.services.user_service import has_learning_hub_access

router = APIRouter(prefix="/api/blogs", tags=["blogs"])


def require_db() -> Generator[Session, None, None]:
    if not get_settings().database_url:
        raise HTTPException(
            status_code=503,
            detail="Database is not configured. Set DATABASE_URL in backend/.env",
        )
    yield from get_db()


def _is_premium_blog(blog: BlogPost, settings: Settings) -> bool:
    free_id = settings.learning_hub_free_module_id
    if blog.module_id:
        return str(blog.module_id) != free_id
    return False


def _can_read_premium(db: Session, user: PortalUser | None, settings: Settings) -> bool:
    if user is None:
        return False
    return has_learning_hub_access(db, user.email)


@router.get("")
def list_blogs(db: Session = Depends(require_db)) -> list[dict]:
    rows = (
        db.query(BlogPost)
        .filter(BlogPost.is_published.is_(True))
        .order_by(BlogPost.module_id.nulls_last(), BlogPost.topic_index.nulls_last(), BlogPost.title_en)
        .all()
    )
    return [row_to_public(r, include_body=False) for r in rows]


@router.get("/{slug}")
def get_blog(
    slug: str,
    db: Session = Depends(require_db),
    user: PortalUser | None = Depends(optional_portal_user),
    settings: Settings = Depends(get_settings),
) -> dict:
    row = (
        db.query(BlogPost)
        .filter(BlogPost.slug == slug, BlogPost.is_published.is_(True))
        .one_or_none()
    )
    if row is None:
        raise HTTPException(status_code=404, detail="Blog not found")

    out = row_to_public(row, include_body=True)
    if _is_premium_blog(row, settings) and not _can_read_premium(db, user, settings):
        out["bodyEn"] = ""
        out["bodyDe"] = ""
        out["locked"] = True
    else:
        out["locked"] = False
    return out
