import type { Scholarship } from "@/lib/scholarships";

function normalizeScholarshipUrl(raw: string): string {
  const trimmed = raw.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  if (/^www\./i.test(trimmed)) return `https://${trimmed}`;
  return trimmed;
}

/** External https URL for institution / official program page, or null if internal/missing. */
export function scholarshipExternalUrl(s: Scholarship): string | null {
  const raw = s.officialLink?.trim();
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith("//")) return `https:${raw}`;
  if (/^www\./i.test(raw)) return `https://${raw}`;
  return null;
}

export function scholarshipHasExternalLink(s: Scholarship): boolean {
  return scholarshipExternalUrl(s) !== null;
}

/** Resolve URL for Apply CTA: applicationLink → officialLink → /register */
export function scholarshipApplyUrl(s: Scholarship): string {
  const primary = s.applicationLink?.trim();
  if (primary) return normalizeScholarshipUrl(primary);
  const fallback = s.officialLink?.trim();
  if (fallback) return normalizeScholarshipUrl(fallback);
  return "/register";
}

export function scholarshipApplyIsExternal(url: string): boolean {
  return /^https?:\/\//i.test(url);
}
