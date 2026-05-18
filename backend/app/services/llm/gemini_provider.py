import httpx

from app.models.chat import ChatMessage


async def chat_gemini(
    *,
    api_key: str,
    model: str,
    system_prompt: str,
    messages: list[ChatMessage],
) -> str:
    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"{model}:generateContent?key={api_key}"
    )
    contents = [
        {
            "role": "model" if m.role == "assistant" else "user",
            "parts": [{"text": m.content}],
        }
        for m in messages
    ]
    payload = {
        "systemInstruction": {"parts": [{"text": system_prompt}]},
        "contents": contents,
        "generationConfig": {"temperature": 0.4, "maxOutputTokens": 1024},
    }
    async with httpx.AsyncClient(timeout=60.0) as client:
        res = await client.post(url, json=payload)
    if res.status_code >= 400:
        raise RuntimeError(f"Gemini error {res.status_code}: {res.text[:300]}")
    data = res.json()
    parts = (data.get("candidates") or [{}])[0].get("content", {}).get("parts") or []
    text = "".join(p.get("text", "") for p in parts).strip()
    if not text:
        raise RuntimeError("Gemini returned an empty response")
    return text
