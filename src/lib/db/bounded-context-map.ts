// ═══════════════════════════════════════════════════════════════
// SITA OS — Bounded Context Map
// Projects DB_SCHEMA_REGISTRY + DOMAIN_TO_OWNER + TABLE_CLASSIFICATION_MAP
// into a canonical bounded-context assignment per table
// ═══════════════════════════════════════════════════════════════

import { DB_SCHEMA_REGISTRY } from "./schema-registry";
import { DOMAIN_TO_OWNER } from "./table-ownership-map";
import { TABLE_CLASSIFICATION_MAP, type TableClassification } from "./table-classification-map";

export type RetentionCategory = "permanent" | "long-term-7yr" | "medium-1yr" | "short-90d" | "transient-30d" | "session";
export type SupportImportance = "critical" | "high" | "medium" | "low";

export interface BoundedContextEntry {
  readonly tableName: string;
  readonly boundedContext: string;
  readonly owner: string;
  readonly tableRole: string;
  readonly classification: TableClassification;
  readonly retentionCategory: RetentionCategory;
  readonly supportImportance: SupportImportance;
}

function inferRetention(name: string, cls: TableClassification): RetentionCategory {
  if (cls === "append-only-audit" || cls === "receipt-proof") return "long-term-7yr";
  if (cls === "event-ledger") return "medium-1yr";
  if (cls === "cache-temporary") return "transient-30d";
  if (cls === "queue-retry") return "short-90d";
  if (name.includes("session") || name.includes("token") || name.includes("elevation")) return "short-90d";
  if (cls === "control-plane-config") return "permanent";
  return "permanent";
}

function inferSupportImportance(name: string, cls: TableClassification, sensitive: boolean): SupportImportance {
  if (sensitive) return "critical";
  if (cls === "append-only-audit" || cls === "receipt-proof") return "critical";
  if (name.includes("session") || name.includes("auth") || name.includes("payment") || name.includes("invoice")) return "high";
  if (cls === "event-ledger") return "high";
  if (cls === "queue-retry") return "medium";
  return "medium";
}

export const BOUNDED_CONTEXT_MAP: readonly BoundedContextEntry[] = DB_SCHEMA_REGISTRY.map(t => {
  const cls = TABLE_CLASSIFICATION_MAP[t.name]?.classification ?? "lifecycle-state";
  return {
    tableName: t.name,
    boundedContext: t.domain,
    owner: DOMAIN_TO_OWNER[t.domain] ?? "platform-engineering",
    tableRole: t.schemaClass,
    classification: cls,
    retentionCategory: inferRetention(t.name, cls),
    supportImportance: inferSupportImportance(t.name, cls, t.sensitiveData),
  };
});

export function getContextForTable(table: string): BoundedContextEntry | undefined {
  return BOUNDED_CONTEXT_MAP.find(e => e.tableName === table);
}

export function getTablesByContext(ctx: string): BoundedContextEntry[] {
  return BOUNDED_CONTEXT_MAP.filter(e => e.boundedContext === ctx);
}