"""Map blog_posts DB rows ↔ public/admin JSON."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

from app.services.slug_utils import normalize_slug

if TYPE_CHECKING:
    from app.db.models import BlogPost

BLOG_CATEGORIES = frozenset({"language", "visa", "story", "guide"})


def row_to_public(blog: BlogPost, *, include_body: bool = True) -> dict[str, Any]:
    out: dict[str, Any] = {
        "slug": blog.slug,
        "titleEn": blog.title_en,
        "titleDe": blog.title_de or "",
        "excerptEn": blog.excerpt_en,
        "excerptDe": blog.excerpt_de or "",
        "moduleId": blog.module_id,
        "topicIndex": blog.topic_index,
        "category": blog.category,
        "author": blog.author,
        "readMinutes": blog.read_minutes,
        "featuredImageUrl": blog.featured_image_url,
        "externalUrl": blog.external_url,
        "isPublished": blog.is_published,
        "createdAt": blog.created_at.isoformat() if blog.created_at else None,
        "updatedAt": blog.updated_at.isoformat() if blog.updated_at else None,
    }
    if include_body:
        out["bodyEn"] = blog.body_en or ""
        out["bodyDe"] = blog.body_de or ""
    return out


def payload_to_row(payload: dict[str, Any]) -> dict[str, Any]:
    raw_slug = payload.get("slug") or payload.get("titleEn") or payload.get("title_en")
    slug = normalize_slug(str(raw_slug) if raw_slug else None)

    category = payload.get("category")
    if category not in BLOG_CATEGORIES:
        raise ValueError(f"category must be one of: {', '.join(sorted(BLOG_CATEGORIES))}")

    module_id = payload.get("moduleId") or payload.get("module_id")
    topic_index = payload.get("topicIndex") if "topicIndex" in payload else payload.get("topic_index")

    return {
        "slug": slug,
        "title_en": str(payload.get("titleEn") or payload.get("title_en") or slug)[:300],
        "title_de": (str(payload["titleDe"])[:300] if payload.get("titleDe") else None),
        "excerpt_en": str(payload.get("excerptEn") or payload.get("excerpt_en") or ""),
        "excerpt_de": (str(payload["excerptDe"]) if payload.get("excerptDe") else None),
        "body_en": (str(payload["bodyEn"]) if payload.get("bodyEn") else None),
        "body_de": (str(payload["bodyDe"]) if payload.get("bodyDe") else None),
        "module_id": str(module_id) if module_id else None,
        "topic_index": int(topic_index) if topic_index is not None else None,
        "category": str(category),
        "author": (str(payload["author"])[:120] if payload.get("author") else None),
        "read_minutes": int(payload.get("readMinutes") or payload.get("read_minutes") or 5),
        "featured_image_url": (
            str(payload["featuredImageUrl"])[:500] if payload.get("featuredImageUrl") else None
        ),
        "external_url": (str(payload["externalUrl"])[:500] if payload.get("externalUrl") else None),
        "is_published": bool(payload.get("isPublished", payload.get("is_published", True))),
    }


def apply_row_to_model(blog: BlogPost, payload: dict[str, Any]) -> None:
    row = payload_to_row(payload)
    for key, value in row.items():
        setattr(blog, key, value)
