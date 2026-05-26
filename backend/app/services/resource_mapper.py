"""Map resource_articles DB rows ↔ public/admin JSON."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

from app.services.slug_utils import normalize_slug

if TYPE_CHECKING:
    from app.db.models import ResourceArticle

RESOURCE_CATEGORIES = frozenset({"language", "visa", "story", "guide"})


def row_to_public(article: ResourceArticle, *, include_body: bool = True) -> dict[str, Any]:
    out: dict[str, Any] = {
        "slug": article.slug,
        "titleEn": article.title_en,
        "titleDe": article.title_de or "",
        "excerptEn": article.excerpt_en,
        "excerptDe": article.excerpt_de or "",
        "category": article.category,
        "readMinutes": article.read_minutes,
    }
    if include_body:
        out["bodyEn"] = article.body_en or ""
        out["bodyDe"] = article.body_de or ""
    out["isPublished"] = article.is_published
    return out


def payload_to_row(payload: dict[str, Any]) -> dict[str, Any]:
    raw_slug = payload.get("slug") or payload.get("titleEn") or payload.get("title_en")
    slug = normalize_slug(str(raw_slug) if raw_slug else None)

    category = payload.get("category")
    if category not in RESOURCE_CATEGORIES:
        raise ValueError(f"category must be one of: {', '.join(sorted(RESOURCE_CATEGORIES))}")

    return {
        "slug": slug,
        "title_en": str(payload.get("titleEn") or payload.get("title_en") or slug)[:300],
        "title_de": (str(payload["titleDe"])[:300] if payload.get("titleDe") else None),
        "excerpt_en": str(payload.get("excerptEn") or payload.get("excerpt_en") or ""),
        "excerpt_de": (str(payload["excerptDe"]) if payload.get("excerptDe") else None),
        "body_en": (str(payload["bodyEn"]) if payload.get("bodyEn") else None),
        "body_de": (str(payload["bodyDe"]) if payload.get("bodyDe") else None),
        "category": str(category),
        "read_minutes": int(payload.get("readMinutes") or payload.get("read_minutes") or 5),
        "is_published": bool(payload.get("isPublished", payload.get("is_published", True))),
        "sort_order": int(payload.get("sortOrder") or payload.get("sort_order") or 0),
    }


def apply_row_to_model(article: ResourceArticle, payload: dict[str, Any]) -> None:
    row = payload_to_row(payload)
    for key, value in row.items():
        setattr(article, key, value)
