import type { Scholarship } from "@/lib/scholarships";
import { apiRoot, parseApiError } from "@/lib/api/apiBase";

function scholarshipsBase(): string {
  const root = apiRoot();
  return root ? `${root}/api/scholarships` : "/api/scholarships";
}

export async function fetchScholarships(): Promise<Scholarship[]> {
  const res = await fetch(scholarshipsBase());
  if (!res.ok) throw new Error(await parseApiError(res));
  return (await res.json()) as Scholarship[];
}

export async function fetchScholarshipBySlug(slug: string): Promise<Scholarship> {
  const res = await fetch(`${scholarshipsBase()}/${encodeURIComponent(slug)}`);
  if (!res.ok) throw new Error(await parseApiError(res));
  return (await res.json()) as Scholarship;
}
