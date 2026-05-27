"""Allowed values for scholarship questionnaire fields (mirror frontend scholarshipFieldOptions)."""

from __future__ import annotations

from typing import Any

PROGRAM_TYPES = frozenset(
    {
        "ausbildung",
        "nursing_scholarship",
        "caregiver_pathway",
        "internship",
        "vocational_training",
        "other",
    }
)

VERIFICATION_STATUS = frozenset({"yes", "no", "pending"})
DATA_VERIFICATION_STATUS = frozenset({"draft", "under_review", "approved", "rejected", "needs_update"})
APPLICATION_STATUS = frozenset({"open", "closing_soon", "closed", "upcoming", "suspended"})
DEGREE_LEVELS = frozenset(
    {"certificate", "vocational_training", "professional_training", "not_specified"}
)
FUNDING_TYPES = frozenset(
    {
        "fully_funded",
        "partially_funded",
        "self_sponsored",
        "paid_training",
        "salary_based",
        "scholarship_plus_salary",
    }
)
GERMAN_LEVELS = frozenset({"none", "a1", "a2", "b1", "b2", "c1", "flexible", "to_be_provided"})
VISA_SPONSORSHIP = frozenset({"yes", "no", "not_specified"})
ACCOMMODATION_SUPPORT = frozenset(
    {
        "free_accommodation",
        "subsidized_accommodation",
        "accommodation_assistance",
        "no_accommodation",
        "not_specified",
    }
)
INTAKE_MONTHS = frozenset(
    {
        "january",
        "february",
        "march",
        "april",
        "may",
        "june",
        "july",
        "august",
        "september",
        "october",
        "november",
        "december",
    }
)
PROGRAM_DURATIONS = frozenset(
    {
        "less_than_1_year",
        "1_year",
        "2_years",
        "3_years",
        "3_5_years",
        "4_years",
        "flexible",
    }
)
RECOGNITION_SUPPORT = frozenset(
    {
        "full_recognition_support",
        "partial_recognition_support",
        "no_recognition_support",
        "not_applicable",
    }
)
INTERVIEW_REQUIRED = frozenset({"yes", "no", "maybe"})
APPLICATION_METHODS = frozenset(
    {
        "online_portal",
        "email_application",
        "agency_application",
        "direct_institution",
        "physical_submission",
        "hybrid",
    }
)
PROVIDER_TYPES = frozenset(
    {
        "hospital",
        "university",
        "nursing_school",
        "government_institution",
        "ngo",
        "private_company",
        "recruitment_agency",
        "elderly_care_facility",
    }
)
LANGUAGES_OF_INSTRUCTION = frozenset({"german", "german_english", "other"})
TARGET_APPLICANTS = frozenset(
    {
        "high_school_graduates",
        "diploma_holders",
        "degree_holders",
        "nurses",
        "caregivers",
        "international_students",
        "kenyan_applicants",
        "african_applicants",
        "fresh_graduates",
    }
)
SCHOLARSHIP_BENEFITS = frozenset(
    {
        "monthly_stipend",
        "tuition_coverage",
        "visa_sponsorship",
        "flight_ticket",
        "free_accommodation",
        "health_insurance",
        "german_classes",
        "relocation_support",
        "meal_allowance",
        "paid_internship",
        "employment_guarantee",
    }
)
REQUIRED_DOCUMENTS = frozenset(
    {
        "passport",
        "cv_resume",
        "academic_certificates",
        "transcripts",
        "recommendation_letter",
        "motivation_letter",
        "german_certificate",
        "english_certificate",
        "police_clearance",
        "medical_report",
        "birth_certificate",
        "passport_photo",
    }
)
SCHOLARSHIP_TAGS = frozenset(
    {
        "nursing",
        "ausbildung",
        "fully_funded",
        "germany",
        "caregiver",
        "paid_training",
        "english_friendly",
        "visa_sponsored",
        "pr_pathway",
        "no_ielts",
        "b1_required",
        "healthcare",
        "international_students",
        "eu_opportunity",
        "urgent_intake",
    }
)

# camelCase API key -> (snake_case column or None for JSONB-only)
COLUMN_FIELD_MAP: dict[str, str] = {
    "verificationStatus": "verification_status",
    "dataVerificationStatus": "data_verification_status",
    "applicationStatus": "application_status",
    "degreeLevel": "degree_level",
    "germanLevelRequired": "german_level_required",
    "visaSponsorship": "visa_sponsorship",
    "accommodationSupport": "accommodation_support",
    "intakeMonth": "intake_month",
    "programDuration": "program_duration",
    "recognitionSupport": "recognition_support",
    "interviewRequired": "interview_required",
    "applicationMethod": "application_method",
    "providerType": "provider_type",
}

SNAKE_TO_CAMEL = {v: k for k, v in COLUMN_FIELD_MAP.items()}

ENUM_FIELDS: dict[str, frozenset[str]] = {
    "programType": PROGRAM_TYPES,
    "verificationStatus": VERIFICATION_STATUS,
    "dataVerificationStatus": DATA_VERIFICATION_STATUS,
    "applicationStatus": APPLICATION_STATUS,
    "degreeLevel": DEGREE_LEVELS,
    "funding": FUNDING_TYPES,
    "germanLevelRequired": GERMAN_LEVELS,
    "visaSponsorship": VISA_SPONSORSHIP,
    "accommodationSupport": ACCOMMODATION_SUPPORT,
    "intakeMonth": INTAKE_MONTHS,
    "programDuration": PROGRAM_DURATIONS,
    "recognitionSupport": RECOGNITION_SUPPORT,
    "interviewRequired": INTERVIEW_REQUIRED,
    "applicationMethod": APPLICATION_METHODS,
    "providerType": PROVIDER_TYPES,
}

ARRAY_ENUM_FIELDS: dict[str, frozenset[str]] = {
    "languagesOfInstruction": LANGUAGES_OF_INSTRUCTION,
    "targetApplicants": TARGET_APPLICANTS,
    "benefits": SCHOLARSHIP_BENEFITS,
    "requiredDocuments": REQUIRED_DOCUMENTS,
    "tags": SCHOLARSHIP_TAGS,
}

# Keys stored in columns + legacy column keys — excluded from program_data blob
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
        *COLUMN_FIELD_MAP.keys(),
    }
)


def _check_enum(field: str, value: str) -> None:
    allowed = ENUM_FIELDS.get(field)
    if allowed is not None and value not in allowed:
        raise ValueError(f"Invalid {field}: {value!r}")


def _check_array(field: str, values: list[Any]) -> None:
    allowed = ARRAY_ENUM_FIELDS.get(field)
    # Backward compatibility: older DB rows may contain free-text benefits/documents
    # from when these fields were edited as plain text. We still enforce list-of-strings,
    # but do not restrict to the enum set for these two fields.
    if field in {"benefits", "requiredDocuments"}:
        for item in values:
            if not isinstance(item, str):
                raise ValueError(f"{field} must be a list of strings")
            if not item.strip():
                raise ValueError(f"{field} items must not be empty")
        return

    if allowed is None:
        return
    for item in values:
        if not isinstance(item, str):
            raise ValueError(f"{field} must be a list of strings")
        if item not in allowed:
            raise ValueError(f"Invalid {field} item: {item!r}")


def validate_scholarship_questionnaire(body: dict[str, Any]) -> dict[str, Any]:
    """Validate enum fields; sync verified from verificationStatus."""
    out = dict(body)

    vstatus = out.get("verificationStatus")
    if vstatus is not None:
        _check_enum("verificationStatus", str(vstatus))
        out["verified"] = vstatus == "yes"

    for field in ENUM_FIELDS:
        if field == "verificationStatus":
            continue
        val = out.get(field)
        if val is not None and str(val).strip():
            _check_enum(field, str(val).strip())

    for field in ARRAY_ENUM_FIELDS:
        val = out.get(field)
        if val is None:
            continue
        if not isinstance(val, list):
            raise ValueError(f"{field} must be a list")
        _check_array(field, val)

    return out
