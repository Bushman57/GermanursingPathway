import { apiRoot, parseJsonResponse } from "@/lib/api/apiBase";

export type SiteConfig = {
  subscriptionsEnabled: boolean;
};

export async function fetchSiteConfig(): Promise<SiteConfig> {
  const root = apiRoot();
  const url = root ? `${root}/api/site-config` : "/api/site-config";
  const res = await fetch(url);
  if (!res.ok) {
    return { subscriptionsEnabled: true };
  }
  return parseJsonResponse<SiteConfig>(res);
}
