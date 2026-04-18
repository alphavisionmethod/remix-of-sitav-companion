import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWorkforceApprovalQueue, updateApprovalQueueItem } from "./admin-ai-workforce-client";

export function useAIWorkforceApprovalQueue(status?: string) {
  return useQuery({
    queryKey: ["ai-workforce-approval-queue", status],
    queryFn: () => fetchWorkforceApprovalQueue(status),
    staleTime: 15_000,
  });
}

export function useResolveApprovalItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...updates }: { id: string } & Record<string, unknown>) => updateApprovalQueueItem(id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ai-workforce-approval-queue"] }),
  });
}
