// ═══════════════════════════════════════════════════════════════
// SITA OS — Table Classification Map
// Classifies every table by data lifecycle role
// Derives from DB_SCHEMA_REGISTRY schemaClass + naming conventions
// ═══════════════════════════════════════════════════════════════

import { DB_SCHEMA_REGISTRY } from "./schema-registry";

export type TableClassification =
  | "lifecycle-state"
  | "event-ledger"
  | "append-only-audit"
  | "receipt-proof"
  | "projection-read-model"
  | "control-plane-config"
  | "support-debug"
  | "cache-temporary"
  | "ttl-governed"
  | "queue-retry";

export interface TableClassificationEntry {
  readonly table: string;
  readonly classification: TableClassification;
  readonly rationale: string;
}

function classifyTable(name: string, schemaClass: string): { classification: TableClassification; rationale: string } {
  // Receipt/proof tables
  if (name.includes("receipt") || name.includes("proof") || name === "receipts" || name === "proof_records") {
    return { classification: "receipt-proof", rationale: "Receipt/proof naming pattern" };
  }
  // Audit tables
  if (name.includes("audit") && !name.includes("budget")) {
    return { classification: "append-only-audit", rationale: "Audit naming pattern" };
  }
  // Event/log tables
  if (name.includes("_events") || name.includes("_logs") || name === "sync_logs" || name === "audit_logs" || name === "timeline_events") {
    return { classification: "event-ledger", rationale: "Event/log naming pattern" };
  }
  if (schemaClass === "log") {
    return { classification: "event-ledger", rationale: "schemaClass=log" };
  }
  // Queue/retry tables
  if (name.includes("queue") || name.includes("_jobs") || name.includes("staging") || name.includes("dead_letter")) {
    return { classification: "queue-retry", rationale: "Queue/job naming pattern" };
  }
  // Config/registry tables
  if (schemaClass === "config" || name.includes("_registry") || name.includes("_config") || name.includes("_configs") || name.includes("feature_flag") || name.includes("_policies") && !name.includes("rls")) {
    return { classification: "control-plane-config", rationale: "Config/registry pattern" };
  }
  // System/read-model
  if (schemaClass === "system" || name.includes("snapshot") || name.includes("read_model") || name.includes("_health") || name.includes("_scores")) {
    return { classification: "projection-read-model", rationale: "System/projection pattern" };
  }
  // Cache/temporary
  if (name.includes("cache") || name.includes("_cached_") || name.includes("_temp") || name.includes("_preview_")) {
    return { classification: "cache-temporary", rationale: "Cache/temporary naming pattern" };
  }
  // Support/debug
  if (name.includes("support_") || name.includes("_debug") || name.includes("_diagnostic")) {
    return { classification: "support-debug", rationale: "Support/debug naming pattern" };
  }
  // Default: lifecycle state
  return { classification: "lifecycle-state", rationale: "Primary state table (default)" };
}

export const TABLE_CLASSIFICATION_MAP: Readonly<Record<string, TableClassificationEntry>> = (() => {
  const map: Record<string, TableClassificationEntry> = {};
  for (const t of DB_SCHEMA_REGISTRY) {
    const { classification, rationale } = classifyTable(t.name, t.schemaClass);
    map[t.name] = { table: t.name, classification, rationale };
  }
  return map;
})();

export function getClassification(table: string): TableClassification | undefined {
  return TABLE_CLASSIFICATION_MAP[table]?.classification;
}

export function getTablesByClassification(cls: TableClassification): string[] {
  return Object.entries(TABLE_CLASSIFICATION_MAP)
    .filter(([, e]) => e.classification === cls)
    .map(([k]) => k);
}