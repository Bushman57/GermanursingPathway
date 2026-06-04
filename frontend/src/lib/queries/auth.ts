import { useQuery } from "@tanstack/react-query";
import { fetchMe } from "@/lib/api/auth";
import { queryKeys } from "./keys";

export function useAuthMeQuery() {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: fetchMe,
    staleTime: 1000 * 60 * 2,
  });
}
