import type { Scholarship, ScholarshipSummary } from "@/lib/scholarships";
import { apiRoot, parseApiError } from "@/lib/api/apiBase";

function scholarshipsBase(): string {
  const root = apiRoot();
  return root ? `${root}/api/scholarships` : "/api/scholarships";
}

export type PublicScholarshipFilters = {
  application_status?: string;
  program_type?: string;
  german_level_required?: string;
  intake_month?: string;
};

export async function fetchScholarships(
  filters?: PublicScholarshipFilters,
): Promise<ScholarshipSummary[]> {
  const params = new URLSearchParams();
  if (filters?.application_status) params.set("application_status", filters.application_status);
  if (filters?.program_type) params.set("program_type", filters.program_type);
  if (filters?.german_level_required) {
    params.set("german_level_required", filters.german_level_required);
  }
  if (filters?.intake_month) params.set("intake_month", filters.intake_month);
  const qs = params.toString();
  const res = await fetch(`${scholarshipsBase()}${qs ? `?${qs}` : ""}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error(await parseApiError(res));
  return (await res.json()) as ScholarshipSummary[];
}

export async function fetchScholarshipBySlug(slug: string): Promise<Scholarship> {
  const res = await fetch(`${scholarshipsBase()}/${encodeURIComponent(slug)}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error(await parseApiError(res));
  return (await res.json()) as Scholarship;
}
