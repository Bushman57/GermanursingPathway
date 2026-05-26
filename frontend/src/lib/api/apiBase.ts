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

export async function parseApiError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string; detail?: string };
    return data.error ?? data.detail ?? `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
}
