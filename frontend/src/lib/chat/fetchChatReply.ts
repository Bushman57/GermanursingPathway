export type ChatMode = "pathway" | "scholarship";

export type ChatApiMessage = {
  role: "user" | "assistant";
  content: string;
};

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
}): Promise<string> {
  const res = await fetch(chatApiUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  const data = (await res.json()) as { reply?: string; error?: string; detail?: string };

  if (!res.ok) {
    throw new Error(data.error ?? data.detail ?? `Chat request failed (${res.status})`);
  }

  if (!data.reply) {
    throw new Error(data.error ?? "No reply from assistant");
  }

  return data.reply;
}
