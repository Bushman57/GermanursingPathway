import type { ScholarshipSummary } from "@/lib/scholarships";
import { scholarshipText } from "@/lib/scholarships";

export type ScholarshipsSearch = {
  q?: string;
  status?: string;
  german?: string;
  tag?: string;
  intake?: string;
};

export const defaultScholarshipsSearch: ScholarshipsSearch = {};

export function countActiveScholarshipFilters(search: ScholarshipsSearch): number {
  let count = 0;
  if (search.status) count += 1;
  if (search.german) count += 1;
  if (search.intake) count += 1;
  if (search.tag) count += 1;
  return count;
}

export function searchToApiFilters(search: ScholarshipsSearch) {
  const filters: {
    application_status?: string;
    program_type?: string;
    german_level_required?: string;
    intake_month?: string;
  } = {};
  if (search.status) filters.application_status = search.status;
  if (search.german) filters.german_level_required = search.german;
  if (search.intake) filters.intake_month = search.intake;
  return Object.keys(filters).length > 0 ? filters : undefined;
}

export function filterScholarshipsClient(
  items: ScholarshipSummary[],
  search: ScholarshipsSearch,
  lang: string,
) {
  const q = (search.q ?? "").toLowerCase();
  return items.filter((s) => {
    const title = scholarshipText(s, "title", lang).toLowerCase();
    const provider = scholarshipText(s, "provider", lang).toLowerCase();
    const short = scholarshipText(s, "shortDescription", lang).toLowerCase();
    const matchesQuery = !q || title.includes(q) || provider.includes(q) || short.includes(q);
    const matchesTag = !search.tag || (Array.isArray(s.tags) && s.tags.includes(search.tag));
    return matchesQuery && matchesTag;
  });
}
