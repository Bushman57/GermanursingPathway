"""
Seed blog_posts from Learning Hub topics (modules 2–11) and existing resource articles.

Run from repo root:
  npm run db:seed-blogs

Or from backend/:
  python scripts/seed_blogs.py
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]

MODULE_CATEGORY: dict[str, str] = {
    "german-language": "language",
    "visa-immigration": "visa",
    "timelines-stories": "story",
}

LEARNING_MODULES: list[dict] = [
    {
        "id": "german-language",
        "topics": [
            "Required language levels (A1–B2 explained)",
            "Comparison of Goethe-Zertifikat vs TELC",
            "Best places to learn German in Kenya",
            "Study strategies for busy nurses",
            "Cost of learning German in Kenya",
            "How long it takes to reach B2",
        ],
    },
    {
        "id": "documents-applications",
        "topics": [
            "Required documents for Kenyan nurses",
            "How to prepare a German-style CV (Lebenslauf)",
            "Writing a motivation letter",
            "Document translation and certification",
            "Police clearance and passport process",
        ],
    },
    {
        "id": "recognition",
        "topics": [
            "What recognition means in Germany",
            "Partial vs full recognition explained",
            "Required documents for recognition",
            "Adaptation period (Anpassungslehrgang)",
            "Role of Anabin",
        ],
    },
    {
        "id": "visa-immigration",
        "topics": [
            "Types of visas for nurses",
            "Application process via German Embassy Nairobi",
            "Visa interview preparation",
            "Required financial proof",
            "Common visa rejection reasons",
        ],
    },
    {
        "id": "jobs-recruitment",
        "topics": [
            "Where to find nursing jobs in Germany",
            "Understanding job contracts",
            "Salary expectations for nurses",
            "Ethical recruitment programs like Triple Win",
            "How to identify and avoid fake agents",
        ],
    },
    {
        "id": "costs-financial",
        "topics": [
            "Total cost breakdown (Kenya → Germany)",
            "Language school and exam fees",
            "Visa and relocation costs",
            "Cost of living in Germany (rent, food, transport)",
            "Financial planning tips before departure",
        ],
    },
    {
        "id": "life-in-germany",
        "topics": [
            "Accommodation and housing tips",
            "Cultural differences (workplace & daily life)",
            "Health insurance system",
            "Transportation and daily living",
            "Rights and responsibilities as a nurse",
        ],
    },
    {
        "id": "mistakes-scams",
        "topics": [
            "Common mistakes Kenyan applicants make",
            "Red flags when dealing with agents",
            "Contract traps and exploitation risks",
            "Misunderstanding language requirements",
        ],
    },
    {
        "id": "timelines-stories",
        "topics": [
            "Typical timeline (start to relocation)",
            "Real stories of Kenyan nurses in Germany",
            "Case studies (successful vs delayed journeys)",
        ],
    },
    {
        "id": "extra-support",
        "topics": [
            "FAQs (frequently asked questions)",
            "Downloadable templates (CV, cover letter)",
            "Checklist before applying",
            "Glossary of German terms (Anerkennung, Ausbildung, etc.)",
            "Useful platforms: Make it in Germany & Federal Employment Agency",
        ],
    },
]

DEFAULT_EXCERPT = (
    "A practical guide for Kenyan healthcare professionals on the German nursing pathway."
)


def _category_for_module(module_id: str) -> str:
    return MODULE_CATEGORY.get(module_id, "guide")


def _unique_slug(base: str, seen: set[str]) -> str:
    sys.path.insert(0, str(BACKEND_ROOT))
    from app.services.slug_utils import normalize_slug

    slug = normalize_slug(base)
    if slug not in seen:
        seen.add(slug)
        return slug
    n = 2
    while True:
        candidate = f"{slug}-{n}"
        if candidate not in seen:
            seen.add(candidate)
            return candidate
        n += 1


def seed_blogs(*, dry_run: bool = False) -> int:
    sys.path.insert(0, str(BACKEND_ROOT))

    from sqlalchemy.orm import Session

    from app.config import get_settings
    from app.db.models import BlogPost, ResourceArticle
    from app.db.session import _get_engine

    if not get_settings().database_url:
        print("ERROR: DATABASE_URL is not set in backend/.env", file=sys.stderr)
        sys.exit(1)

    _get_engine()
    from app.db.session import _SessionLocal

    if _SessionLocal is None:
        print("ERROR: Could not create database session", file=sys.stderr)
        sys.exit(1)

    created = 0
    updated = 0
    seen_slugs: set[str] = set()
    session: Session = _SessionLocal()
    try:
        for row in session.query(BlogPost.slug).all():
            seen_slugs.add(row.slug)

        resource_by_module_topic: dict[tuple[str, int], ResourceArticle] = {}
        for article in session.query(ResourceArticle).all():
            data = article.article_data or {}
            module_id = data.get("moduleId") or data.get("module_id")
            topic_order = data.get("topicOrder") if "topicOrder" in data else data.get("topic_order")
            if module_id is not None and topic_order is not None:
                resource_by_module_topic[(str(module_id), int(topic_order))] = article

        for module in LEARNING_MODULES:
            module_id = module["id"]
            category = _category_for_module(module_id)
            for topic_index, title in enumerate(module["topics"]):
                resource = resource_by_module_topic.get((module_id, topic_index))
                slug = resource.slug if resource else _unique_slug(title, seen_slugs)
                existing = session.query(BlogPost).filter(BlogPost.slug == slug).one_or_none()
                if existing is None and resource is None:
                    existing = (
                        session.query(BlogPost)
                        .filter(
                            BlogPost.module_id == module_id,
                            BlogPost.topic_index == topic_index,
                        )
                        .one_or_none()
                    )

                entry = {
                    "slug": slug,
                    "title_en": resource.title_en if resource else title,
                    "title_de": resource.title_de if resource else None,
                    "excerpt_en": resource.excerpt_en if resource else DEFAULT_EXCERPT,
                    "excerpt_de": resource.excerpt_de if resource else None,
                    "body_en": resource.body_en if resource else None,
                    "body_de": resource.body_de if resource else None,
                    "module_id": module_id,
                    "topic_index": topic_index,
                    "category": resource.category if resource else category,
                    "read_minutes": resource.read_minutes if resource else 5,
                    "is_published": True,
                }

                if existing:
                    for key, value in entry.items():
                        setattr(existing, key, value)
                    updated += 1
                    action = "update"
                else:
                    session.add(BlogPost(**entry))
                    created += 1
                    action = "create"
                print(f"  {action}: {slug} ({module_id}[{topic_index}])")

        if dry_run:
            session.rollback()
            print(f"\nDry run: would create {created}, update {updated}")
        else:
            session.commit()
            print(f"\nDone: created {created}, updated {updated}")
        return created + updated
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed blog_posts from Learning Hub topics")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    seed_blogs(dry_run=args.dry_run)


if __name__ == "__main__":
    main()
