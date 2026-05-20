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
  const data = (await res.json()) as { id?: string; status?: string; error?: string; detail?: string };
  if (!res.ok) {
    throw new Error(data.error ?? data.detail ?? `Registration failed (${res.status})`);
  }
  if (!data.id) throw new Error("Invalid response from server");
  return { id: data.id, status: data.status ?? "new" };
}
