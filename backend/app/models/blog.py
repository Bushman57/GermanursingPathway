from typing import Literal

from pydantic import BaseModel, Field


class BlogPayload(BaseModel):
    slug: str = Field(min_length=1, max_length=120)
    titleEn: str = Field(min_length=1, max_length=300)
    titleDe: str | None = None
    excerptEn: str = Field(min_length=1)
    excerptDe: str | None = None
    bodyEn: str | None = None
    bodyDe: str | None = None
    moduleId: str | None = None
    topicIndex: int | None = Field(default=None, ge=0)
    category: Literal["language", "visa", "story", "guide"]
    author: str | None = Field(default=None, max_length=120)
    readMinutes: int = Field(default=5, ge=1, le=120)
    featuredImageUrl: str | None = None
    externalUrl: str | None = None
    isPublished: bool = True
