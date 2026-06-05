import { apiRoot, parseApiError } from "@/lib/api/apiBase";

export type EligibilityResult = {
  id: string;
  score: number;
  status: string;
  gaps: string[];
  payload: Record<string, unknown>;
  source?: string;
  locale?: string;
  createdAt?: string | null;
};

export async function submitEligibilityCheck(body: {
  email?: string;
  payload: Record<string, unknown>;
  score: number;
  status: string;
  gaps?: string[];
  source?: string;
  locale: string;
}): Promise<{ id: string }> {
  const root = apiRoot();
  const url = root ? `${root}/api/eligibility/checks` : "/api/eligibility/checks";
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseApiError(res));
  const data = (await res.json()) as { id?: string };
  if (!data.id) throw new Error("Invalid response from server");
  return { id: data.id };
}

export async function fetchLatestEligibility(email: string): Promise<EligibilityResult | null> {
  const root = apiRoot();
  const base = root ? `${root}/api/eligibility` : "/api/eligibility";
  const res = await fetch(`${base}/latest?email=${encodeURIComponent(email)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(await parseApiError(res));
  return (await res.json()) as EligibilityResult;
}

export async function fetchPortalEligibility(): Promise<EligibilityResult | null> {
  const root = apiRoot();
  const base = root ? `${root}/api/portal` : "/api/portal";
  const res = await fetch(`${base}/eligibility`, { credentials: "include" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(await parseApiError(res));
  return (await res.json()) as EligibilityResult;
}
