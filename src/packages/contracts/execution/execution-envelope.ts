// ═══════════════════════════════════════════════════════════════
// SITA OS — Execution Contracts: Execution Envelope
// Transport/control contract for governed execution
// ═══════════════════════════════════════════════════════════════

import type { ExecutionMode, ExecutionStatus } from "../_contract-scaffold";
import type { PolicyDecision } from "../core/policy-decision";

export interface ExecutionEnvelope {
  id: string;
  idempotencyKey: string;
  capabilityId: string;
  mode: ExecutionMode;
  input: Record<string, unknown>;
  policyDecision: PolicyDecision;
  approvalId?: string;
  status: ExecutionStatus;
  result?: Record<string, unknown>;
  error?: string;
  startedAt: string;
  completedAt?: string;
}
