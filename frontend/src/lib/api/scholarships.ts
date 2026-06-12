import type { Scholarship, ScholarshipSummary } from "@/lib/scholarships";
import { apiRoot, parseApiError, parseJsonResponse } from "@/lib/api/apiBase";

export class SubscriptionRequiredError extends Error {
  upgradeTier: string;

  constructor(message: string, upgradeTier: string) {
    super(message);
    this.name = "SubscriptionRequiredError";
    this.upgradeTier = upgradeTier;
  }
}

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
  if (res.status === 403) {
    const data = await parseJsonResponse<{
      error?: string;
      upgradeTier?: string;
    }>(res);
    throw new SubscriptionRequiredError(
      data.error ?? "Plus subscription required.",
      data.upgradeTier ?? "plus",
    );
  }
  if (!res.ok) throw new Error(await parseApiError(res));
  return parseJsonResponse<ScholarshipSummary[]>(res);
}

export async function fetchScholarshipBySlug(slug: string): Promise<Scholarship> {
  const res = await fetch(`${scholarshipsBase()}/${encodeURIComponent(slug)}`, {
    credentials: "include",
  });
  if (res.status === 403) {
    const data = await parseJsonResponse<{
      error?: string;
      upgradeTier?: string;
    }>(res);
    throw new SubscriptionRequiredError(
      data.error ?? "Plus subscription required.",
      data.upgradeTier ?? "plus",
    );
  }
  if (!res.ok) throw new Error(await parseApiError(res));
  return parseJsonResponse<Scholarship>(res);
}
