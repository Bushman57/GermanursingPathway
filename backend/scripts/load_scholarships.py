"""
Load scholarships from backend/data/scholarships.json into the scholarships table.

Run from repo root:
  npm run db:load-scholarships

Or from backend/:
  python scripts/load_scholarships.py
  python scripts/load_scholarships.py --dry-run
  python scripts/load_scholarships.py --prune-stale
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_JSON = BACKEND_ROOT / "data" / "scholarships.json"

def load_scholarships(
    json_path: Path,
    *,
    dry_run: bool = False,
    prune_stale: bool = False,
) -> int:
    sys.path.insert(0, str(BACKEND_ROOT))

    from sqlalchemy.orm import Session

    from app.config import get_settings
    from app.db.models import Scholarship
    from app.db.session import _get_engine
    from app.services.scholarship_mapper import entry_to_row

    settings = get_settings()
    if not settings.database_url:
        print("ERROR: DATABASE_URL is not set in backend/.env", file=sys.stderr)
        sys.exit(1)

    if not json_path.is_file():
        print(f"ERROR: File not found: {json_path}", file=sys.stderr)
        sys.exit(1)

    raw = json.loads(json_path.read_text(encoding="utf-8"))
    if not isinstance(raw, list):
        print("ERROR: JSON root must be an array of scholarship objects", file=sys.stderr)
        sys.exit(1)

    _get_engine()
    from app.db.session import _SessionLocal

    if _SessionLocal is None:
        print("ERROR: Could not create database session", file=sys.stderr)
        sys.exit(1)

    slugs_in_file: set[str] = set()
    created = 0
    updated = 0

    session: Session = _SessionLocal()
    try:
        for i, entry in enumerate(raw):
            if not isinstance(entry, dict):
                print(f"WARNING: Skipping index {i}: not an object", file=sys.stderr)
                continue
            try:
                row = entry_to_row(entry)
            except ValueError as exc:
                print(f"WARNING: Skipping index {i}: {exc}", file=sys.stderr)
                continue

            slugs_in_file.add(row["slug"])
            existing = session.query(Scholarship).filter(Scholarship.slug == row["slug"]).one_or_none()

            if existing:
                existing.program_type = row["program_type"]
                existing.title_en = row["title_en"]
                existing.title_de = row["title_de"]
                existing.short_description_en = row["short_description_en"]
                existing.short_description_de = row["short_description_de"]
                existing.funding = row["funding"]
                existing.deadline = row["deadline"]
                existing.verified = row["verified"]
                existing.official_link = row.get("official_link")
                existing.application_link = row.get("application_link")
                existing.program_data = row["program_data"]
                updated += 1
                action = "update"
            else:
                session.add(Scholarship(**row))
                created += 1
                action = "create"

            if dry_run:
                print(f"  [{action}] {row['slug']}")
            else:
                print(f"  {action}: {row['slug']}")

        pruned = 0
        if prune_stale and slugs_in_file:
            stale = (
                session.query(Scholarship)
                .filter(Scholarship.slug.notin_(slugs_in_file))
                .all()
            )
            for record in stale:
                if dry_run:
                    print(f"  [prune] {record.slug}")
                else:
                    session.delete(record)
                pruned += 1

        if dry_run:
            session.rollback()
            print(f"\nDry run: would create {created}, update {updated}, prune {pruned}")
        else:
            session.commit()
            print(f"\nDone: created {created}, updated {updated}, pruned {pruned}")

        return created + updated
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def main() -> None:
    parser = argparse.ArgumentParser(description="Load scholarships.json into Postgres")
    parser.add_argument(
        "--file",
        type=Path,
        default=DEFAULT_JSON,
        help=f"Path to JSON file (default: {DEFAULT_JSON})",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print actions without writing to the database",
    )
    parser.add_argument(
        "--prune-stale",
        action="store_true",
        help="Delete DB rows whose slug is not in the JSON file",
    )
    args = parser.parse_args()
    load_scholarships(args.file, dry_run=args.dry_run, prune_stale=args.prune_stale)


if __name__ == "__main__":
    main()
