// ═══════════════════════════════════════════════════════════════
// SITA OS — Policy Pattern Registry
// Standardizes the 12 RlsPattern types into canonical contracts
// ═══════════════════════════════════════════════════════════════

import { RLS_POLICY_REGISTRY, type RlsPattern } from "./rls-policy-registry";
import { TABLE_CLASSIFICATION_MAP } from "./table-classification-map";

export interface PolicyPatternContract {
  readonly pattern: RlsPattern;
  readonly description: string;
  readonly expectedUsingClause: string;
  readonly expectedWithCheck: string;
  readonly applicableTableClasses: readonly string[];
  readonly securityRequirements: readonly string[];
}

export const POLICY_PATTERN_CONTRACTS: readonly PolicyPatternContract[] = [
  { pattern: "user_id_match", description: "Row-level isolation by auth.uid() = user_id", expectedUsingClause: "auth.uid() = user_id", expectedWithCheck: "auth.uid() = user_id", applicableTableClasses: ["lifecycle-state", "event-ledger", "queue-retry"], securityRequirements: ["user_id NOT NULL", "RLS enabled"] },
  { pattern: "owner_id_match", description: "Row-level isolation by auth.uid() = owner_id", expectedUsingClause: "auth.uid() = owner_id", expectedWithCheck: "auth.uid() = owner_id", applicableTableClasses: ["lifecycle-state"], securityRequirements: ["owner_id NOT NULL", "RLS enabled"] },
  { pattern: "actor_user_id_match", description: "Actor-based access for audit tables", expectedUsingClause: "auth.uid() = actor_user_id", expectedWithCheck: "auth.uid() = actor_user_id", applicableTableClasses: ["append-only-audit", "event-ledger"], securityRequirements: ["actor_user_id NOT NULL", "RLS enabled"] },
  { pattern: "org_membership", description: "Organization-scoped access via membership", expectedUsingClause: "EXISTS(org_members check)", expectedWithCheck: "EXISTS(org_members check)", applicableTableClasses: ["lifecycle-state"], securityRequirements: ["org_id NOT NULL", "RLS enabled"] },
  { pattern: "tenant_membership", description: "Multi-tenant isolation via tenant membership", expectedUsingClause: "EXISTS(tenant_memberships check)", expectedWithCheck: "EXISTS(tenant_memberships check)", applicableTableClasses: ["lifecycle-state", "control-plane-config"], securityRequirements: ["tenant_id NOT NULL", "RLS enabled"] },
  { pattern: "admin_role", description: "Admin-only access via role check", expectedUsingClause: "has_role(auth.uid(), 'admin')", expectedWithCheck: "has_role(auth.uid(), 'admin')", applicableTableClasses: ["control-plane-config", "append-only-audit"], securityRequirements: ["RLS enabled", "admin role function"] },
  { pattern: "admin_permission", description: "Admin access via specific permission", expectedUsingClause: "has_admin_permission(auth.uid(), ...)", expectedWithCheck: "has_admin_permission(auth.uid(), ...)", applicableTableClasses: ["control-plane-config"], securityRequirements: ["RLS enabled", "permission function"] },
  { pattern: "public_read", description: "Publicly readable, write-restricted", expectedUsingClause: "true (SELECT)", expectedWithCheck: "auth.uid() = user_id (INSERT/UPDATE)", applicableTableClasses: ["control-plane-config", "projection-read-model"], securityRequirements: ["RLS enabled", "write policies present"] },
  { pattern: "authenticated_all", description: "All authenticated users can access", expectedUsingClause: "auth.role() = 'authenticated'", expectedWithCheck: "auth.role() = 'authenticated'", applicableTableClasses: ["control-plane-config", "projection-read-model"], securityRequirements: ["RLS enabled"] },
  { pattern: "read_only", description: "Read-only access, no write policies", expectedUsingClause: "auth.uid() = user_id", expectedWithCheck: "N/A (no INSERT/UPDATE)", applicableTableClasses: ["projection-read-model", "receipt-proof"], securityRequirements: ["RLS enabled", "no INSERT/UPDATE policies"] },
  { pattern: "append_only", description: "Insert-only, no updates or deletes", expectedUsingClause: "auth.uid() = user_id (SELECT)", expectedWithCheck: "auth.uid() = user_id (INSERT)", applicableTableClasses: ["append-only-audit", "receipt-proof", "event-ledger"], securityRequirements: ["RLS enabled", "no UPDATE/DELETE policies"] },
  { pattern: "service_role_only", description: "Only service_role can access", expectedUsingClause: "auth.role() = 'service_role'", expectedWithCheck: "auth.role() = 'service_role'", applicableTableClasses: ["append-only-audit", "receipt-proof", "control-plane-config"], securityRequirements: ["RLS enabled", "explicit service_role check"] },
  // no_policies removed — all tables now have policies
];

export interface PolicyPatternAuditResult {
  readonly table: string;
  readonly pattern: RlsPattern;
  readonly classification: string;
  readonly consistent: boolean;
  readonly issue: string | null;
}

export function auditPolicyPatterns(): readonly PolicyPatternAuditResult[] {
  const results: PolicyPatternAuditResult[] = [];
  for (const [table, entry] of Object.entries(RLS_POLICY_REGISTRY)) {
    const cls = TABLE_CLASSIFICATION_MAP[table]?.classification ?? "lifecycle-state";
    const contract = POLICY_PATTERN_CONTRACTS.find(c => c.pattern === entry.pattern);
    let consistent = true;
    let issue: string | null = null;
    if (contract && !contract.applicableTableClasses.includes(cls)) {
      consistent = false;
      issue = `Pattern '${entry.pattern}' not typical for classification '${cls}'`;
    }
    // Check append-only audit tables allowing updates
    if (cls === "append-only-audit" && (entry.updatePolicy || entry.deletePolicy)) {
      consistent = false;
      issue = `Audit table '${table}' should not allow UPDATE/DELETE`;
    }
    results.push({ table, pattern: entry.pattern, classification: cls, consistent, issue });
  }
  return results;
}

export function getContractForPattern(pattern: RlsPattern): PolicyPatternContract | undefined {
  return POLICY_PATTERN_CONTRACTS.find(c => c.pattern === pattern);
}