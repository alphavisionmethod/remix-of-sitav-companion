// ═══════════════════════════════════════════════════════════════
// SITA OS — Command Lifecycle Protocol
// request → validate → approve → execute → receipt → verify
// ═══════════════════════════════════════════════════════════════

export type CommandPhase =
  | "initiated"
  | "validated"
  | "pending_approval"
  | "approved"
  | "rejected"
  | "executing"
  | "executed"
  | "verified"
  | "failed"
  | "rolled_back";

export interface CommandEnvelope<TPayload = unknown> {
  command_id: string;
  correlation_id: string;
  source_plane: "product" | "admin" | "founder" | "mobile" | "os" | "agent";
  target_service: string;
  command_type: string;
  payload: TPayload;
  phase: CommandPhase;
  actor_id: string;
  tenant_id?: string;
  idempotency_key: string;
  created_at: string;
  updated_at: string;
  metadata: Record<string, unknown>;
}

export interface CommandReceipt {
  receipt_id: string;
  command_id: string;
  correlation_id: string;
  phase: CommandPhase;
  outcome: "success" | "failure" | "partial";
  duration_ms: number;
  side_effects: CommandSideEffect[];
  proof_hash?: string;
  rollback_available: boolean;
  created_at: string;
}

export interface CommandSideEffect {
  effect_type: "data_mutation" | "notification" | "event_emission" | "external_call";
  target: string;
  description: string;
  reversible: boolean;
}

export const COMMAND_PHASE_TRANSITIONS: Record<CommandPhase, CommandPhase[]> = {
  initiated: ["validated", "failed"],
  validated: ["pending_approval", "executing", "rejected"],
  pending_approval: ["approved", "rejected"],
  approved: ["executing"],
  rejected: [],
  executing: ["executed", "failed"],
  executed: ["verified", "failed"],
  verified: [],
  failed: ["rolled_back", "initiated"],
  rolled_back: [],
};

export function isValidTransition(from: CommandPhase, to: CommandPhase): boolean {
  return COMMAND_PHASE_TRANSITIONS[from]?.includes(to) ?? false;
}
