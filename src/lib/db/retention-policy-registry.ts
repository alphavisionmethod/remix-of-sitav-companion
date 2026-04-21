// ═══════════════════════════════════════════════════════════════
// SITA OS — Retention Policy Registry
// Extends DB_AUDIT_REGISTRY retention data to all table families
// ═══════════════════════════════════════════════════════════════

import { DB_SCHEMA_REGISTRY } from "./schema-registry";
import { DB_AUDIT_REGISTRY } from "./db-audit-registry";
import { TABLE_CLASSIFICATION_MAP } from "./table-classification-map";

export type RetentionClass = "permanent" | "long-term-7yr" | "medium-1yr" | "short-90d" | "transient-30d" | "session";
export type ArchivePolicy = "append-only" | "soft-delete" | "hard-delete" | "ttl-purge";
export type RowGrowth = "low" | "medium" | "high" | "very-high";
export type HotCold = "hot" | "warm" | "cold";

export interface RetentionPolicyEntry {
  readonly table: string;
  readonly retentionClass: RetentionClass;
  readonly retentionDays: number;
  readonly archivePolicy: ArchivePolicy;
  readonly ttlColumn: string | null;
  readonly expectedRowGrowth: RowGrowth;
  readonly hotCold: HotCold;
}

const TTL_TABLES: Record<string, string> = {
  admin_sessions: "expires_at",
  os_sessions: "expires_at",
  os_elevation_tokens: "expires_at",
  cloud_device_sessions: "expires_at",
  ai_invocations: "expires_at",
  ai_usage_ledger: "expires_at",
  ai_budget_alerts: "expires_at",
  ai_budget_decision_receipts: "expires_at",
  ai_fallback_events: "expires_at",
  ai_receipt_records: "expires_at",
  ai_inference_receipts: "expires_at",
  advisor_board_memory: "expires_at",
  admin_action_confirmations: "cooldown_expires_at",
  account_deletion_requests: "scheduled_purge_at",
  connector_tokens: "expires_at",
  ai_workforce_cached_outputs: "expires_at",
};

const HIGH_GROWTH_TABLES = new Set([
  "timeline_events", "audit_logs", "ai_inference_receipts", "sync_logs",
  "tenant_firewall_logs", "ai_workforce_invocations", "ai_invocations",
  "os_command_events", "ecosystem_events", "cloud_audit_events",
  "notification_delivery_receipts", "ai_usage_ledger",
]);

function inferRetention(name: string, cls: string): { retentionClass: RetentionClass; retentionDays: number; archivePolicy: ArchivePolicy; hotCold: HotCold } {
  const auditEntry = DB_AUDIT_REGISTRY.find(a => a.table === name);
  if (auditEntry) {
    const rc: RetentionClass = auditEntry.retentionDays >= 2555 ? "long-term-7yr" : auditEntry.retentionDays >= 365 ? "medium-1yr" : "short-90d";
    const ap: ArchivePolicy = auditEntry.requirement === "append-only" ? "append-only" : "soft-delete";
    const hc: HotCold = auditEntry.retentionDays >= 2555 ? "cold" : "warm";
    return { retentionClass: rc, retentionDays: auditEntry.retentionDays, archivePolicy: ap, hotCold: hc };
  }
  if (cls === "append-only-audit" || cls === "receipt-proof") return { retentionClass: "long-term-7yr", retentionDays: 2555, archivePolicy: "append-only", hotCold: "cold" };
  if (cls === "event-ledger") return { retentionClass: "medium-1yr", retentionDays: 365, archivePolicy: "append-only", hotCold: "warm" };
  if (cls === "cache-temporary") return { retentionClass: "transient-30d", retentionDays: 30, archivePolicy: "ttl-purge", hotCold: "hot" };
  if (cls === "queue-retry") return { retentionClass: "short-90d", retentionDays: 90, archivePolicy: "hard-delete", hotCold: "hot" };
  if (name.includes("session") || name.includes("token")) return { retentionClass: "short-90d", retentionDays: 90, archivePolicy: "ttl-purge", hotCold: "hot" };
  if (cls === "control-plane-config") return { retentionClass: "permanent", retentionDays: -1, archivePolicy: "soft-delete", hotCold: "warm" };
  return { retentionClass: "permanent", retentionDays: -1, archivePolicy: "soft-delete", hotCold: "warm" };
}

export const RETENTION_POLICY_REGISTRY: readonly RetentionPolicyEntry[] = DB_SCHEMA_REGISTRY.map(t => {
  const cls = TABLE_CLASSIFICATION_MAP[t.name]?.classification ?? "lifecycle-state";
  const { retentionClass, retentionDays, archivePolicy, hotCold } = inferRetention(t.name, cls);
  return {
    table: t.name,
    retentionClass,
    retentionDays,
    archivePolicy,
    ttlColumn: TTL_TABLES[t.name] ?? null,
    expectedRowGrowth: HIGH_GROWTH_TABLES.has(t.name) ? "very-high" as RowGrowth : (cls === "event-ledger" ? "high" as RowGrowth : "medium" as RowGrowth),
    hotCold,
  };
});

export function getRetentionForTable(table: string): RetentionPolicyEntry | undefined {
  return RETENTION_POLICY_REGISTRY.find(e => e.table === table);
}

export function getTtlGovernedTables(): readonly RetentionPolicyEntry[] {
  return RETENTION_POLICY_REGISTRY.filter(e => e.ttlColumn !== null);
}