import { useQuery } from "@tanstack/react-query";
import { fetchResourceBySlug, fetchResources } from "@/lib/api/resources";
import { queryKeys } from "./keys";

export function useResourcesQuery() {
  return useQuery({
    queryKey: queryKeys.resources.list,
    queryFn: fetchResources,
  });
}

export function useResourceDetailQuery(slug: string) {
  return useQuery({
    queryKey: queryKeys.resources.detail(slug),
    queryFn: () => fetchResourceBySlug(slug),
    enabled: Boolean(slug),
  });
}
