import {
  fetchSavedScholarshipSlugs,
  updateSavedScholarship,
} from "@/lib/api/portal";

function storageKey(email: string) {
  return `gnp_saved_scholarships:${email.trim().toLowerCase()}`;
}

export function getSavedSlugsLocal(email: string | undefined): string[] {
  if (!email || typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey(email));
    const parsed = raw ? (JSON.parse(raw) as string[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function setSavedSlugsLocal(email: string, slugs: string[]) {
  localStorage.setItem(storageKey(email), JSON.stringify(slugs));
}

export function clearSavedSlugsLocal(email: string) {
  localStorage.removeItem(storageKey(email));
}

export async function fetchSavedSlugs(email: string): Promise<string[]> {
  try {
    return await fetchSavedScholarshipSlugs();
  } catch {
    return getSavedSlugsLocal(email);
  }
}

export async function syncLocalSavedSlugs(email: string): Promise<string[]> {
  const local = getSavedSlugsLocal(email);
  if (local.length === 0) {
    return fetchSavedSlugs(email);
  }

  let slugs = await fetchSavedSlugs(email);
  for (const slug of local) {
    if (!slugs.includes(slug)) {
      slugs = await updateSavedScholarship(slug, true);
    }
  }
  clearSavedSlugsLocal(email);
  return slugs;
}

export async function toggleSavedSlugRemote(
  email: string,
  slug: string,
  currentlySaved: boolean,
): Promise<string[]> {
  try {
    return await updateSavedScholarship(slug, !currentlySaved);
  } catch {
    const current = getSavedSlugsLocal(email);
    const next = currentlySaved ? current.filter((s) => s !== slug) : [...current, slug];
    setSavedSlugsLocal(email, next);
    return next;
  }
}

/** @deprecated Use fetchSavedSlugs or syncLocalSavedSlugs */
export function getSavedSlugs(email: string | undefined): string[] {
  return getSavedSlugsLocal(email);
}

/** @deprecated Use toggleSavedSlugRemote */
export function toggleSavedSlug(email: string, slug: string): string[] {
  const current = getSavedSlugsLocal(email);
  const next = current.includes(slug)
    ? current.filter((s) => s !== slug)
    : [...current, slug];
  setSavedSlugsLocal(email, next);
  return next;
}

export function isSlugSaved(email: string | undefined, slug: string, saved: string[]): boolean {
  return saved.includes(slug);
}
