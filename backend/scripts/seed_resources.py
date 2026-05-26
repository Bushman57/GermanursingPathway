"""
Seed resource_articles from the initial site content.

Run from repo root:
  npm run db:seed-resources

Or from backend/:
  python scripts/seed_resources.py
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]

DEFAULT_ARTICLES = [
    {
        "slug": "german-a1-a2-for-nurses",
        "title_en": "German A1–A2 for Nurses: Where to Start",
        "title_de": "Deutsch A1–A2 für Pflegekräfte: Der Einstieg",
        "excerpt_en": "A practical study plan for healthcare professionals beginning German — certificates, timelines, and what schools expect.",
        "excerpt_de": "Ein praktischer Lernplan für Gesundheitsfachkräfte — Zertifikate, Zeitpläne und Erwartungen der Schulen.",
        "body_en": "",
        "body_de": "",
        "category": "language",
        "read_minutes": 6,
        "sort_order": 0,
    },
    {
        "slug": "nursing-visa-germany-checklist",
        "title_en": "Nursing Visa for Germany: Document Checklist",
        "title_de": "Pflege-Visum für Deutschland: Dokumenten-Checkliste",
        "excerpt_en": "The core documents Kenyan nurses need before an embassy appointment — and how to avoid common delays.",
        "excerpt_de": "Die Kernunterlagen für kenianische Pflegekräfte vor dem Botschaftstermin — und typische Verzögerungen.",
        "body_en": "",
        "body_de": "",
        "category": "visa",
        "read_minutes": 8,
        "sort_order": 1,
    },
    {
        "slug": "ausbildung-vs-scholarship",
        "title_en": "Ausbildung vs. Scholarship: Which Path Fits You?",
        "title_de": "Ausbildung vs. Stipendium: Welcher Weg passt?",
        "excerpt_en": "Compare vocational apprenticeship routes and scholarship placements — eligibility, earnings, and timelines.",
        "excerpt_de": "Vergleich von Ausbildung und Stipendienplatzierungen — Voraussetzungen, Verdienst und Zeitrahmen.",
        "body_en": "",
        "body_de": "",
        "category": "guide",
        "read_minutes": 7,
        "sort_order": 2,
    },
    {
        "slug": "candidate-story-nairobi-to-berlin",
        "title_en": "Candidate Story: From Nairobi to Berlin",
        "title_de": "Kandidatengeschichte: Von Nairobi nach Berlin",
        "excerpt_en": "How one Kenyan CNA navigated language training, school matching, and her first months in a German hospital.",
        "excerpt_de": "Wie eine kenianische Pflegeassistentin Sprache, Schulmatching und die ersten Monate im Klinikalltag meisterte.",
        "body_en": "",
        "body_de": "",
        "category": "story",
        "read_minutes": 5,
        "sort_order": 3,
    },
    {
        "slug": "anmeldung-first-week",
        "title_en": "Anmeldung & First Week in Germany",
        "title_de": "Anmeldung & erste Woche in Deutschland",
        "excerpt_en": "Registration, insurance, banking, and transport — a newcomer checklist for healthcare workers.",
        "excerpt_de": "Anmeldung, Versicherung, Bank und Verkehr — eine Checkliste für neu angekommene Fachkräfte.",
        "body_en": "",
        "body_de": "",
        "category": "guide",
        "read_minutes": 6,
        "sort_order": 4,
    },
]


def seed_resources(*, dry_run: bool = False) -> int:
    sys.path.insert(0, str(BACKEND_ROOT))

    from sqlalchemy.orm import Session

    from app.config import get_settings
    from app.db.models import ResourceArticle
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
    session: Session = _SessionLocal()
    try:
        for entry in DEFAULT_ARTICLES:
            existing = session.query(ResourceArticle).filter(ResourceArticle.slug == entry["slug"]).one_or_none()
            if existing:
                for key, value in entry.items():
                    setattr(existing, key, value or None)
                existing.is_published = True
                updated += 1
                action = "update"
            else:
                session.add(ResourceArticle(**entry, is_published=True))
                created += 1
                action = "create"
            print(f"  {action}: {entry['slug']}")

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
    parser = argparse.ArgumentParser(description="Seed resource_articles table")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    seed_resources(dry_run=args.dry_run)


if __name__ == "__main__":
    main()
