import { apiRoot, parseApiError } from "@/lib/api/apiBase";
import { getAdminToken } from "@/lib/adminAuth";
import type { ResourceArticle } from "@/lib/resources";
import type { Scholarship } from "@/lib/scholarships";

async function adminFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAdminToken();
  if (!token) throw new Error("Not logged in");

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const root = apiRoot();
  const url = root ? `${root}${path}` : path;
  const res = await fetch(url, { ...init, headers });
  if (res.status === 204) return undefined as T;
  if (!res.ok) throw new Error(await parseApiError(res));
  return (await res.json()) as T;
}

export async function adminListScholarships(): Promise<Scholarship[]> {
  return adminFetch("/api/admin/scholarships");
}

export async function adminCreateScholarship(body: Record<string, unknown>): Promise<Scholarship> {
  return adminFetch("/api/admin/scholarships", { method: "POST", body: JSON.stringify(body) });
}

export async function adminUpdateScholarship(
  slug: string,
  body: Record<string, unknown>,
): Promise<Scholarship> {
  return adminFetch(`/api/admin/scholarships/${encodeURIComponent(slug)}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function adminDeleteScholarship(slug: string): Promise<void> {
  await adminFetch(`/api/admin/scholarships/${encodeURIComponent(slug)}`, { method: "DELETE" });
}

export async function adminListResources(): Promise<ResourceArticle[]> {
  return adminFetch("/api/admin/resources");
}

export async function adminCreateResource(body: ResourceArticle & { isPublished?: boolean }): Promise<ResourceArticle> {
  return adminFetch("/api/admin/resources", { method: "POST", body: JSON.stringify(body) });
}

export async function adminUpdateResource(
  slug: string,
  body: ResourceArticle & { isPublished?: boolean },
): Promise<ResourceArticle> {
  return adminFetch(`/api/admin/resources/${encodeURIComponent(slug)}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function adminDeleteResource(slug: string): Promise<void> {
  await adminFetch(`/api/admin/resources/${encodeURIComponent(slug)}`, { method: "DELETE" });
}
