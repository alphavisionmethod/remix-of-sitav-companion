// ═══════════════════════════════════════════════════════════════
// SITA OS — Consent & Permission Contracts
// Doc Section 7: Consent and permissions UX
// ═══════════════════════════════════════════════════════════════

export type ConsentScope = "read" | "write" | "execute" | "delegate" | "share";
export type ConsentDuration = "once" | "session" | "recurring" | "permanent";
export type ConsentDomain = "calendar" | "email" | "finance" | "contacts" | "tasks" | "files" | "workflows" | "payments";

export interface ConsentGrant {
  id: string;
  userId: string;
  grantedTo: string; // advisorId, connectorId, or householdMemberId
  granteeType: "advisor" | "connector" | "household-member" | "device";
  domain: ConsentDomain;
  scopes: ConsentScope[];
  duration: ConsentDuration;
  conditions: ConsentCondition[];
  grantedAt: string;
  expiresAt?: string;
  revokedAt?: string;
  active: boolean;
}

export interface ConsentCondition {
  type: "amount-threshold" | "time-restriction" | "approval-required" | "notification-only";
  value: string | number;
  description: string;
}

export interface ConsentPrompt {
  id: string;
  title: string;
  description: string;
  requestedBy: string;
  requestedScopes: ConsentScope[];
  domain: ConsentDomain;
  suggestedDuration: ConsentDuration;
  riskLevel: "low" | "medium" | "high";
  alternatives: ConsentAlternative[];
}

export interface ConsentAlternative {
  label: string;
  scopes: ConsentScope[];
  duration: ConsentDuration;
  description: string;
}

export interface PermissionFreeze {
  id: string;
  userId: string;
  frozenAt: string;
  reason: string;
  affectedAdvisors: string[];
  affectedConnectors: string[];
  affectedWorkflows: string[];
  unfrozenAt?: string;
}

export interface DelegationRule {
  id: string;
  userId: string;
  delegatedTo: string;
  actionType: string;
  threshold?: number;
  requiresApproval: boolean;
  approvalMode: "always-ask" | "threshold" | "never-ask";
  active: boolean;
}
