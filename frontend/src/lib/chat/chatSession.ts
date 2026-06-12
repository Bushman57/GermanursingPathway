const STORAGE_KEY = "gnp_chat_session_id";

function uid(): string {
  return crypto.randomUUID();
}

export function getChatSessionId(): string {
  if (typeof sessionStorage === "undefined") return uid();
  let id = sessionStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = uid();
    sessionStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}
