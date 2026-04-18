// ═══════════════════════════════════════════════════════════════
// SITA OS — Policy Reversibility Map (Phase 3)
//
// Declares whether actions in each (domain, riskClass) cell are
// reversible, and what compensating workflow is registered.
// Used by the executor to enforce rollback-pointer requirements.
// ═══════════════════════════════════════════════════════════════

import type { PolicyDomainKey } from "./policy-domain-map";
import type { RiskClass } from "./policy-proof-requirements";

export type ReversibilityClass =
  | "fully-reversible"      // Direct undo via compensating action
  | "soft-reversible"       // Reversible with notification / acknowledgement
  | "time-bounded"          // Reversible within a window (e.g., 24h)
  | "manually-reversible"   // Requires support intervention
  | "irreversible";         // Cannot be undone

export interface ReversibilityEntry {
  domain: PolicyDomainKey;
  riskClass: RiskClass;
  reversibility: ReversibilityClass;
  /** Window in seconds when reversibility is time-bounded. */
  reversalWindowSeconds: number | null;
  /** Workflow id (canonical execution chain) that performs the reversal. */
  compensatingWorkflowId: string | null;
  /** Whether a rollback-pointer proof component is mandatory. */
  rollbackPointerRequired: boolean;
}

export const REVERSIBILITY_MAP: readonly ReversibilityEntry[] = [
  // Money
  { domain: "money", riskClass: "R0", reversibility: "fully-reversible",  reversalWindowSeconds: null,    compensatingWorkflowId: null,                          rollbackPointerRequired: false },
  { domain: "money", riskClass: "R3", reversibility: "soft-reversible",   reversalWindowSeconds: 86400,   compensatingWorkflowId: "finance.compensate-mutation", rollbackPointerRequired: true  },
  { domain: "money", riskClass: "R4", reversibility: "time-bounded",      reversalWindowSeconds: 3600,    compensatingWorkflowId: "finance.compensate-payment",  rollbackPointerRequired: true  },
  { domain: "money", riskClass: "R5", reversibility: "manually-reversible", reversalWindowSeconds: null,  compensatingWorkflowId: "finance.support-reversal",    rollbackPointerRequired: true  },

  // Boardroom
  { domain: "boardroom", riskClass: "R3", reversibility: "time-bounded",     reversalWindowSeconds: 7200,  compensatingWorkflowId: "boardroom.rescind-motion", rollbackPointerRequired: true },
  { domain: "boardroom", riskClass: "R4", reversibility: "manually-reversible", reversalWindowSeconds: null, compensatingWorkflowId: "boardroom.support-rescind", rollbackPointerRequired: true },

  // System
  { domain: "system", riskClass: "R3", reversibility: "fully-reversible",   reversalWindowSeconds: null,  compensatingWorkflowId: null,                       rollbackPointerRequired: false },
  { domain: "system", riskClass: "R4", reversibility: "time-bounded",       reversalWindowSeconds: 600,   compensatingWorkflowId: "runtime.restore-state",    rollbackPointerRequired: true  },
  { domain: "system", riskClass: "R5", reversibility: "irreversible",       reversalWindowSeconds: null,  compensatingWorkflowId: null,                       rollbackPointerRequired: true  },

  // Admin
  { domain: "admin", riskClass: "R3", reversibility: "fully-reversible",    reversalWindowSeconds: null,  compensatingWorkflowId: null,                       rollbackPointerRequired: false },
  { domain: "admin", riskClass: "R4", reversibility: "soft-reversible",     reversalWindowSeconds: 86400, compensatingWorkflowId: "admin.undo-config-change",  rollbackPointerRequired: true  },

  // Integrations
  { domain: "integrations", riskClass: "R2", reversibility: "fully-reversible", reversalWindowSeconds: null,  compensatingWorkflowId: null,                          rollbackPointerRequired: false },
  { domain: "integrations", riskClass: "R3", reversibility: "soft-reversible",  reversalWindowSeconds: 86400, compensatingWorkflowId: "integrations.disconnect-undo", rollbackPointerRequired: true  },
  { domain: "integrations", riskClass: "R4", reversibility: "manually-reversible", reversalWindowSeconds: null, compensatingWorkflowId: "integrations.support-restore", rollbackPointerRequired: true },

  // Identity
  { domain: "identity", riskClass: "R3", reversibility: "soft-reversible",   reversalWindowSeconds: 86400, compensatingWorkflowId: "identity.revert-profile",  rollbackPointerRequired: true },
  { domain: "identity", riskClass: "R4", reversibility: "manually-reversible", reversalWindowSeconds: null, compensatingWorkflowId: "identity.support-restore", rollbackPointerRequired: true },

  // Business
  { domain: "business", riskClass: "R1", reversibility: "fully-reversible",  reversalWindowSeconds: null,  compensatingWorkflowId: null,                       rollbackPointerRequired: false },
  { domain: "business", riskClass: "R2", reversibility: "fully-reversible",  reversalWindowSeconds: null,  compensatingWorkflowId: "business.undo-mutation",   rollbackPointerRequired: false },
  { domain: "business", riskClass: "R3", reversibility: "time-bounded",      reversalWindowSeconds: 1800,  compensatingWorkflowId: "business.recall-comm",     rollbackPointerRequired: true  },

  // Concierge
  { domain: "concierge", riskClass: "R0", reversibility: "fully-reversible", reversalWindowSeconds: null,  compensatingWorkflowId: null,                       rollbackPointerRequired: false },
  { domain: "concierge", riskClass: "R1", reversibility: "fully-reversible", reversalWindowSeconds: null,  compensatingWorkflowId: null,                       rollbackPointerRequired: false },

  // Files
  { domain: "files", riskClass: "R2", reversibility: "fully-reversible",     reversalWindowSeconds: null,  compensatingWorkflowId: "files.restore-version",    rollbackPointerRequired: false },
  { domain: "files", riskClass: "R3", reversibility: "manually-reversible",  reversalWindowSeconds: null,  compensatingWorkflowId: "files.support-restore",    rollbackPointerRequired: true  },

  // Trust
  { domain: "trust", riskClass: "R3", reversibility: "irreversible",         reversalWindowSeconds: null,  compensatingWorkflowId: null,                       rollbackPointerRequired: false },
  { domain: "trust", riskClass: "R4", reversibility: "irreversible",         reversalWindowSeconds: null,  compensatingWorkflowId: null,                       rollbackPointerRequired: false },
] as const;

export function getReversibility(
  domain: PolicyDomainKey,
  riskClass: RiskClass,
): ReversibilityEntry | undefined {
  return REVERSIBILITY_MAP.find((r) => r.domain === domain && r.riskClass === riskClass);
}

export function isReversible(domain: PolicyDomainKey, riskClass: RiskClass): boolean {
  const r = getReversibility(domain, riskClass);
  return !!r && r.reversibility !== "irreversible";
}

export function requiresRollbackPointer(domain: PolicyDomainKey, riskClass: RiskClass): boolean {
  return getReversibility(domain, riskClass)?.rollbackPointerRequired ?? false;
}
