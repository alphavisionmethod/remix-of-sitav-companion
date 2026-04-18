import { useQuery } from "@tanstack/react-query";
import { fetchWorkforceInvocations } from "./admin-ai-workforce-client";

export function useAIWorkforceInvocations(limit = 50) {
  return useQuery({
    queryKey: ["ai-workforce-invocations", limit],
    queryFn: () => fetchWorkforceInvocations(limit),
    staleTime: 15_000,
  });
}
