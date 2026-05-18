export type ChatMode = "pathway" | "scholarship";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ChatRequestBody = {
  mode: ChatMode;
  messages: ChatMessage[];
  scholarshipSlug?: string;
  attachmentNames?: string[];
};

export type ChatEnv = {
  CHAT_PROVIDER?: string;
  OPENAI_API_KEY?: string;
  OPENAI_MODEL?: string;
  GEMINI_API_KEY?: string;
  GEMINI_MODEL?: string;
};
