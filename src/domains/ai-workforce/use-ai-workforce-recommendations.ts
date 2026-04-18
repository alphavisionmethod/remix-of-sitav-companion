import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWorkforceRecommendations, updateRecommendationStatus, insertRecommendationScore } from "./admin-ai-workforce-client";

export function useAIWorkforceRecommendations(limit = 50) {
  return useQuery({
    queryKey: ["ai-workforce-recommendations", limit],
    queryFn: () => fetchWorkforceRecommendations(limit),
    staleTime: 15_000,
  });
}

export function useUpdateRecommendationStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateRecommendationStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ai-workforce-recommendations"] }),
  });
}

export function useScoreRecommendation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: insertRecommendationScore,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ai-workforce-recommendations"] }),
  });
}
