import json
from pathlib import Path

from app.config import get_settings

BACKEND_ROOT = Path(__file__).resolve().parents[2]
PROMPTS_DIR = BACKEND_ROOT / "prompts"
DATA_DIR = BACKEND_ROOT / "data"

_cache: dict[str, str] = {}


def _read_prompt(relative: str) -> str:
    settings = get_settings()
    if settings.prompt_reload or relative not in _cache:
        path = PROMPTS_DIR / relative
        _cache[relative] = path.read_text(encoding="utf-8").strip()
    return _cache[relative]


def _scholarship_summary(entry: dict) -> dict:
    return {
        "slug": entry["slug"],
        "title": entry["title"],
        "provider": entry["provider"],
        "degreeLevel": entry["degreeLevel"],
        "funding": entry["funding"],
        "deadline": entry["deadline"],
        "location": entry["location"],
        "shortDescription": entry["shortDescription"],
        "eligibleCountries": entry["eligibleCountries"],
        "category": entry["category"],
        "eligibility": entry["eligibility"],
        "benefits": entry["benefits"],
        "requiredDocuments": entry["requiredDocuments"],
        "officialLink": entry["officialLink"],
    }


def _load_scholarships_from_db() -> list[dict] | None:
    settings = get_settings()
    if not settings.database_url:
        return None
    try:
        from app.db.models import Scholarship
        from app.db.session import _get_engine
        from app.services.scholarship_mapper import row_to_public

        _get_engine()
        from app.db.session import _SessionLocal

        if _SessionLocal is None:
            return None
        session = _SessionLocal()
        try:
            rows = session.query(Scholarship).order_by(Scholarship.title_en).all()
            return [row_to_public(r) for r in rows]
        finally:
            session.close()
    except Exception:
        return None


def build_scholarship_context(scholarship_slug: str | None = None) -> str:
    scholarships = _load_scholarships_from_db()
    if scholarships is None:
        path = DATA_DIR / "scholarships.json"
        scholarships = json.loads(path.read_text(encoding="utf-8"))
    focus = next((s for s in scholarships if s["slug"] == scholarship_slug), None) if scholarship_slug else None
    payload = {
        "focusScholarship": _scholarship_summary(focus) if focus else None,
        "scholarships": [_scholarship_summary(s) for s in scholarships],
        "linkPattern": "/scholarships/{slug}",
    }
    return json.dumps(payload, indent=2)


def build_system_prompt(
    mode: str,
    scholarship_slug: str | None = None,
    attachment_names: list[str] | None = None,
    locale: str = "en",
) -> str:
    lang_note = (
        "\n\nRespond in German (formal Sie) — the user selected Deutsch."
        if locale.startswith("de")
        else "\n\nRespond in English."
    )
    lead_note = "\nFor serious candidates, suggest registering at /register (not a guaranteed placement)."

    if mode == "pathway":
        rules = _read_prompt("pathway/system_rules.md")
        knowledge = _read_prompt("pathway/knowledge.md")
        return f"{rules}\n\n---\nKNOWLEDGE BASE:\n{knowledge}{lang_note}{lead_note}"

    rules = _read_prompt("scholarship/system_rules.md")
    context = build_scholarship_context(scholarship_slug)
    attachment_note = ""
    if attachment_names:
        attachment_note = f"\n\nUser attached files (names only): {', '.join(attachment_names)}"
    return f"{rules}\n\n---\nSCHOLARSHIP DATA (JSON):\n{context}{attachment_note}{lang_note}"
