"""Map scholarship DB rows ↔ public/admin JSON (camelCase frontend shape)."""

from __future__ import annotations

from datetime import date, datetime
from typing import TYPE_CHECKING, Any

from app.schemas.scholarship_fields import COLUMN_FIELD_MAP, COLUMN_KEYS

if TYPE_CHECKING:
    from app.db.models import Scholarship

JSONB_ARRAY_KEYS = frozenset(
    {
        "languagesOfInstruction",
        "targetApplicants",
        "benefits",
        "requiredDocuments",
        "tags",
        "benefitsDe",
        "eligibilityDe",
        "requiredDocumentsDe",
        "applicationProcessDe",
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


def _str_field(entry: dict[str, Any], key: str, max_len: int) -> str | None:
    val = entry.get(key)
    if val is None or not str(val).strip():
        return None
    return str(val).strip()[:max_len]


def _verification_from_entry(entry: dict[str, Any]) -> tuple[bool, str | None]:
    vstatus = entry.get("verificationStatus")
    if vstatus is not None and str(vstatus).strip():
        status = str(vstatus).strip()[:20]
        return status == "yes", status
    verified = bool(entry.get("verified", False))
    return verified, ("yes" if verified else "no")


def program_data_from_entry(entry: dict[str, Any]) -> dict[str, Any]:
    return {k: v for k, v in entry.items() if k not in COLUMN_KEYS}


def entry_to_row(entry: dict[str, Any]) -> dict[str, Any]:
    slug = entry.get("slug")
    if not slug:
        raise ValueError("Scholarship entry missing slug")

    program_type = entry.get("programType") or "other"
    title = entry.get("title") or slug
    short_description = entry.get("shortDescription") or ""
    verified, verification_status = _verification_from_entry(entry)

    row: dict[str, Any] = {
        "slug": str(slug),
        "program_type": str(program_type)[:60],
        "title_en": str(title)[:300],
        "title_de": (str(entry["titleDe"])[:300] if entry.get("titleDe") else None),
        "short_description_en": str(short_description),
        "short_description_de": (str(entry["shortDescriptionDe"]) if entry.get("shortDescriptionDe") else None),
        "funding": _str_field(entry, "funding", 80),
        "deadline": parse_deadline(entry.get("deadline")),
        "verified": verified,
        "verification_status": verification_status,
        "data_verification_status": _str_field(entry, "dataVerificationStatus", 30),
        "application_status": _str_field(entry, "applicationStatus", 30),
        "degree_level": _str_field(entry, "degreeLevel", 60),
        "german_level_required": _str_field(entry, "germanLevelRequired", 30),
        "visa_sponsorship": _str_field(entry, "visaSponsorship", 20),
        "accommodation_support": _str_field(entry, "accommodationSupport", 40),
        "intake_month": _str_field(entry, "intakeMonth", 20),
        "program_duration": _str_field(entry, "programDuration", 30),
        "recognition_support": _str_field(entry, "recognitionSupport", 40),
        "interview_required": _str_field(entry, "interviewRequired", 10),
        "application_method": _str_field(entry, "applicationMethod", 40),
        "provider_type": _str_field(entry, "providerType", 40),
        "partner_school_id": None,
        "official_link": official_link_from_entry(entry),
        "application_link": application_link_from_entry(entry),
        "program_data": program_data_from_entry(entry),
    }
    return row


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


def _column_to_api(scholarship: Scholarship, camel: str) -> str | None:
    snake = COLUMN_FIELD_MAP.get(camel)
    if not snake:
        return None
    val = getattr(scholarship, snake, None)
    if val is not None and str(val).strip():
        return str(val)
    pd = scholarship.program_data or {}
    legacy = pd.get(camel)
    if legacy is not None and str(legacy).strip():
        return str(legacy)
    return None


def _apply_questionnaire_columns(data: dict[str, Any], scholarship: Scholarship) -> None:
    for camel in COLUMN_FIELD_MAP:
        val = _column_to_api(scholarship, camel)
        if val is not None:
            data[camel] = val

    if scholarship.verification_status:
        data["verificationStatus"] = scholarship.verification_status
    elif scholarship.verified:
        data["verificationStatus"] = "yes"
    else:
        data["verificationStatus"] = data.get("verificationStatus", "no")


def _apply_column_fields(data: dict[str, Any], scholarship: Scholarship) -> None:
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
    elif scholarship.degree_level and not data.get("degreeLevel"):
        pass
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
    _apply_questionnaire_columns(data, scholarship)

    if scholarship.degree_level:
        data["degreeLevel"] = scholarship.degree_level


_SUMMARY_EXTRA_KEYS = (
    "tags",
    "applicationStatus",
    "germanLevelRequired",
    "verificationStatus",
    "intakeMonth",
    "programDuration",
    "visaSponsorship",
    "accommodationSupport",
)


def row_to_public(scholarship: Scholarship, *, include_detail: bool = True) -> dict[str, Any]:
    pd = scholarship.program_data or {}

    if not include_detail:
        data: dict[str, Any] = {
            "slug": scholarship.slug,
            "title": scholarship.title_en,
            "programType": scholarship.program_type,
            "shortDescription": scholarship.short_description_en,
            "verified": scholarship.verified,
            "provider": str(pd.get("provider") or ""),
            "degreeLevel": str(scholarship.degree_level or pd.get("degreeLevel") or ""),
            "funding": str(scholarship.funding or pd.get("funding") or ""),
            "deadline": "",
            "category": str(pd.get("category") or ""),
            "hostCountry": str(pd.get("hostCountry") or ""),
            "officialLink": "",
            "applicationLink": "",
            "tags": pd.get("tags") if isinstance(pd.get("tags"), list) else [],
        }
        for key in (
            "provider",
            "providerDe",
            "degreeLevelDe",
            "fundingDe",
            "category",
            "categoryDe",
            "hostCountry",
            "deadlineDe",
            *_SUMMARY_EXTRA_KEYS,
        ):
            if key in pd and pd[key] and key not in data:
                data[key] = pd[key]
        _apply_column_fields(data, scholarship)
        return data

    data = {
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
        "languagesOfInstruction": [],
        "targetApplicants": [],
        "tags": [],
        "officialLink": "",
        "applicationLink": "",
        **pd,
    }
    for camel in COLUMN_FIELD_MAP:
        data.pop(camel, None)
    _apply_column_fields(data, scholarship)
    if scholarship.degree_level:
        data["degreeLevel"] = scholarship.degree_level
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
    scholarship.verification_status = row["verification_status"]
    scholarship.data_verification_status = row["data_verification_status"]
    scholarship.application_status = row["application_status"]
    scholarship.degree_level = row["degree_level"]
    scholarship.german_level_required = row["german_level_required"]
    scholarship.visa_sponsorship = row["visa_sponsorship"]
    scholarship.accommodation_support = row["accommodation_support"]
    scholarship.intake_month = row["intake_month"]
    scholarship.program_duration = row["program_duration"]
    scholarship.recognition_support = row["recognition_support"]
    scholarship.interview_required = row["interview_required"]
    scholarship.application_method = row["application_method"]
    scholarship.provider_type = row["provider_type"]
    scholarship.official_link = row.get("official_link")
    scholarship.application_link = row.get("application_link")
    scholarship.program_data = row["program_data"]
