// ═══════════════════════════════════════════════════════════════
// SITA OS — Unified Policy Matrix
// Cross-domain policy registry: RLS, admin perms, advisor autonomy
// ═══════════════════════════════════════════════════════════════

export type PolicyDomain = "rls" | "admin-permission" | "advisor-autonomy" | "os-security" | "ai-budget" | "kill-switch" | "data-classification";
export type EnforcementMode = "hard-block" | "soft-warn" | "audit-only" | "disabled";
export type PolicyScope = "global" | "tenant" | "user" | "role" | "device" | "session";

export interface UnifiedPolicyEntry {
  readonly policyId: string;
  readonly domain: PolicyDomain;
  readonly displayName: string;
  readonly description: string;
  readonly scope: PolicyScope;
  readonly enforcementMode: EnforcementMode;
  readonly appliesTo: readonly string[];
  readonly condition: string;
  readonly action: string;
  readonly violationSeverity: "low" | "medium" | "high" | "critical";
  readonly auditRequired: boolean;
  readonly overridable: boolean;
  readonly overrideRequires: string | null;
}

export const UNIFIED_POLICY_MATRIX: readonly UnifiedPolicyEntry[] = [
  // ── RLS Policies ─────────────────────────────────────────────
  { policyId: "RLS-USER-ISOLATION", domain: "rls", displayName: "User Data Isolation", description: "All user-scoped tables enforce user_id = auth.uid()", scope: "user", enforcementMode: "hard-block", appliesTo: ["all user-scoped tables"], condition: "user_id = auth.uid()", action: "deny row access", violationSeverity: "critical", auditRequired: true, overridable: false, overrideRequires: null },
  { policyId: "RLS-ADMIN-READ", domain: "rls", displayName: "Admin Read Access", description: "Admin users can read all rows via has_role check", scope: "role", enforcementMode: "hard-block", appliesTo: ["admin-visible tables"], condition: "has_role(auth.uid(), 'admin')", action: "allow read", violationSeverity: "high", auditRequired: true, overridable: false, overrideRequires: null },
  { policyId: "RLS-SERVICE-ROLE", domain: "rls", displayName: "Service Role Bypass", description: "Service role key bypasses RLS for edge functions", scope: "global", enforcementMode: "hard-block", appliesTo: ["edge function operations"], condition: "request uses service_role key", action: "bypass RLS", violationSeverity: "critical", auditRequired: true, overridable: false, overrideRequires: null },

  // ── Admin Permissions ────────────────────────────────────────
  { policyId: "ADMIN-PERM-AUDIT-VIEW", domain: "admin-permission", displayName: "Audit Log Viewing", description: "Permission to view admin_action_audit entries", scope: "role", enforcementMode: "hard-block", appliesTo: ["admin-action-audit page"], condition: "has_admin_permission('audit.view')", action: "allow page access", violationSeverity: "high", auditRequired: true, overridable: false, overrideRequires: null },
  { policyId: "ADMIN-PERM-KILL-SWITCH", domain: "admin-permission", displayName: "Kill Switch Control", description: "Permission to activate/deactivate kill switches", scope: "role", enforcementMode: "hard-block", appliesTo: ["kill-switch controls"], condition: "has_admin_permission('system.kill_switch')", action: "allow switch toggle", violationSeverity: "critical", auditRequired: true, overridable: false, overrideRequires: null },
  { policyId: "ADMIN-PERM-USER-MGMT", domain: "admin-permission", displayName: "User Management", description: "Permission to manage user accounts and roles", scope: "role", enforcementMode: "hard-block", appliesTo: ["user management pages"], condition: "has_admin_permission('users.manage')", action: "allow CRUD", violationSeverity: "critical", auditRequired: true, overridable: false, overrideRequires: null },

  // ── Advisor Autonomy ─────────────────────────────────────────
  { policyId: "ADV-AUTO-FINANCIAL", domain: "advisor-autonomy", displayName: "Financial Action Gate", description: "Advisor financial actions above threshold require approval", scope: "user", enforcementMode: "hard-block", appliesTo: ["advisor_board_actions with financial impact"], condition: "impact_cents > max_financial_impact_cents", action: "require approval", violationSeverity: "high", auditRequired: true, overridable: true, overrideRequires: "owner approval" },
  { policyId: "ADV-AUTO-COMMS", domain: "advisor-autonomy", displayName: "Outbound Comms Gate", description: "Client-facing communications require explicit approval", scope: "user", enforcementMode: "hard-block", appliesTo: ["outbound emails, SMS"], condition: "allow_client_facing = false", action: "block send", violationSeverity: "medium", auditRequired: true, overridable: true, overrideRequires: "owner toggle" },
  { policyId: "ADV-AUTO-CONFIDENCE", domain: "advisor-autonomy", displayName: "Low Confidence Gate", description: "Actions below confidence threshold need approval", scope: "user", enforcementMode: "soft-warn", appliesTo: ["all advisor actions"], condition: "confidence < require_approval_above_confidence", action: "escalate for review", violationSeverity: "medium", auditRequired: true, overridable: true, overrideRequires: "owner approval" },

  // ── AI Budget ────────────────────────────────────────────────
  { policyId: "AI-BUDGET-TOKEN-LIMIT", domain: "ai-budget", displayName: "Token Budget Limit", description: "Each invocation cannot exceed budget class token limit", scope: "user", enforcementMode: "hard-block", appliesTo: ["ai_workforce_invocations"], condition: "tokens > max_tokens_per_call", action: "reject invocation", violationSeverity: "medium", auditRequired: true, overridable: false, overrideRequires: null },
  { policyId: "AI-BUDGET-COST-LIMIT", domain: "ai-budget", displayName: "Cost Budget Limit", description: "Daily cost cannot exceed role budget", scope: "user", enforcementMode: "hard-block", appliesTo: ["ai_workforce_roles"], condition: "daily_cost > cost_budget_cents", action: "suspend role", violationSeverity: "high", auditRequired: true, overridable: true, overrideRequires: "admin override" },
  { policyId: "AI-BUDGET-RATE-LIMIT", domain: "ai-budget", displayName: "Invocation Rate Limit", description: "Max calls per hour per budget class", scope: "user", enforcementMode: "hard-block", appliesTo: ["ai_workforce_budget_classes"], condition: "hourly_calls > max_calls_per_hour", action: "queue or reject", violationSeverity: "medium", auditRequired: false, overridable: false, overrideRequires: null },

  // ── OS Security ──────────────────────────────────────────────
  { policyId: "OS-TRUST-ZONE-BOUNDARY", domain: "os-security", displayName: "Trust Zone Boundary", description: "Cross-zone transitions must pass trust chain validation", scope: "session", enforcementMode: "hard-block", appliesTo: ["all zone transitions"], condition: "canTransition(from, to) !== 'deny'", action: "block transition", violationSeverity: "critical", auditRequired: true, overridable: false, overrideRequires: null },
  { policyId: "OS-MFA-REQUIRED", domain: "os-security", displayName: "MFA Requirement", description: "Zones D and G require multi-factor authentication", scope: "session", enforcementMode: "hard-block", appliesTo: ["admin sessions in zones D, G"], condition: "session.mfa_verified = true", action: "block access", violationSeverity: "critical", auditRequired: true, overridable: false, overrideRequires: null },

  // ── Kill Switch ──────────────────────────────────────────────
  { policyId: "KS-ACTIVATION-POLICY", domain: "kill-switch", displayName: "Kill Switch Activation", description: "Kill switch activation requires admin session + justification", scope: "global", enforcementMode: "hard-block", appliesTo: ["all kill switch targets"], condition: "admin_session.active AND justification.length > 0", action: "allow activation", violationSeverity: "critical", auditRequired: true, overridable: false, overrideRequires: null },

  // ── Data Classification ──────────────────────────────────────
  { policyId: "DATA-PII-HANDLING", domain: "data-classification", displayName: "PII Data Handling", description: "PII fields must be encrypted and access-logged", scope: "global", enforcementMode: "hard-block", appliesTo: ["profiles, biometric_credentials, financial data"], condition: "field contains PII", action: "encrypt + audit", violationSeverity: "critical", auditRequired: true, overridable: false, overrideRequires: null },
] as const;

// ── Query Functions ────────────────────────────────────────────

export function getPolicyById(id: string): UnifiedPolicyEntry | undefined {
  return UNIFIED_POLICY_MATRIX.find((p) => p.policyId === id);
}

export function getPoliciesByDomain(domain: PolicyDomain): readonly UnifiedPolicyEntry[] {
  return UNIFIED_POLICY_MATRIX.filter((p) => p.domain === domain);
}

export function getCriticalPolicies(): readonly UnifiedPolicyEntry[] {
  return UNIFIED_POLICY_MATRIX.filter((p) => p.violationSeverity === "critical");
}

export function getHardBlockPolicies(): readonly UnifiedPolicyEntry[] {
  return UNIFIED_POLICY_MATRIX.filter((p) => p.enforcementMode === "hard-block");
}

export function getOverridablePolicies(): readonly UnifiedPolicyEntry[] {
  return UNIFIED_POLICY_MATRIX.filter((p) => p.overridable);
}

export function getAuditRequiredPolicies(): readonly UnifiedPolicyEntry[] {
  return UNIFIED_POLICY_MATRIX.filter((p) => p.auditRequired);
}

export function getPoliciesByScope(scope: PolicyScope): readonly UnifiedPolicyEntry[] {
  return UNIFIED_POLICY_MATRIX.filter((p) => p.scope === scope);
}

export function validatePolicyCompleteness(): { covered: string[]; gaps: string[] } {
  const domains: PolicyDomain[] = ["rls", "admin-permission", "advisor-autonomy", "os-security", "ai-budget", "kill-switch", "data-classification"];
  const covered = domains.filter((d) => UNIFIED_POLICY_MATRIX.some((p) => p.domain === d));
  const gaps = domains.filter((d) => !UNIFIED_POLICY_MATRIX.some((p) => p.domain === d));
  return { covered, gaps };
}
