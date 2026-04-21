// ═══════════════════════════════════════════════════════════════
// SITA OS — Schema Authority Registry
// Extends DB_TRUTH_REGISTRY with full authority typing per table
// ═══════════════════════════════════════════════════════════════

import { DB_SCHEMA_REGISTRY } from "./schema-registry";
import { DB_TRUTH_REGISTRY } from "./db-truth-registry";
import { TABLE_CLASSIFICATION_MAP, type TableClassification } from "./table-classification-map";
import { TENANCY_BOUNDARY_MAP } from "./tenancy-boundary-map";

export type AuthorityType =
  | "source-of-truth"
  | "derived"
  | "event"
  | "append-only-audit"
  | "receipt"
  | "queue"
  | "support"
  | "config";

export type Criticality = "critical" | "high" | "medium" | "low";

export interface SchemaAuthorityEntry {
  readonly table: string;
  readonly authorityType: AuthorityType;
  readonly criticality: Criticality;
  readonly tenantScope: string;
  readonly rlsRequired: boolean;
  readonly lifecycleExpectation: string;
}

function classificationToAuthority(cls: TableClassification): AuthorityType {
  switch (cls) {
    case "append-only-audit": return "append-only-audit";
    case "receipt-proof": return "receipt";
    case "event-ledger": return "event";
    case "control-plane-config": return "config";
    case "projection-read-model": return "derived";
    case "queue-retry": return "queue";
    case "support-debug": return "support";
    case "cache-temporary": return "derived";
    default: return "source-of-truth";
  }
}

function inferCriticality(name: string, cls: TableClassification, sensitive: boolean): Criticality {
  if (sensitive) return "critical";
  const truthTable = DB_TRUTH_REGISTRY.find(t => t.authoritativeTable === name);
  if (truthTable) return "critical";
  if (cls === "append-only-audit" || cls === "receipt-proof") return "high";
  if (name.includes("session") || name.includes("payment") || name.includes("invoice") || name.includes("role")) return "high";
  if (cls === "cache-temporary") return "low";
  return "medium";
}

function inferLifecycle(cls: TableClassification): string {
  switch (cls) {
    case "append-only-audit": return "append-only, immutable after write";
    case "receipt-proof": return "append-only, immutable after write";
    case "event-ledger": return "append-only, TTL-governed archival";
    case "control-plane-config": return "long-lived, admin-managed";
    case "projection-read-model": return "derived, rebuildable from source";
    case "queue-retry": return "transient, auto-purged after processing";
    case "cache-temporary": return "transient, auto-expired";
    case "support-debug": return "operational, periodic cleanup";
    default: return "long-lived, user-managed CRUD";
  }
}

export const SCHEMA_AUTHORITY_REGISTRY: readonly SchemaAuthorityEntry[] = DB_SCHEMA_REGISTRY.map(t => {
  const cls = TABLE_CLASSIFICATION_MAP[t.name]?.classification ?? "lifecycle-state";
  const tenancy = TENANCY_BOUNDARY_MAP[t.name];
  return {
    table: t.name,
    authorityType: classificationToAuthority(cls),
    criticality: inferCriticality(t.name, cls, t.sensitiveData),
    tenantScope: tenancy?.model ?? "unknown",
    rlsRequired: true,
    lifecycleExpectation: inferLifecycle(cls),
  };
});

export function getAuthorityForTable(table: string): SchemaAuthorityEntry | undefined {
  return SCHEMA_AUTHORITY_REGISTRY.find(e => e.table === table);
}

export function getCriticalAuthorityTables(): readonly SchemaAuthorityEntry[] {
  return SCHEMA_AUTHORITY_REGISTRY.filter(e => e.criticality === "critical");
}