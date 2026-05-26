"""Map scholarship DB rows ↔ public/admin JSON (camelCase frontend shape)."""

from __future__ import annotations

from datetime import date, datetime
from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from app.db.models import Scholarship

COLUMN_KEYS = frozenset(
    {
        "slug",
        "title",
        "titleDe",
        "programType",
        "shortDescription",
        "shortDescriptionDe",
        "funding",
        "verified",
        "deadline",
        "officialLink",
        "official_link",
        "applicationLink",
        "application_link",
    }
)


def _is_http_url(value: str) -> bool:
    lower = value.lower()
    return lower.startswith("http://") or lower.startswith("https://") or lower.startswith("www.")


def application_link_from_entry(entry: dict[str, Any]) -> str | None:
    link = entry.get("applicationLink") or entry.get("application_link")
    if link and str(link).strip():
        return str(link).strip()[:500]
    off = entry.get("officialLink") or entry.get("official_link")
    if off and str(off).strip():
        stripped = str(off).strip()
        if stripped.startswith("/") or not _is_http_url(stripped):
            return stripped[:500]
    return None


def official_link_from_entry(entry: dict[str, Any]) -> str | None:
    link = entry.get("officialLink") or entry.get("official_link")
    if not link or not str(link).strip():
        return None
    stripped = str(link).strip()[:500]
    if stripped.startswith("/") or not _is_http_url(stripped):
        return None
    return stripped

SLUG_PATTERN = r"^[a-z0-9]+(?:-[a-z0-9]+)*$"


def parse_deadline(value: str | None) -> date | None:
    if not value or not isinstance(value, str):
        return None
    text = value.strip()
    for fmt in ("%d %B %Y", "%d %b %Y", "%Y-%m-%d"):
        try:
            return datetime.strptime(text, fmt).date()
        except ValueError:
            continue
    return None


def format_deadline(value: date | None) -> str | None:
    if value is None:
        return None
    return value.strftime("%d %B %Y")


def program_data_from_entry(entry: dict[str, Any]) -> dict[str, Any]:
    return {k: v for k, v in entry.items() if k not in COLUMN_KEYS}


def entry_to_row(entry: dict[str, Any]) -> dict[str, Any]:
    slug = entry.get("slug")
    if not slug:
        raise ValueError("Scholarship entry missing slug")

    program_type = entry.get("programType") or "other"
    title = entry.get("title") or slug
    short_description = entry.get("shortDescription") or ""

    return {
        "slug": str(slug),
        "program_type": str(program_type)[:60],
        "title_en": str(title)[:300],
        "title_de": (str(entry["titleDe"])[:300] if entry.get("titleDe") else None),
        "short_description_en": str(short_description),
        "short_description_de": (str(entry["shortDescriptionDe"]) if entry.get("shortDescriptionDe") else None),
        "funding": (str(entry["funding"])[:80] if entry.get("funding") else None),
        "deadline": parse_deadline(entry.get("deadline")),
        "verified": bool(entry.get("verified", False)),
        "partner_school_id": None,
        "official_link": official_link_from_entry(entry),
        "application_link": application_link_from_entry(entry),
        "program_data": program_data_from_entry(entry),
    }


def _effective_official_link(scholarship: Scholarship) -> str | None:
    if scholarship.official_link:
        return scholarship.official_link
    pd = scholarship.program_data or {}
    legacy = pd.get("officialLink") or pd.get("official_link")
    if legacy and str(legacy).strip():
        return str(legacy).strip()[:500]
    return None


def _effective_application_link(scholarship: Scholarship) -> str | None:
    if scholarship.application_link:
        return scholarship.application_link
    pd = scholarship.program_data or {}
    legacy = pd.get("applicationLink") or pd.get("application_link")
    if legacy and str(legacy).strip():
        return str(legacy).strip()[:500]
    return None


def row_to_public(scholarship: Scholarship) -> dict[str, Any]:
    data: dict[str, Any] = {
        "provider": "",
        "degreeLevel": "",
        "funding": "",
        "deadline": "",
        "location": "",
        "about": "",
        "hostCountry": "",
        "studyIn": "",
        "category": "",
        "eligibleCountries": "",
        "benefits": [],
        "eligibility": [],
        "requiredDocuments": [],
        "applicationProcess": [],
        "officialLink": "",
        "applicationLink": "",
        **(scholarship.program_data or {}),
    }
    data["slug"] = scholarship.slug
    data["title"] = scholarship.title_en
    if scholarship.title_de:
        data["titleDe"] = scholarship.title_de
    data["programType"] = scholarship.program_type
    data["shortDescription"] = scholarship.short_description_en
    if scholarship.short_description_de:
        data["shortDescriptionDe"] = scholarship.short_description_de
    if scholarship.funding:
        data["funding"] = scholarship.funding
    data["verified"] = scholarship.verified
    deadline = format_deadline(scholarship.deadline)
    if deadline:
        data["deadline"] = deadline
    official = _effective_official_link(scholarship)
    if official:
        data["officialLink"] = official
    application = _effective_application_link(scholarship)
    if application:
        data["applicationLink"] = application
    return data


def apply_row_to_model(scholarship: Scholarship, entry: dict[str, Any]) -> None:
    row = entry_to_row(entry)
    scholarship.program_type = row["program_type"]
    scholarship.title_en = row["title_en"]
    scholarship.title_de = row["title_de"]
    scholarship.short_description_en = row["short_description_en"]
    scholarship.short_description_de = row["short_description_de"]
    scholarship.funding = row["funding"]
    scholarship.deadline = row["deadline"]
    scholarship.verified = row["verified"]
    scholarship.official_link = row.get("official_link")
    scholarship.application_link = row.get("application_link")
    scholarship.program_data = row["program_data"]
