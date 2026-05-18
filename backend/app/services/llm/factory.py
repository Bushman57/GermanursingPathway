from app.config import Settings, get_settings
from app.models.chat import ChatMessage
from app.services.llm.gemini_provider import chat_gemini
from app.services.llm.openai_provider import chat_openai


async def run_chat_provider(
    *,
    system_prompt: str,
    messages: list[ChatMessage],
    settings: Settings | None = None,
) -> str:
    cfg = settings or get_settings()
    provider = cfg.chat_provider.lower()

    if provider == "openai":
        if not cfg.openai_api_key:
            raise ValueError("OPENAI_API_KEY is not configured")
        return await chat_openai(
            api_key=cfg.openai_api_key,
            model=cfg.openai_model,
            system_prompt=system_prompt,
            messages=messages,
        )

    if provider == "gemini":
        if not cfg.gemini_api_key:
            raise ValueError("GEMINI_API_KEY is not configured")
        return await chat_gemini(
            api_key=cfg.gemini_api_key,
            model=cfg.gemini_model,
            system_prompt=system_prompt,
            messages=messages,
        )

    raise ValueError(f'Unknown CHAT_PROVIDER "{provider}". Use "openai" or "gemini".')
