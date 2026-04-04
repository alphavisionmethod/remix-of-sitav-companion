// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin Contracts: Admin Command
// ═══════════════════════════════════════════════════════════════

import type { DomainId } from "../_contract-scaffold";

export type AdminCommandType =
  | "override-policy"
  | "force-approval"
  | "kill-workflow"
  | "revoke-delegation"
  | "reset-trust"
  | "purge-memory"
  | "enable-capability"
  | "disable-capability"
  | "escalate-incident"
  | "trigger-diagnostic";

export interface AdminCommand {
  id: string;
  type: AdminCommandType;
  issuedBy: string;
  domain: DomainId;
  target: { entityType: string; entityId: string };
  parameters: Record<string, unknown>;
  reason: string;
  issuedAt: string;
  executedAt?: string;
  status: "pending" | "executed" | "failed" | "reverted";
  proofId?: string;
  auditTrailId: string;
}
