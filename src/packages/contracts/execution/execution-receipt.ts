// ═══════════════════════════════════════════════════════════════
// SITA OS — Execution Contracts: Execution Receipt
// Canonical proof that execution occurred
// ═══════════════════════════════════════════════════════════════

import type { ExecutionStatus } from "../_contract-scaffold";

export interface ExecutionReceipt {
  id: string;
  executionId: string;
  capabilityId: string;
  status: ExecutionStatus;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
  policyDecisionId?: string;
  approvalId?: string;
  proofBundleId?: string;
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  hash: string;
  previousHash: string;
}
