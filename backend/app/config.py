from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    chat_provider: str = "gemini"
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.0-flash"
    cors_origins: str = "http://localhost:8080,http://127.0.0.1:8080"
    prompt_reload: bool = True
    database_url: str = ""

    kcb_consumer_key: str = ""
    kcb_consumer_secret: str = ""
    kcb_api_base: str = "https://uat.buni.kcbgroup.com"
    kcb_org_short_code: str = "522522"
    kcb_shared_short_code: bool = True
    kcb_org_pass_key: str = ""
    kcb_callback_base_url: str = ""
    payment_amount_kes: int = 0
    payment_currency_label: str = "KES"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def kcb_callback_url(self) -> str:
        base = self.kcb_callback_base_url.rstrip("/")
        return f"{base}/api/payments/callback"

    @property
    def kcb_payments_configured(self) -> bool:
        return bool(
            self.kcb_consumer_key
            and self.kcb_consumer_secret
            and self.kcb_callback_base_url
            and self.payment_amount_kes > 0
        )


@lru_cache
def get_settings() -> Settings:
    return Settings()
