// ═══════════════════════════════════════════════════════════════
// SITA OS — Policy Enforcement Map
// Maps every UnifiedPolicyEntry to its enforcement point(s):
// where (db / edge-function / client / shell), how (deny / warn / audit),
// and what receipt class is emitted on violation.
// Companion doc: docs/architecture/UNIFIED_PERMISSION_AND_POLICY_MATRIX.md
// ═══════════════════════════════════════════════════════════════

import { UNIFIED_POLICY_MATRIX, type UnifiedPolicyEntry } from "./unified-policy-matrix";

export type EnforcementPoint =
  | "db-rls"           // Postgres RLS policy
  | "db-trigger"       // Postgres trigger / function
  | "edge-function"    // Supabase edge function gate
  | "client-guard"     // React route / component guard
  | "shell-policy"     // Shell capability gate
  | "executor-gate"    // Action executor refusal
  | "kill-switch";     // Kill-switch interception

export type PolicyOutcome =
  | "deny"             // hard block
  | "require-approval" // route to approval queue
  | "warn"             // soft warning, allow
  | "audit-only"       // log only
  | "redact";          // mask data

export interface PolicyEnforcementBinding {
  readonly policyId: string;
  readonly enforcementPoints: readonly EnforcementPoint[];
  readonly outcome: PolicyOutcome;
  readonly receiptClass: string | null; // e.g. "negative-receipt", "approval-required", "audit-event"
  readonly killSwitchTarget: string | null;
  readonly bypassRoles: readonly string[];
  readonly notes: string;
}

export const POLICY_ENFORCEMENT_MAP: readonly PolicyEnforcementBinding[] = [
  // ── RLS family — enforced by Postgres ─────────────────────────
  { policyId: "RLS-USER-ISOLATION", enforcementPoints: ["db-rls"], outcome: "deny", receiptClass: "negative-receipt", killSwitchTarget: null, bypassRoles: ["service_role"], notes: "Every user-scoped table" },
  { policyId: "RLS-ADMIN-READ",     enforcementPoints: ["db-rls"], outcome: "deny", receiptClass: null,                killSwitchTarget: null, bypassRoles: ["service_role"], notes: "Read-only widening for admins" },
  { policyId: "RLS-SERVICE-ROLE",   enforcementPoints: ["db-rls"], outcome: "deny", receiptClass: null,                killSwitchTarget: null, bypassRoles: [],               notes: "Service role bypass is intentional" },

  // ── Admin permissions — client + edge gate ────────────────────
  { policyId: "ADMIN-PERM-AUDIT-VIEW", enforcementPoints: ["client-guard", "edge-function"], outcome: "deny", receiptClass: "audit-event",      killSwitchTarget: null,             bypassRoles: [], notes: "Granular permission via has_admin_permission" },
  { policyId: "ADMIN-PERM-KILL-SWITCH", enforcementPoints: ["client-guard", "edge-function", "kill-switch"], outcome: "deny", receiptClass: "negative-receipt", killSwitchTarget: "admin-action-kill", bypassRoles: [], notes: "Most sensitive admin op" },
  { policyId: "ADMIN-PERM-USER-MGMT",   enforcementPoints: ["client-guard", "edge-function"], outcome: "deny", receiptClass: "audit-event",      killSwitchTarget: null,             bypassRoles: [], notes: "User CRUD" },

  // ── Advisor autonomy — executor gate ──────────────────────────
  { policyId: "ADV-AUTO-FINANCIAL", enforcementPoints: ["executor-gate"],                  outcome: "require-approval", receiptClass: "approval-required", killSwitchTarget: null,             bypassRoles: [], notes: "Routes to ai_workforce_approval_queue" },
  { policyId: "ADV-AUTO-COMMS",     enforcementPoints: ["executor-gate"],                  outcome: "deny",             receiptClass: "negative-receipt",  killSwitchTarget: "comms-kill",     bypassRoles: [], notes: "Hard block when allow_client_facing=false" },
  { policyId: "ADV-AUTO-CONFIDENCE", enforcementPoints: ["executor-gate"],                 outcome: "warn",             receiptClass: "audit-event",       killSwitchTarget: null,             bypassRoles: [], notes: "Soft escalate to review" },

  // ── AI budget — executor + edge gate ──────────────────────────
  { policyId: "AI-BUDGET-TOKEN-LIMIT", enforcementPoints: ["edge-function"],               outcome: "deny",             receiptClass: "negative-receipt",  killSwitchTarget: null,             bypassRoles: [], notes: "Per-call cap" },
  { policyId: "AI-BUDGET-COST-LIMIT",  enforcementPoints: ["edge-function", "kill-switch"], outcome: "deny",            receiptClass: "negative-receipt",  killSwitchTarget: "ai-cost-kill",   bypassRoles: ["admin"], notes: "Daily cost ceiling" },
  { policyId: "AI-BUDGET-RATE-LIMIT",  enforcementPoints: ["edge-function"],               outcome: "deny",             receiptClass: null,                killSwitchTarget: null,             bypassRoles: [], notes: "Hourly throttle" },

  // ── OS security — shell + edge ────────────────────────────────
  { policyId: "OS-TRUST-ZONE-BOUNDARY", enforcementPoints: ["shell-policy", "edge-function"], outcome: "deny", receiptClass: "negative-receipt", killSwitchTarget: null,             bypassRoles: [], notes: "Zone transition guard" },
  { policyId: "OS-MFA-REQUIRED",        enforcementPoints: ["client-guard", "edge-function"], outcome: "deny", receiptClass: "audit-event",      killSwitchTarget: null,             bypassRoles: [], notes: "Admin/owner zones must MFA" },
] as const;

export function getEnforcementBinding(policyId: string): PolicyEnforcementBinding | undefined {
  return POLICY_ENFORCEMENT_MAP.find((b) => b.policyId === policyId);
}

export function getEnforcementsForPoint(point: EnforcementPoint): readonly PolicyEnforcementBinding[] {
  return POLICY_ENFORCEMENT_MAP.filter((b) => b.enforcementPoints.includes(point));
}

export function policiesNeedingKillSwitch(): readonly PolicyEnforcementBinding[] {
  return POLICY_ENFORCEMENT_MAP.filter((b) => b.killSwitchTarget !== null);
}

export interface PolicyEnforcementCoverage {
  readonly policy: UnifiedPolicyEntry;
  readonly binding: PolicyEnforcementBinding | undefined;
  readonly hasBinding: boolean;
}

export function auditCoverage(): readonly PolicyEnforcementCoverage[] {
  return UNIFIED_POLICY_MATRIX.map((policy) => {
    const binding = getEnforcementBinding(policy.policyId);
    return { policy, binding, hasBinding: !!binding };
  });
}

export function uncoveredPolicies(): readonly UnifiedPolicyEntry[] {
  return auditCoverage().filter((c) => !c.hasBinding).map((c) => c.policy);
}
