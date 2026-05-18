import httpx

from app.models.chat import ChatMessage


async def chat_openai(
    *,
    api_key: str,
    model: str,
    system_prompt: str,
    messages: list[ChatMessage],
) -> str:
    payload = {
        "model": model,
        "temperature": 0.4,
        "max_tokens": 1024,
        "messages": [
            {"role": "system", "content": system_prompt},
            *[{"role": m.role, "content": m.content} for m in messages],
        ],
    }
    async with httpx.AsyncClient(timeout=60.0) as client:
        res = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json=payload,
        )
    if res.status_code >= 400:
        raise RuntimeError(f"OpenAI error {res.status_code}: {res.text[:300]}")
    data = res.json()
    content = (data.get("choices") or [{}])[0].get("message", {}).get("content", "").strip()
    if not content:
        raise RuntimeError("OpenAI returned an empty response")
    return content
