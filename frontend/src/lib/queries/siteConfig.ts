import { useQuery } from "@tanstack/react-query";
import { fetchSiteConfig } from "@/lib/api/siteConfig";
import { queryKeys } from "./keys";

const SITE_CONFIG_STALE_MS = 5 * 60 * 1000;

export function useSiteConfigQuery() {
  return useQuery({
    queryKey: queryKeys.site.config,
    queryFn: fetchSiteConfig,
    staleTime: SITE_CONFIG_STALE_MS,
  });
}

export function useSubscriptionsEnabled(): boolean {
  const { data } = useSiteConfigQuery();
  return data?.subscriptionsEnabled ?? true;
}
