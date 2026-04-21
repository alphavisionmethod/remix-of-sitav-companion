// ═══════════════════════════════════════════════════════════════
// SITA OS — TTL Governance Map
// Declares TTL columns, cleanup mechanisms, and index requirements
// ═══════════════════════════════════════════════════════════════

export interface TtlGovernanceEntry {
  readonly table: string;
  readonly ttlColumn: string;
  readonly cleanupMechanism: "edge-function-nightly" | "pg-cron" | "application-sweep" | "manual";
  readonly indexRequired: boolean;
  readonly retentionDays: number;
  readonly description: string;
}

export const TTL_GOVERNANCE_MAP: readonly TtlGovernanceEntry[] = [
  { table: "admin_sessions", ttlColumn: "expires_at", cleanupMechanism: "edge-function-nightly", indexRequired: true, retentionDays: 1, description: "Admin sessions expire after inactivity" },
  { table: "os_sessions", ttlColumn: "expires_at", cleanupMechanism: "edge-function-nightly", indexRequired: true, retentionDays: 1, description: "OS sessions expire after inactivity" },
  { table: "os_elevation_tokens", ttlColumn: "expires_at", cleanupMechanism: "edge-function-nightly", indexRequired: true, retentionDays: 1, description: "Elevation tokens are short-lived" },
  { table: "cloud_device_sessions", ttlColumn: "expires_at", cleanupMechanism: "edge-function-nightly", indexRequired: true, retentionDays: 7, description: "Device sessions expire" },
  { table: "ai_invocations", ttlColumn: "expires_at", cleanupMechanism: "edge-function-nightly", indexRequired: true, retentionDays: 90, description: "AI invocation records archived after 90d" },
  { table: "ai_usage_ledger", ttlColumn: "expires_at", cleanupMechanism: "edge-function-nightly", indexRequired: true, retentionDays: 90, description: "AI usage ledger entries archived after 90d" },
  { table: "ai_budget_alerts", ttlColumn: "expires_at", cleanupMechanism: "edge-function-nightly", indexRequired: true, retentionDays: 30, description: "Budget alerts auto-expire" },
  { table: "ai_budget_decision_receipts", ttlColumn: "expires_at", cleanupMechanism: "edge-function-nightly", indexRequired: true, retentionDays: 90, description: "Budget decision receipts archived" },
  { table: "ai_fallback_events", ttlColumn: "expires_at", cleanupMechanism: "edge-function-nightly", indexRequired: true, retentionDays: 30, description: "Fallback events auto-expire" },
  { table: "ai_receipt_records", ttlColumn: "expires_at", cleanupMechanism: "edge-function-nightly", indexRequired: true, retentionDays: 90, description: "AI receipt records archived" },
  { table: "ai_inference_receipts", ttlColumn: "expires_at", cleanupMechanism: "edge-function-nightly", indexRequired: true, retentionDays: 365, description: "Inference receipts for cost tracking" },
  { table: "advisor_board_memory", ttlColumn: "expires_at", cleanupMechanism: "application-sweep", indexRequired: true, retentionDays: 90, description: "Advisor memory entries can expire" },
  { table: "admin_action_confirmations", ttlColumn: "cooldown_expires_at", cleanupMechanism: "application-sweep", indexRequired: true, retentionDays: 1, description: "Cooldown period for admin actions" },
  { table: "account_deletion_requests", ttlColumn: "scheduled_purge_at", cleanupMechanism: "edge-function-nightly", indexRequired: true, retentionDays: 30, description: "Deletion requests processed after cooling" },
  { table: "connector_tokens", ttlColumn: "expires_at", cleanupMechanism: "application-sweep", indexRequired: true, retentionDays: 1, description: "OAuth tokens expire and need refresh" },
  { table: "ai_workforce_cached_outputs", ttlColumn: "expires_at", cleanupMechanism: "edge-function-nightly", indexRequired: true, retentionDays: 7, description: "Cached AI outputs auto-expire" },
];

export function getTtlEntryForTable(table: string): TtlGovernanceEntry | undefined {
  return TTL_GOVERNANCE_MAP.find(e => e.table === table);
}

export function getTtlTablesRequiringIndex(): readonly TtlGovernanceEntry[] {
  return TTL_GOVERNANCE_MAP.filter(e => e.indexRequired);
}