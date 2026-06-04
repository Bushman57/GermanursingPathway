import { useQuery } from "@tanstack/react-query";
import {
  fetchScholarshipBySlug,
  fetchScholarships,
  type PublicScholarshipFilters,
} from "@/lib/api/scholarships";
import { queryClient } from "@/lib/queryClient";
import { queryKeys } from "./keys";

export function useScholarshipsQuery(
  filters?: PublicScholarshipFilters,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: queryKeys.scholarships.list(filters),
    queryFn: () => fetchScholarships(filters),
    enabled: options?.enabled !== false,
  });
}

export function useScholarshipDetailQuery(slug: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.scholarships.detail(slug),
    queryFn: () => fetchScholarshipBySlug(slug),
    enabled: enabled && Boolean(slug),
  });
}

export function prefetchScholarships() {
  return queryClient.prefetchQuery({
    queryKey: queryKeys.scholarships.list(),
    queryFn: () => fetchScholarships(),
  });
}
