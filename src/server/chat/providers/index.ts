import type { ChatEnv, ChatMessage } from "../types";
import { chatGemini } from "./gemini";
import { chatOpenAI } from "./openai";

export type ProviderChatParams = {
  env: ChatEnv;
  systemPrompt: string;
  messages: ChatMessage[];
};

export async function runChatProvider(params: ProviderChatParams): Promise<string> {
  const provider = (params.env.CHAT_PROVIDER ?? "gemini").toLowerCase();

  if (provider === "openai") {
    const apiKey = params.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");
    const model = params.env.OPENAI_MODEL ?? "gpt-4o-mini";
    return chatOpenAI({
      apiKey,
      model,
      systemPrompt: params.systemPrompt,
      messages: params.messages,
    });
  }

  if (provider === "gemini") {
    const apiKey = params.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");
    const model = params.env.GEMINI_MODEL ?? "gemini-2.0-flash";
    return chatGemini({
      apiKey,
      model,
      systemPrompt: params.systemPrompt,
      messages: params.messages,
    });
  }

  throw new Error(`Unknown CHAT_PROVIDER "${provider}". Use "openai" or "gemini".`);
}
