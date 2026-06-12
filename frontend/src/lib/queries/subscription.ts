import { useQuery } from "@tanstack/react-query";
import { fetchSubscriptionStatus } from "@/lib/api/subscription";
import { queryKeys } from "./keys";

export function useSubscriptionQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.portal.subscription,
    queryFn: fetchSubscriptionStatus,
    enabled,
  });
}
