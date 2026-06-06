import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchLearningAccess } from "@/lib/api/portal";
import { useAuthMeQuery } from "@/lib/queries/auth";
import { queryKeys } from "@/lib/queries/keys";

export function useLearningAccess() {
  const { data: me, isLoading: authLoading } = useAuthMeQuery();
  const isAuthenticated = me != null;

  const accessQuery = useQuery({
    queryKey: queryKeys.portal.learningAccess,
    queryFn: fetchLearningAccess,
    enabled: isAuthenticated,
    staleTime: 1000 * 60,
  });

  const queryClient = useQueryClient();
  const refetch = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.portal.learningAccess });
    await accessQuery.refetch();
  };

  const unlocked = isAuthenticated && (accessQuery.data?.unlocked ?? false);
  const amountKes = accessQuery.data?.amountKes ?? 3000;
  const isLoading = authLoading || (isAuthenticated && accessQuery.isLoading);

  return {
    unlocked,
    isLoading,
    isAuthenticated,
    amountKes,
    freeModuleId: accessQuery.data?.freeModuleId ?? "getting-started",
    refetch,
  };
}
