from typing import Any

from pydantic import BaseModel, Field


class ScholarshipPayload(BaseModel):
    """Full scholarship document (camelCase, matches frontend / scholarships.json)."""

    slug: str = Field(min_length=1, max_length=120)
    title: str = Field(min_length=1, max_length=300)
    programType: str = Field(default="other", max_length=60)
    shortDescription: str = Field(min_length=1)
    verified: bool = False
    titleDe: str | None = None
    shortDescriptionDe: str | None = None
    funding: str | None = None
    deadline: str | None = None
    provider: str | None = None
    degreeLevel: str | None = None
    location: str | None = None
    about: str | None = None
    hostCountry: str | None = None
    studyIn: str | None = None
    category: str | None = None
    eligibleCountries: str | None = None
    benefits: list[str] | None = None
    eligibility: list[str] | None = None
    requiredDocuments: list[str] | None = None
    applicationProcess: list[str] | None = None
    officialLink: str | None = None
    applicationLink: str | None = None

    model_config = {"extra": "allow"}

    def to_entry(self) -> dict[str, Any]:
        return self.model_dump(exclude_none=False)
