// ═══════════════════════════════════════════════════════════════
// SITA OS — Deep Policy & Consent System Types
// Full policy inheritance, conflict resolution, consent UX
// ═══════════════════════════════════════════════════════════════

export type PolicyScope = "user" | "household" | "business" | "advisor" | "device" | "environment" | "global";
export type PolicyEffect = "allow" | "deny" | "escalate" | "simulate" | "require_approval" | "require_proof";

export interface PolicyRule {
  id: string;
  name: string;
  description: string;
  scope: PolicyScope;
  scopeId: string;
  domain: string;
  priority: number;
  conditions: PolicyCondition[];
  effect: PolicyEffect;
  effectParams?: Record<string, unknown>;
  version: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  active: boolean;
  parentPolicyId?: string;
  overridable: boolean;
  expiresAt?: string;
}

export interface PolicyCondition {
  field: string;
  operator: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "not_in" | "contains" | "matches" | "between";
  value: unknown;
  valueType: "number" | "string" | "boolean" | "date" | "time" | "array";
}

export interface PolicyInheritanceChain {
  resolved: PolicyRule;
  chain: { scope: PolicyScope; policyId: string; effect: PolicyEffect; overridden: boolean }[];
  conflicts: PolicyConflict[];
}

export interface PolicyConflict {
  id: string;
  policyA: string;
  policyB: string;
  field: string;
  effectA: PolicyEffect;
  effectB: PolicyEffect;
  resolution: "higher_scope_wins" | "deny_wins" | "explicit_wins" | "user_decides" | "unresolved";
  resolvedAt?: string;
}

export interface PolicyAuditEntry {
  id: string;
  policyId: string;
  action: "created" | "updated" | "activated" | "deactivated" | "deleted" | "overridden";
  previousVersion?: number;
  newVersion: number;
  changedBy: string;
  timestamp: string;
  diff: Record<string, { before: unknown; after: unknown }>;
  impactAssessment?: string;
}

export interface PolicyVersionHistory {
  policyId: string;
  versions: { version: number; snapshot: PolicyRule; changedAt: string; changedBy: string }[];
}

// ── Consent System ──────────────────────────────────────────────
export type ConsentMode = "always_ask" | "auto_approve" | "never_allow" | "approve_once" | "approve_recurring";

export interface ConsentRecord {
  id: string;
  userId: string;
  domain: string;
  action: string;
  advisorId?: string;
  connectorId?: string;
  mode: ConsentMode;
  grantedAt: string;
  expiresAt?: string;
  revoked: boolean;
  revokedAt?: string;
  usageCount: number;
  maxUsages?: number;
  conditions?: PolicyCondition[];
}

export interface ConsentPrompt {
  id: string;
  type: "permission" | "approval" | "delegation" | "connector" | "policy_change";
  title: string;
  plainLanguageExplanation: string;
  advisorId?: string;
  domain: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  affectedAreas: string[];
  trustImpact: string;
  options: ConsentOption[];
  defaultOption: string;
  expiresAt?: string;
}

export interface ConsentOption {
  id: string;
  label: string;
  mode: ConsentMode;
  description: string;
  recommended: boolean;
}

// ── Policy Templates ────────────────────────────────────────────
export interface PolicyTemplate {
  id: string;
  name: string;
  description: string;
  scope: PolicyScope;
  category: "financial" | "communication" | "scheduling" | "privacy" | "operational" | "safety";
  rules: Omit<PolicyRule, "id" | "createdAt" | "updatedAt" | "createdBy" | "version">[];
  suitableFor: string[];
  riskLevel: "conservative" | "balanced" | "permissive";
}

// ── Emergency Controls ──────────────────────────────────────────
export interface EmergencyPolicyFreeze {
  id: string;
  activatedBy: string;
  activatedAt: string;
  scope: "global" | "domain" | "advisor" | "connector";
  scopeId?: string;
  reason: string;
  affectedPolicies: string[];
  affectedWorkflows: string[];
  deactivatedAt?: string;
  deactivatedBy?: string;
}
