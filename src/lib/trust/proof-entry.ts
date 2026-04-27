// ═══════════════════════════════════════════════════════════════
// SITA OS — Canonical Proof Entry Shape
// Shared shape for any module-level Proof Trail (CRM, Concierge,
// Finance, etc.) so that adding new module proof surfaces does
// NOT require duplicating the entry / actor / action types.
// Backed by `public.ai_action_receipts`.
// ═══════════════════════════════════════════════════════════════

export type ProofActorType = "user" | "system" | "advisor" | "automation";

export type ProofActionKind =
  | "created"
  | "updated"
  | "imported"
  | "merged"
  | "escalated"
  | "automated"
  | "verified"
  | "linked"
  | "deleted"
  | "approved"
  | "rejected"
  | "executed"
  | "rolled_back"
  | "failed";

export interface ProofEntry {
  id: string;
  timestamp: string;
  action: ProofActionKind;
  actor: { type: ProofActorType; name: string };
  field?: string;
  oldValue?: string;
  newValue?: string;
  source: string;
  confidence?: number;
  receipt_hash?: string;
  parent_receipt_id?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Map an `ai_action_receipts` row → canonical ProofEntry.
 * Used by every module-level proof surface so the mapping logic
 * lives in exactly one place.
 */
export function receiptRowToProofEntry(row: {
  id: string;
  receipt_id?: string | null;
  action_type: string;
  recommendation_summary: string;
  status: string;
  confidence?: number | null;
  risk_tier?: string | null;
  action_payload?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  executed_at?: string | null;
  created_at: string;
}): ProofEntry {
  const meta = (row.metadata ?? {}) as Record<string, unknown>;
  const payload = (row.action_payload ?? {}) as Record<string, unknown>;

  // action_type format: "<module>.<entity>.<verb>" — derive the action kind.
  // Order matters: status overrides verb (failed > rolled_back > automation).
  const verb = (row.action_type.split(".").pop() ?? "").toLowerCase();
  const isAutomation =
    row.action_type.startsWith("autopilot.") ||
    row.action_type.includes(".automation.");

  const action: ProofActionKind =
    row.status === "failed" ? "failed" :
    row.status === "rolled_back" ? "rolled_back" :
    verb === "rollback" || verb === "rolled_back" ? "rolled_back" :
    isAutomation ? "automated" :
    verb === "create" || verb === "created" ? "created" :
    verb === "update" || verb === "updated" ? "updated" :
    verb === "delete" || verb === "deleted" ? "deleted" :
    verb === "merge" || verb === "merged" ? "merged" :
    verb === "import" || verb === "imported" ? "imported" :
    verb === "escalate" || verb === "escalated" ? "escalated" :
    verb === "verify" || verb === "verified" ? "verified" :
    verb === "link" || verb === "linked" ? "linked" :
    verb === "approve" || verb === "approved" ? "approved" :
    verb === "reject" || verb === "rejected" ? "rejected" :
    row.status === "executed" ? "executed" :
    "automated";

  const actorType: ProofActorType =
    (meta.actor_type as ProofActorType | undefined) ??
    (row.action_type.startsWith("autopilot.") || row.action_type.includes(".automation.") ? "automation" :
     row.action_type.startsWith("advisor.") ? "advisor" :
     row.action_type.startsWith("system.") ? "system" :
     "user");

  return {
    id: row.id,
    timestamp: row.executed_at ?? row.created_at,
    action,
    actor: { type: actorType, name: (meta.actor_name as string | undefined) ?? "You" },
    field: payload.field as string | undefined,
    oldValue: payload.old_value as string | undefined,
    newValue: payload.new_value as string | undefined,
    source: row.action_type,
    confidence: typeof row.confidence === "number" ? Math.round(row.confidence * 100) : undefined,
    receipt_hash: row.receipt_id ?? undefined,
    parent_receipt_id: meta.parent_receipt_id as string | undefined,
    metadata: meta,
  };
}