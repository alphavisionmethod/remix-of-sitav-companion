// ═══════════════════════════════════════════════════════════════
// SITA OS — Phase 10 Hooks
// React Query hooks for cross-workspace approvals + attribution.
// ═══════════════════════════════════════════════════════════════
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  decideCrossWorkspaceApproval,
  listCrossWorkspaceApprovals,
  requestCrossWorkspaceApproval,
  type ApprovalStatus,
  type DecideApprovalInput,
  type RequestApprovalInput,
} from "./cross-workspace-approval-service";
import {
  fetchAttributionSummary,
  groupAttributionByWorkspace,
} from "./attribution-service";

const APPROVALS_KEY = ["phase-10", "cross-workspace-approvals"] as const;
const ATTRIBUTION_KEY = ["phase-10", "attribution-summary"] as const;

export function useCrossWorkspaceApprovals(
  status: ApprovalStatus | "all" = "pending",
) {
  return useQuery({
    queryKey: [...APPROVALS_KEY, status],
    queryFn: () => listCrossWorkspaceApprovals({ status }),
    staleTime: 15_000,
  });
}

export function useRequestCrossWorkspaceApproval() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: RequestApprovalInput) =>
      requestCrossWorkspaceApproval(input),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: APPROVALS_KEY, exact: false }),
  });
}

export function useDecideCrossWorkspaceApproval() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: DecideApprovalInput) =>
      decideCrossWorkspaceApproval(input),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: APPROVALS_KEY, exact: false }),
  });
}

export function useAttributionSummary(invocationId: string | null | undefined) {
  return useQuery({
    queryKey: [...ATTRIBUTION_KEY, invocationId ?? "__none__"],
    queryFn: () => fetchAttributionSummary(invocationId as string),
    enabled: Boolean(invocationId),
    staleTime: 30_000,
    select: (rows) => ({
      rows,
      groups: groupAttributionByWorkspace(rows),
    }),
  });
}