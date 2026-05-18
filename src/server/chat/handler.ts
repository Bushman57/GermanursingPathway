import { buildSystemPrompt } from "./prompts";
import { runChatProvider } from "./providers";
import type { ChatEnv, ChatMessage, ChatMode, ChatRequestBody } from "./types";

const MAX_MESSAGES = 20;
const MAX_CONTENT_LENGTH = 2000;

function getChatEnv(): ChatEnv {
  return {
    CHAT_PROVIDER: process.env.CHAT_PROVIDER,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_MODEL: process.env.OPENAI_MODEL,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GEMINI_MODEL: process.env.GEMINI_MODEL,
  };
}

function validateBody(body: unknown): ChatRequestBody {
  if (!body || typeof body !== "object") throw new Error("Invalid request body");

  const { mode, messages, scholarshipSlug, attachmentNames } = body as ChatRequestBody;

  if (mode !== "pathway" && mode !== "scholarship") {
    throw new Error('mode must be "pathway" or "scholarship"');
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error("messages must be a non-empty array");
  }

  if (messages.length > MAX_MESSAGES) {
    throw new Error(`Too many messages (max ${MAX_MESSAGES})`);
  }

  for (const m of messages) {
    if (!m || (m.role !== "user" && m.role !== "assistant")) {
      throw new Error("Each message must have role user or assistant");
    }
    if (typeof m.content !== "string" || !m.content.trim()) {
      throw new Error("Each message must have non-empty content");
    }
    if (m.content.length > MAX_CONTENT_LENGTH) {
      throw new Error(`Message too long (max ${MAX_CONTENT_LENGTH} characters)`);
    }
  }

  return {
    mode: mode as ChatMode,
    messages: messages as ChatMessage[],
    scholarshipSlug: typeof scholarshipSlug === "string" ? scholarshipSlug : undefined,
    attachmentNames: Array.isArray(attachmentNames) ?
        attachmentNames.filter((n): n is string => typeof n === "string")
      : undefined,
  };
}

export async function handleChatRequest(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = validateBody(await request.json());
    const env = getChatEnv();

    const systemPrompt = buildSystemPrompt(body.mode, {
      scholarshipSlug: body.scholarshipSlug,
      attachmentNames: body.attachmentNames,
    });

    const reply = await runChatProvider({
      env,
      systemPrompt,
      messages: body.messages,
    });

    return Response.json({ reply });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Chat request failed";
    const isConfig =
      message.includes("API_KEY") || message.includes("CHAT_PROVIDER") || message.includes("Unknown CHAT_PROVIDER");
    const status = isConfig ? 503 : message.startsWith("mode") || message.includes("messages") ? 400 : 502;
    return Response.json({ error: message }, { status });
  }
}
