const KEY = "gnp_recent_pages";
const MAX = 8;

export type RecentPage = {
  path: string;
  label: string;
  slug?: string;
};

export function pushRecentPage(page: RecentPage) {
  if (typeof localStorage === "undefined") return;
  try {
    const list = getRecentPages().filter((p) => p.path !== page.path);
    list.unshift(page);
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  } catch {
    /* ignore */
  }
}

export function getRecentPages(): RecentPage[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as RecentPage[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
