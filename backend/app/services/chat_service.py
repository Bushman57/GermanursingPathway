from app.models.chat import ChatRequest
from app.services.llm.factory import run_chat_provider
from app.services.prompt_builder import build_system_prompt


class ChatServiceError(Exception):
    def __init__(self, message: str, status_code: int = 400):
        super().__init__(message)
        self.status_code = status_code


async def generate_reply(body: ChatRequest) -> str:
    system_prompt = build_system_prompt(
        body.mode,
        scholarship_slug=body.scholarshipSlug,
        attachment_names=body.attachmentNames,
        locale=body.locale,
    )
    try:
        return await run_chat_provider(system_prompt=system_prompt, messages=body.messages)
    except ValueError as e:
        msg = str(e)
        if "API_KEY" in msg or "CHAT_PROVIDER" in msg:
            raise ChatServiceError(msg, status_code=503) from e
        raise ChatServiceError(msg, status_code=400) from e
    except RuntimeError as e:
        raise ChatServiceError(str(e), status_code=502) from e
