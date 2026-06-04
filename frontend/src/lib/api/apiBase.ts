export function apiRoot(): string {
  const base = import.meta.env.VITE_API_URL as string | undefined;
  if (base) return base.replace(/\/$/, "");
  return "";
}

export function requireApiRoot(): string {
  const root = apiRoot();
  if (!root) {
    throw new Error("VITE_API_URL is not configured. Set it in frontend/.env to load content from the API.");
  }
  return root;
}

type ApiErrorPayload = {
  error?: string;
  detail?: string | { msg?: string; loc?: unknown[] }[];
};

function messageFromApiPayload(data: ApiErrorPayload, status: number): string {
  if (typeof data.error === "string" && data.error.trim()) return data.error;
  if (typeof data.detail === "string" && data.detail.trim()) return data.detail;
  if (Array.isArray(data.detail) && data.detail.length > 0) {
    const first = data.detail[0];
    if (first && typeof first.msg === "string") return first.msg;
  }
  return `Request failed (${status})`;
}

/** Read response body as JSON; never throws raw SyntaxError from empty/invalid bodies. */
export async function parseJsonResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text.trim()) {
    throw new Error(
      `Server returned an empty response (${res.status}). Check that the API is running and reachable.`,
    );
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(
      `Server returned invalid JSON (${res.status}). Check API URL and proxy settings.`,
    );
  }
}

export async function parseApiError(res: Response): Promise<string> {
  const text = await res.text();
  if (!text.trim()) {
    return `Request failed (${res.status}). The server returned no response body — is the API running?`;
  }
  try {
    return messageFromApiPayload(JSON.parse(text) as ApiErrorPayload, res.status);
  } catch {
    return `Request failed (${res.status})`;
  }
}
