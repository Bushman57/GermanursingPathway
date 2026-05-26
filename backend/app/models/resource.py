from typing import Literal

from pydantic import BaseModel, Field


class ResourcePayload(BaseModel):
    slug: str = Field(min_length=1, max_length=120)
    titleEn: str = Field(min_length=1, max_length=300)
    titleDe: str | None = None
    excerptEn: str = Field(min_length=1)
    excerptDe: str | None = None
    bodyEn: str | None = None
    bodyDe: str | None = None
    category: Literal["language", "visa", "story", "guide"]
    readMinutes: int = Field(default=5, ge=1, le=120)
    isPublished: bool = True
    sortOrder: int = 0
