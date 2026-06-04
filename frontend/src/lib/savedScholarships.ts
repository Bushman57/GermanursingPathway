function storageKey(email: string) {
  return `gnp_saved_scholarships:${email.trim().toLowerCase()}`;
}

export function getSavedSlugs(email: string | undefined): string[] {
  if (!email || typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey(email));
    const parsed = raw ? (JSON.parse(raw) as string[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function toggleSavedSlug(email: string, slug: string): string[] {
  const current = getSavedSlugs(email);
  const next = current.includes(slug)
    ? current.filter((s) => s !== slug)
    : [...current, slug];
  localStorage.setItem(storageKey(email), JSON.stringify(next));
  return next;
}

export function isSlugSaved(email: string | undefined, slug: string): boolean {
  return getSavedSlugs(email).includes(slug);
}
