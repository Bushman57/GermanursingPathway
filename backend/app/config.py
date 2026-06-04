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
    admin_api_secret: str = ""

    jwt_secret: str = ""
    jwt_expire_minutes: int = 10080
    otp_expire_minutes: int = 10
    otp_max_attempts: int = 5
    otp_requests_per_hour: int = 3
    otp_email_from: str = "noreply@example.com"
    otp_support_email: str = ""
    public_site_url: str = ""
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_use_tls: bool = True
    smtp_use_ssl: bool = False
    resend_api_key: str = ""
    portal_cookie_secure: bool = False
    portal_cookie_name: str = "portal_session"

    paystack_secret_key: str = ""
    paystack_public_key: str = ""
    paystack_callback_base_url: str = ""
    payment_amount_kes: int = 0
    payment_currency_label: str = "KES"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def payment_amount_subunits(self) -> int:
        return self.payment_amount_kes * 100

    @property
    def paystack_callback_url(self) -> str:
        base = self.paystack_callback_base_url.rstrip("/")
        return f"{base}/api/payments/paystack/callback"

    @property
    def paystack_webhook_url(self) -> str:
        base = self.paystack_callback_base_url.rstrip("/")
        return f"{base}/api/payments/paystack/webhook"

    @property
    def portal_auth_configured(self) -> bool:
        return bool(self.jwt_secret.strip() and self.database_url)

    @property
    def smtp_configured(self) -> bool:
        return bool(self.smtp_host.strip())

    @property
    def otp_email_configured(self) -> bool:
        return self.smtp_configured or bool(self.resend_api_key.strip())

    @property
    def paystack_payments_configured(self) -> bool:
        return bool(
            self.paystack_secret_key.strip()
            and self.paystack_public_key.strip()
            and self.paystack_callback_base_url.strip()
            and self.payment_amount_kes > 0
        )


@lru_cache
def get_settings() -> Settings:
    return Settings()
