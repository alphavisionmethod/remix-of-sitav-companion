// ═══════════════════════════════════════════════════════════════
// SITA OS — Partitioning Strategy Map
// Declares partition recommendations for high-growth table families
// ═══════════════════════════════════════════════════════════════

export type PartitionStrategy = "range-monthly" | "range-quarterly" | "hash" | "none";

export interface PartitionStrategyEntry {
  readonly table: string;
  readonly strategy: PartitionStrategy;
  readonly partitionKey: string | null;
  readonly estimatedRowsPerMonth: string;
  readonly rationale: string;
}

export const PARTITIONING_STRATEGY_MAP: readonly PartitionStrategyEntry[] = [
  { table: "timeline_events", strategy: "range-monthly", partitionKey: "created_at", estimatedRowsPerMonth: "100k+", rationale: "High-volume append-only event stream, benefits from time-range partitioning" },
  { table: "audit_logs", strategy: "range-monthly", partitionKey: "created_at", estimatedRowsPerMonth: "50k+", rationale: "Append-only audit trail, partition for archival and query performance" },
  { table: "ai_inference_receipts", strategy: "range-monthly", partitionKey: "created_at", estimatedRowsPerMonth: "50k+", rationale: "High-volume AI cost tracking, partition for retention management" },
  { table: "sync_logs", strategy: "range-quarterly", partitionKey: "created_at", estimatedRowsPerMonth: "20k+", rationale: "Connector sync logs grow steadily, quarterly partitions sufficient" },
  { table: "tenant_firewall_logs", strategy: "range-monthly", partitionKey: "created_at", estimatedRowsPerMonth: "30k+", rationale: "Security logs need fast time-range queries" },
  { table: "ai_workforce_invocations", strategy: "range-monthly", partitionKey: "created_at", estimatedRowsPerMonth: "50k+", rationale: "AI invocations are high-volume, partition for cost analysis" },
  { table: "ai_invocations", strategy: "range-monthly", partitionKey: "created_at", estimatedRowsPerMonth: "50k+", rationale: "Core AI invocation tracking, high volume" },
  { table: "os_command_events", strategy: "range-quarterly", partitionKey: "created_at", estimatedRowsPerMonth: "10k+", rationale: "Command events grow moderately" },
  { table: "cloud_audit_events", strategy: "range-quarterly", partitionKey: "created_at", estimatedRowsPerMonth: "10k+", rationale: "Cloud audit events grow moderately" },
  { table: "notification_delivery_receipts", strategy: "range-quarterly", partitionKey: "created_at", estimatedRowsPerMonth: "10k+", rationale: "Notification receipts grow with user activity" },
  { table: "ai_usage_ledger", strategy: "range-monthly", partitionKey: "created_at", estimatedRowsPerMonth: "50k+", rationale: "Usage ledger is high-volume cost tracking" },
  // Explicit non-partition rationales for important tables
  { table: "profiles", strategy: "none", partitionKey: null, estimatedRowsPerMonth: "<1k", rationale: "Low row count, no partition benefit" },
  { table: "receipts", strategy: "none", partitionKey: null, estimatedRowsPerMonth: "5k", rationale: "Moderate growth, single-table indexing sufficient" },
  { table: "invoices", strategy: "none", partitionKey: null, estimatedRowsPerMonth: "<1k", rationale: "Low volume financial records, no partition benefit" },
  { table: "connector_configs", strategy: "none", partitionKey: null, estimatedRowsPerMonth: "<100", rationale: "Very low volume config table" },
];

export function getPartitionStrategy(table: string): PartitionStrategyEntry | undefined {
  return PARTITIONING_STRATEGY_MAP.find(e => e.table === table);
}

export function getPartitionCandidates(): readonly PartitionStrategyEntry[] {
  return PARTITIONING_STRATEGY_MAP.filter(e => e.strategy !== "none");
}