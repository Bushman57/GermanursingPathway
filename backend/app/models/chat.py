from typing import Literal

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=2000)


class ChatRequest(BaseModel):
    mode: Literal["pathway", "scholarship"]
    messages: list[ChatMessage] = Field(min_length=1, max_length=20)
    scholarshipSlug: str | None = None
    attachmentNames: list[str] | None = None
    locale: str = "en"


class ChatResponse(BaseModel):
    reply: str


class ErrorResponse(BaseModel):
    error: str
