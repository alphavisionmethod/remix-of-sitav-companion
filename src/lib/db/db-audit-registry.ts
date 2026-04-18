// ═══════════════════════════════════════════════════════════════
// SITA OS — DB Audit Registry
// Which tables have audit trail requirements
// ═══════════════════════════════════════════════════════════════

export type AuditRequirement = "full" | "write-only" | "append-only" | "none";

export interface AuditRegistryEntry {
  readonly table: string;
  readonly requirement: AuditRequirement;
  readonly retentionDays: number;
  readonly reason: string;
}

export const DB_AUDIT_REGISTRY: readonly AuditRegistryEntry[] = [
  { table: "audit_logs", requirement: "append-only", retentionDays: 2555, reason: "Primary audit trail — 7 year retention for compliance" },
  { table: "admin_action_audit", requirement: "append-only", retentionDays: 2555, reason: "Admin actions must be permanently recorded" },
  { table: "tenant_firewall_logs", requirement: "append-only", retentionDays: 365, reason: "Security log — 1 year retention" },
  { table: "receipts", requirement: "append-only", retentionDays: 2555, reason: "Execution proofs — immutable" },
  { table: "proof_records", requirement: "append-only", retentionDays: 2555, reason: "Evidence records — immutable" },
  { table: "boardroom_decision_receipts", requirement: "full", retentionDays: 2555, reason: "Decision audit trail" },
  { table: "approval_decisions", requirement: "append-only", retentionDays: 2555, reason: "Approval trail — immutable" },
  { table: "ai_inference_receipts", requirement: "append-only", retentionDays: 365, reason: "AI cost tracking" },
  { table: "ai_workforce_invocations", requirement: "write-only", retentionDays: 90, reason: "AI invocation tracking" },
  { table: "execution_envelopes", requirement: "full", retentionDays: 365, reason: "Command execution tracking" },
  { table: "command_steps", requirement: "append-only", retentionDays: 365, reason: "Command step tracking" },
  { table: "incidents", requirement: "full", retentionDays: 365, reason: "Incident management" },
  { table: "sync_logs", requirement: "append-only", retentionDays: 90, reason: "Connector sync tracking" },
  { table: "admin_action_confirmations", requirement: "full", retentionDays: 2555, reason: "Dual-approval audit trail" },
  { table: "timeline_events", requirement: "append-only", retentionDays: 365, reason: "Event timeline — append only" },
  { table: "user_roles", requirement: "full", retentionDays: 2555, reason: "RBAC changes must be audited" },
  { table: "profiles", requirement: "write-only", retentionDays: 365, reason: "Profile changes tracked for GDPR" },
  { table: "invoices", requirement: "full", retentionDays: 2555, reason: "Financial records — 7 year retention" },
] as const;

export function getAuditRequirementForTable(table: string): AuditRegistryEntry | undefined {
  return DB_AUDIT_REGISTRY.find(e => e.table === table);
}

export function getTablesRequiringAudit(): readonly AuditRegistryEntry[] {
  return DB_AUDIT_REGISTRY.filter(e => e.requirement !== "none");
}

export function getAppendOnlyAuditTables(): readonly string[] {
  return DB_AUDIT_REGISTRY.filter(e => e.requirement === "append-only").map(e => e.table);
}

export function getLongRetentionTables(minDays: number): readonly AuditRegistryEntry[] {
  return DB_AUDIT_REGISTRY.filter(e => e.retentionDays >= minDays);
}
