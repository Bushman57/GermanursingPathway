from collections.abc import Generator
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.config import get_settings
from app.db.models import BlogPost, ResourceArticle, Scholarship
from app.db.session import get_db
from app.deps.auth import require_admin
from app.models.blog import BlogPayload
from app.models.resource import ResourcePayload
from app.services.blog_mapper import apply_row_to_model as apply_blog_row
from app.services.blog_mapper import row_to_public as blog_to_public
from app.services.resource_mapper import apply_row_to_model, row_to_public as resource_to_public
from app.schemas.scholarship_fields import validate_scholarship_questionnaire
from app.services.scholarship_mapper import apply_row_to_model as apply_scholarship_row
from app.services.scholarship_mapper import entry_to_row, row_to_public as scholarship_to_public
from app.services.scholarship_query import scholarship_list_query
from app.services.slug_utils import normalize_slug

router = APIRouter(prefix="/api/admin", tags=["admin"], dependencies=[Depends(require_admin)])


def require_db() -> Generator[Session, None, None]:
    if not get_settings().database_url:
        raise HTTPException(status_code=503, detail="Database is not configured")
    yield from get_db()


# --- Scholarships ---


@router.get("/scholarships")
def admin_list_scholarships(
    db: Session = Depends(require_db),
    application_status: str | None = Query(None, alias="application_status"),
    program_type: str | None = Query(None, alias="program_type"),
    data_verification_status: str | None = Query(None, alias="data_verification_status"),
) -> list[dict]:
    rows = scholarship_list_query(
        db,
        application_status=application_status,
        program_type=program_type,
        data_verification_status=data_verification_status,
    ).all()
    return [scholarship_to_public(r) for r in rows]


def _validate_scholarship_body(body: dict[str, Any]) -> dict[str, Any]:
    try:
        body = {**body, "slug": normalize_slug(str(body.get("slug") or body.get("title") or ""))}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    if not body.get("title") or not body.get("shortDescription"):
        raise HTTPException(status_code=400, detail="title and shortDescription are required")
    try:
        body = validate_scholarship_questionnaire(body)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return body


@router.post("/scholarships", status_code=201)
def admin_create_scholarship(body: dict[str, Any], db: Session = Depends(require_db)) -> dict:
    body = _validate_scholarship_body(body)
    if db.query(Scholarship).filter(Scholarship.slug == body["slug"]).one_or_none():
        raise HTTPException(status_code=409, detail="Scholarship slug already exists")
    try:
        row = entry_to_row(body)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    record = Scholarship(**row)
    db.add(record)
    db.commit()
    db.refresh(record)
    return scholarship_to_public(record)


@router.put("/scholarships/{slug}")
def admin_update_scholarship(
    slug: str,
    body: dict[str, Any],
    db: Session = Depends(require_db),
) -> dict:
    record = db.query(Scholarship).filter(Scholarship.slug == slug).one_or_none()
    if record is None:
        raise HTTPException(status_code=404, detail="Scholarship not found")
    entry = _validate_scholarship_body({**body, "slug": slug})
    try:
        apply_scholarship_row(record, entry)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    db.commit()
    db.refresh(record)
    return scholarship_to_public(record)


@router.delete("/scholarships/{slug}", status_code=204)
def admin_delete_scholarship(slug: str, db: Session = Depends(require_db)) -> None:
    record = db.query(Scholarship).filter(Scholarship.slug == slug).one_or_none()
    if record is None:
        raise HTTPException(status_code=404, detail="Scholarship not found")
    db.delete(record)
    db.commit()


# --- Resources ---


@router.get("/resources")
def admin_list_resources(db: Session = Depends(require_db)) -> list[dict]:
    rows = db.query(ResourceArticle).order_by(ResourceArticle.sort_order, ResourceArticle.title_en).all()
    return [resource_to_public(r, include_body=True) for r in rows]


@router.post("/resources", status_code=201)
def admin_create_resource(body: ResourcePayload, db: Session = Depends(require_db)) -> dict:
    if db.query(ResourceArticle).filter(ResourceArticle.slug == body.slug).one_or_none():
        raise HTTPException(status_code=409, detail="Resource slug already exists")
    try:
        from app.services.resource_mapper import payload_to_row

        row = payload_to_row(body.model_dump())
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    record = ResourceArticle(**row)
    db.add(record)
    db.commit()
    db.refresh(record)
    return resource_to_public(record, include_body=True)


@router.put("/resources/{slug}")
def admin_update_resource(
    slug: str,
    body: ResourcePayload,
    db: Session = Depends(require_db),
) -> dict:
    record = db.query(ResourceArticle).filter(ResourceArticle.slug == slug).one_or_none()
    if record is None:
        raise HTTPException(status_code=404, detail="Resource not found")
    payload = body.model_dump()
    payload["slug"] = slug
    try:
        apply_row_to_model(record, payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    db.commit()
    db.refresh(record)
    return resource_to_public(record, include_body=True)


@router.delete("/resources/{slug}", status_code=204)
def admin_delete_resource(slug: str, db: Session = Depends(require_db)) -> None:
    record = db.query(ResourceArticle).filter(ResourceArticle.slug == slug).one_or_none()
    if record is None:
        raise HTTPException(status_code=404, detail="Resource not found")
    db.delete(record)
    db.commit()


# --- Blogs ---


@router.get("/blogs")
def admin_list_blogs(db: Session = Depends(require_db)) -> list[dict]:
    rows = (
        db.query(BlogPost)
        .order_by(BlogPost.module_id.nulls_last(), BlogPost.topic_index.nulls_last(), BlogPost.title_en)
        .all()
    )
    return [blog_to_public(r, include_body=True) for r in rows]


@router.post("/blogs", status_code=201)
def admin_create_blog(body: BlogPayload, db: Session = Depends(require_db)) -> dict:
    if db.query(BlogPost).filter(BlogPost.slug == body.slug).one_or_none():
        raise HTTPException(status_code=409, detail="Blog slug already exists")
    try:
        from app.services.blog_mapper import payload_to_row

        row = payload_to_row(body.model_dump())
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    record = BlogPost(**row)
    db.add(record)
    db.commit()
    db.refresh(record)
    return blog_to_public(record, include_body=True)


@router.put("/blogs/{slug}")
def admin_update_blog(
    slug: str,
    body: BlogPayload,
    db: Session = Depends(require_db),
) -> dict:
    record = db.query(BlogPost).filter(BlogPost.slug == slug).one_or_none()
    if record is None:
        raise HTTPException(status_code=404, detail="Blog not found")
    payload = body.model_dump()
    payload["slug"] = slug
    try:
        apply_blog_row(record, payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    db.commit()
    db.refresh(record)
    return blog_to_public(record, include_body=True)


@router.delete("/blogs/{slug}", status_code=204)
def admin_delete_blog(slug: str, db: Session = Depends(require_db)) -> None:
    record = db.query(BlogPost).filter(BlogPost.slug == slug).one_or_none()
    if record is None:
        raise HTTPException(status_code=404, detail="Blog not found")
    db.delete(record)
    db.commit()
