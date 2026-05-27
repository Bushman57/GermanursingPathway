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
  const qs = params.toString();
  const res = await fetch(`${scholarshipsBase()}${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error(await parseApiError(res));
  return (await res.json()) as ScholarshipSummary[];
}

export async function fetchScholarshipBySlug(slug: string): Promise<Scholarship> {
  const res = await fetch(`${scholarshipsBase()}/${encodeURIComponent(slug)}`);
  if (!res.ok) throw new Error(await parseApiError(res));
  return (await res.json()) as Scholarship;
}
