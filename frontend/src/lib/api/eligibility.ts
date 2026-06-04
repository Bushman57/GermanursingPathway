import { apiRoot, parseApiError } from "@/lib/api/apiBase";

export async function submitEligibilityCheck(body: {
  email?: string;
  payload: Record<string, unknown>;
  score: number;
  status: string;
  locale: string;
}): Promise<void> {
  const root = apiRoot();
  const url = root ? `${root}/api/eligibility/checks` : "/api/eligibility/checks";
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseApiError(res));
}
