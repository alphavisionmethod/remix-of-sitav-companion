// ═══════════════════════════════════════════════════════════════
// SITA OS — DB Truth Layer
// Barrel export for all database truth registries
// ═══════════════════════════════════════════════════════════════

export * from "./schema-registry";
export * from "./table-ownership-map";
export * from "./tenancy-boundary-map";
export * from "./rls-policy-registry";
export * from "./migration-registry";
export * from "./db-truth-registry";
export * from "./db-runtime-consequence-map";
export * from "./db-dependency-map";
export * from "./db-audit-registry";
export * from "./db-health-engine";
export * from "./table-writer-reader-map";
export * from "./non-edge-table-io-sources";
export * from "./cross-domain-write-exemptions";
export * from "./table-classification-map";
export * from "./bounded-context-map";
export * from "./schema-authority-registry";
export * from "./retention-policy-registry";
export * from "./ttl-governance-map";
export * from "./partitioning-strategy-map";
export * from "./index-coverage-registry";
export * from "./query-plan-governance";
export * from "./policy-pattern-registry";
export * from "./tenant-isolation-map";
export * from "./support-view-registry";
export * from "./data-repair-procedure-map";
