import { parseApiError, parseJsonResponse } from "@/lib/api/apiBase";

export type LeadPayload = {
  full_name: string;
  email: string;
  phone?: string;
  nursing_qualification: string;
  german_level: string;
  timeline: string;
  message?: string;
  source?: string;
  locale?: string;
  whatsapp_joined?: boolean;
};

function apiBase(): string {
  const base = import.meta.env.VITE_API_URL as string | undefined;
  if (base) return `${base.replace(/\/$/, "")}/api/leads`;
  return "/api/leads";
}

export async function submitLead(payload: LeadPayload): Promise<{ id: string; status: string }> {
  const res = await fetch(apiBase(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await parseApiError(res));
  const data = await parseJsonResponse<{ id?: string; status?: string }>(res);
  if (!data.id) throw new Error("Invalid response from server");
  return { id: data.id, status: data.status ?? "new" };
}
