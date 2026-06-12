export type ChatMode = "pathway" | "scholarship";

export type ChatApiMessage = {
  role: "user" | "assistant";
  content: string;
};

export class ChatUpgradeError extends Error {
  upgradeTier: string;
  pricingUrl: string;

  constructor(message: string, upgradeTier: string, pricingUrl: string) {
    super(message);
    this.name = "ChatUpgradeError";
    this.upgradeTier = upgradeTier;
    this.pricingUrl = pricingUrl;
  }
}

function chatApiUrl(): string {
  const base = import.meta.env.VITE_API_URL as string | undefined;
  if (base) return `${base.replace(/\/$/, "")}/api/chat`;
  return "/api/chat";
}

export async function fetchChatReply(params: {
  mode: ChatMode;
  messages: ChatApiMessage[];
  scholarshipSlug?: string;
  attachmentNames?: string[];
  locale?: string;
  sessionId?: string;
}): Promise<string> {
  const res = await fetch(chatApiUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...params,
      sessionId: params.sessionId,
    }),
  });

  const data = (await res.json()) as {
    reply?: string;
    error?: string;
    upgradeTier?: string;
    pricingUrl?: string;
    detail?: string;
  };

  if (!res.ok) {
    if (res.status === 402 && data.error) {
      throw new ChatUpgradeError(
        data.error,
        data.upgradeTier ?? "essential",
        data.pricingUrl ?? "/pricing",
      );
    }
    throw new Error(data.error ?? data.detail ?? `Chat request failed (${res.status})`);
  }

  if (!data.reply) {
    throw new Error(data.error ?? "No reply from assistant");
  }

  return data.reply;
}
