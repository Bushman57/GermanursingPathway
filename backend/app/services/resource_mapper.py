"""Map resource_articles DB rows ↔ public/admin JSON."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

from app.services.slug_utils import normalize_slug

if TYPE_CHECKING:
    from app.db.models import ResourceArticle

RESOURCE_CATEGORIES = frozenset({"language", "visa", "story", "guide"})


def _normalize_article_data(raw: dict[str, Any] | None) -> dict[str, Any] | None:
    if not raw:
        return None
    out: dict[str, Any] = {}
    module_id = raw.get("moduleId") or raw.get("module_id")
    if module_id:
        out["moduleId"] = str(module_id)
    topic_order = raw.get("topicOrder") if "topicOrder" in raw else raw.get("topic_order")
    if topic_order is not None:
        out["topicOrder"] = int(topic_order)
    video_url = raw.get("videoUrl") or raw.get("video_url")
    if video_url:
        out["videoUrl"] = str(video_url)
    takeaways = raw.get("takeaways")
    if isinstance(takeaways, list):
        out["takeaways"] = [str(t) for t in takeaways if t]
    return out or None


def _article_data_to_row(payload: dict[str, Any]) -> dict[str, Any] | None:
    raw = payload.get("articleData") or payload.get("article_data")
    if not raw or not isinstance(raw, dict):
        return None
    out: dict[str, Any] = {}
    module_id = raw.get("moduleId") or raw.get("module_id")
    if module_id:
        out["moduleId"] = str(module_id)
    if raw.get("topicOrder") is not None:
        out["topicOrder"] = int(raw["topicOrder"])
    elif raw.get("topic_order") is not None:
        out["topicOrder"] = int(raw["topic_order"])
    video_url = raw.get("videoUrl") or raw.get("video_url")
    if video_url:
        out["videoUrl"] = str(video_url)
    takeaways = raw.get("takeaways")
    if isinstance(takeaways, list):
        out["takeaways"] = [str(t) for t in takeaways if t]
    return out or None


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
    article_data = _normalize_article_data(article.article_data)
    if article_data:
        out["articleData"] = article_data
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
        "article_data": _article_data_to_row(payload),
    }


def apply_row_to_model(article: ResourceArticle, payload: dict[str, Any]) -> None:
    row = payload_to_row(payload)
    for key, value in row.items():
        setattr(article, key, value)
