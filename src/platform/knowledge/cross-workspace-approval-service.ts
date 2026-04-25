// ═══════════════════════════════════════════════════════════════
// SITA OS — Phase 10 Cross-Workspace Approval Service
// Wraps `cross_workspace_approvals` table + the
// `request_cross_workspace_approval` / `decide_cross_workspace_approval`
// RPCs so apps can request and resolve operator approvals when an
// action needs to cross a workspace boundary (federation context).
// ═══════════════════════════════════════════════════════════════
import { supabase } from "@/integrations/supabase/client";

export type ApprovalStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "expired"
  | "cancelled"
  | "executed";

export type ApprovalActionKind =
  | "promote_memory"
  | "share_chunk"
  | "grant_voice"
  | "elevate_sensitivity"
  | "custom";

export type ApprovalSensitivity =
  | "public"
  | "internal"
  | "confidential"
  | "restricted";

export interface CrossWorkspaceApprovalRow {
  id: string;
  user_id: string;
  requester_workspace_id: string;
  target_workspace_id: string;
  federation_id: string | null;
  action_kind: ApprovalActionKind;
  payload: Record<string, unknown>;
  rationale: string;
  sensitivity: ApprovalSensitivity;
  status: ApprovalStatus;
  decided_by: string | null;
  decided_at: string | null;
  decision_notes: string | null;
  created_at: string;
  updated_at: string;
  expires_at: string;
}

export interface RequestApprovalInput {
  requesterWorkspaceId: string;
  targetWorkspaceId: string;
  actionKind: ApprovalActionKind;
  payload?: Record<string, unknown>;
  rationale?: string;
  sensitivity?: ApprovalSensitivity;
  federationId?: string | null;
  expiresInHours?: number;
}

export interface DecideApprovalInput {
  approvalId: string;
  decision: "approved" | "rejected" | "cancelled" | "executed";
  notes?: string | null;
}

type RpcFn = (
  fn: string,
  args: Record<string, unknown>,
) => Promise<{ data: unknown; error: unknown }>;

export async function listCrossWorkspaceApprovals(opts?: {
  status?: ApprovalStatus | "all";
  limit?: number;
}): Promise<CrossWorkspaceApprovalRow[]> {
  const sb = supabase as unknown as {
    from: (t: string) => {
      select: (q: string) => {
        order: (
          c: string,
          o: { ascending: boolean },
        ) => {
          limit: (
            n: number,
          ) => Promise<{ data: CrossWorkspaceApprovalRow[] | null; error: unknown }>;
          eq: (
            c: string,
            v: string,
          ) => {
            limit: (
              n: number,
            ) => Promise<{ data: CrossWorkspaceApprovalRow[] | null; error: unknown }>;
          };
        };
      };
    };
  };
  const status = opts?.status ?? "pending";
  const limit = opts?.limit ?? 100;
  const base = sb
    .from("cross_workspace_approvals")
    .select("*")
    .order("created_at", { ascending: false });
  const res =
    status === "all"
      ? await base.limit(limit)
      : await base.eq("status", status).limit(limit);
  if (res.error) throw res.error;
  return (res.data ?? []) as CrossWorkspaceApprovalRow[];
}

export async function requestCrossWorkspaceApproval(
  input: RequestApprovalInput,
): Promise<CrossWorkspaceApprovalRow> {
  const { data, error } = await (supabase.rpc as unknown as RpcFn)(
    "request_cross_workspace_approval",
    {
      _requester_workspace_id: input.requesterWorkspaceId,
      _target_workspace_id: input.targetWorkspaceId,
      _action_kind: input.actionKind,
      _payload: input.payload ?? {},
      _rationale: input.rationale ?? "",
      _sensitivity: input.sensitivity ?? "internal",
      _federation_id: input.federationId ?? null,
      _expires_in_hours: input.expiresInHours ?? 168,
    },
  );
  if (error) throw error;
  return data as CrossWorkspaceApprovalRow;
}

export async function decideCrossWorkspaceApproval(
  input: DecideApprovalInput,
): Promise<CrossWorkspaceApprovalRow> {
  const { data, error } = await (supabase.rpc as unknown as RpcFn)(
    "decide_cross_workspace_approval",
    {
      _approval_id: input.approvalId,
      _decision: input.decision,
      _notes: input.notes ?? null,
    },
  );
  if (error) throw error;
  return data as CrossWorkspaceApprovalRow;
}