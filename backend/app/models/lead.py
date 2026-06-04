from pydantic import BaseModel, EmailStr, Field


class LeadCreate(BaseModel):
    full_name: str = Field(min_length=2, max_length=200)
    email: EmailStr
    phone: str | None = Field(default=None, max_length=40)
    nursing_qualification: str = Field(default="unspecified", max_length=120)
    german_level: str = Field(min_length=1, max_length=40)
    timeline: str = Field(min_length=1, max_length=120)
    message: str | None = Field(default=None, max_length=2000)
    source: str = Field(default="homepage", max_length=60)
    locale: str = Field(default="en", pattern="^(en|de)$")
    whatsapp_joined: bool = False


class LeadResponse(BaseModel):
    id: str
    status: str
    message: str = "Thank you for registering your interest. Our team will be in touch soon."
