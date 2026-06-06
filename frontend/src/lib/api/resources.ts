import type { ResourceArticle } from "@/lib/resources";
import { apiRoot, parseApiError } from "@/lib/api/apiBase";

function resourcesBase(): string {
  const root = apiRoot();
  return root ? `${root}/api/resources` : "/api/resources";
}

export async function fetchResources(): Promise<ResourceArticle[]> {
  const res = await fetch(resourcesBase());
  if (!res.ok) throw new Error(await parseApiError(res));
  return (await res.json()) as ResourceArticle[];
}

export async function fetchResourceBySlug(slug: string): Promise<ResourceArticle> {
  const res = await fetch(`${resourcesBase()}/${encodeURIComponent(slug)}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error(await parseApiError(res));
  return (await res.json()) as ResourceArticle;
}
