from pydantic import BaseModel, EmailStr, Field, field_validator

VALID_TIMELINES = frozenset({"3m", "6m", "2026", "2027", "exploring"})


class LeadCreate(BaseModel):
    full_name: str = Field(min_length=2, max_length=200)
    email: EmailStr
    phone: str = Field(min_length=6, max_length=40)
    nursing_qualification: str = Field(default="unspecified", max_length=120)
    german_level: str = Field(min_length=1, max_length=40)
    timeline: str = Field(min_length=1, max_length=120)
    message: str | None = Field(default=None, max_length=2000)
    source: str = Field(default="homepage", max_length=60)
    locale: str = Field(default="en", pattern="^(en|de)$")
    whatsapp_joined: bool = False
    eligibility_check_id: str | None = Field(default=None, max_length=36)

    @field_validator("phone")
    @classmethod
    def phone_not_blank(cls, value: str) -> str:
        trimmed = value.strip()
        if len(trimmed) < 6:
            raise ValueError("Please enter a valid phone number so we can reach you.")
        return trimmed

    @field_validator("german_level")
    @classmethod
    def german_level_min_a1(cls, value: str) -> str:
        normalized = value.strip().lower()
        if not normalized or normalized == "none":
            raise ValueError("Minimum German level is A1. Please select A1 or higher.")
        return normalized

    @field_validator("timeline")
    @classmethod
    def timeline_required(cls, value: str) -> str:
        trimmed = value.strip()
        if not trimmed or trimmed not in VALID_TIMELINES:
            raise ValueError("Please select when you plan to start.")
        return trimmed


class LeadResponse(BaseModel):
    id: str
    status: str
    message: str = "Thank you for registering your interest. Our team will be in touch soon."
