// ═══════════════════════════════════════════════════════════════
// SITA OS — Policy Approval Map (Phase 3)
//
// For each (domain, riskClass) cell declare the approval tier
// required. Bound to the existing approval-tiers.ts engine.
// ═══════════════════════════════════════════════════════════════

import type { PolicyDomainKey } from "./policy-domain-map";
import type { RiskClass } from "./policy-proof-requirements";

export type ApprovalTier =
  | "none"            // No approval needed
  | "self-confirm"    // Single confirmation by actor
  | "owner-approval"  // Owner / tenant admin approval
  | "dual-approval"   // Two distinct approvers
  | "boardroom"       // Boardroom motion required
  | "support-escalation"; // Support team intervention

export interface ApprovalMapping {
  domain: PolicyDomainKey;
  riskClass: RiskClass;
  tier: ApprovalTier;
  /** Cooldown after grant before action can repeat. */
  cooldownSeconds: number;
  /** Whether dry-run is required before execution. */
  dryRunRequired: boolean;
  /** Whether explicit justification text is required. */
  justificationRequired: boolean;
}

export const APPROVAL_MAP: readonly ApprovalMapping[] = [
  // Money
  { domain: "money", riskClass: "R0", tier: "none",            cooldownSeconds: 0,    dryRunRequired: false, justificationRequired: false },
  { domain: "money", riskClass: "R3", tier: "self-confirm",    cooldownSeconds: 0,    dryRunRequired: false, justificationRequired: false },
  { domain: "money", riskClass: "R4", tier: "owner-approval",  cooldownSeconds: 60,   dryRunRequired: true,  justificationRequired: true  },
  { domain: "money", riskClass: "R5", tier: "boardroom",       cooldownSeconds: 600,  dryRunRequired: true,  justificationRequired: true  },

  // Boardroom
  { domain: "boardroom", riskClass: "R3", tier: "owner-approval", cooldownSeconds: 0,   dryRunRequired: false, justificationRequired: true },
  { domain: "boardroom", riskClass: "R4", tier: "boardroom",      cooldownSeconds: 300, dryRunRequired: true,  justificationRequired: true },

  // System
  { domain: "system", riskClass: "R3", tier: "self-confirm",      cooldownSeconds: 0,   dryRunRequired: false, justificationRequired: false },
  { domain: "system", riskClass: "R4", tier: "owner-approval",    cooldownSeconds: 30,  dryRunRequired: true,  justificationRequired: true  },
  { domain: "system", riskClass: "R5", tier: "dual-approval",     cooldownSeconds: 600, dryRunRequired: true,  justificationRequired: true  },

  // Admin
  { domain: "admin", riskClass: "R3", tier: "self-confirm",       cooldownSeconds: 0,   dryRunRequired: false, justificationRequired: false },
  { domain: "admin", riskClass: "R4", tier: "owner-approval",     cooldownSeconds: 30,  dryRunRequired: true,  justificationRequired: true  },

  // Integrations
  { domain: "integrations", riskClass: "R2", tier: "none",         cooldownSeconds: 0,  dryRunRequired: false, justificationRequired: false },
  { domain: "integrations", riskClass: "R3", tier: "self-confirm", cooldownSeconds: 0,  dryRunRequired: false, justificationRequired: false },
  { domain: "integrations", riskClass: "R4", tier: "owner-approval", cooldownSeconds: 60, dryRunRequired: true, justificationRequired: true },

  // Identity
  { domain: "identity", riskClass: "R3", tier: "self-confirm",    cooldownSeconds: 0,   dryRunRequired: false, justificationRequired: false },
  { domain: "identity", riskClass: "R4", tier: "owner-approval",  cooldownSeconds: 60,  dryRunRequired: true,  justificationRequired: true  },

  // Business / Concierge / Files / Trust
  { domain: "business",  riskClass: "R1", tier: "none",           cooldownSeconds: 0,   dryRunRequired: false, justificationRequired: false },
  { domain: "business",  riskClass: "R2", tier: "none",           cooldownSeconds: 0,   dryRunRequired: false, justificationRequired: false },
  { domain: "business",  riskClass: "R3", tier: "self-confirm",   cooldownSeconds: 0,   dryRunRequired: false, justificationRequired: true  },
  { domain: "concierge", riskClass: "R0", tier: "none",           cooldownSeconds: 0,   dryRunRequired: false, justificationRequired: false },
  { domain: "concierge", riskClass: "R1", tier: "none",           cooldownSeconds: 0,   dryRunRequired: false, justificationRequired: false },
  { domain: "files",     riskClass: "R2", tier: "none",           cooldownSeconds: 0,   dryRunRequired: false, justificationRequired: false },
  { domain: "files",     riskClass: "R3", tier: "self-confirm",   cooldownSeconds: 0,   dryRunRequired: false, justificationRequired: true  },
  { domain: "trust",     riskClass: "R3", tier: "self-confirm",   cooldownSeconds: 0,   dryRunRequired: false, justificationRequired: true  },
  { domain: "trust",     riskClass: "R4", tier: "owner-approval", cooldownSeconds: 60,  dryRunRequired: true,  justificationRequired: true  },
] as const;

export function getApprovalMapping(
  domain: PolicyDomainKey,
  riskClass: RiskClass,
): ApprovalMapping | undefined {
  return APPROVAL_MAP.find((a) => a.domain === domain && a.riskClass === riskClass);
}

export function requiresApproval(domain: PolicyDomainKey, riskClass: RiskClass): boolean {
  const m = getApprovalMapping(domain, riskClass);
  return !!m && m.tier !== "none";
}

export function requiresDryRun(domain: PolicyDomainKey, riskClass: RiskClass): boolean {
  return getApprovalMapping(domain, riskClass)?.dryRunRequired ?? false;
}
