#!/usr/bin/env node
/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — DB Governance Artifact Generator
// Generates all 15 governance proof artifacts from canonical registries
// ═══════════════════════════════════════════════════════════════
import { mkdirSync, writeFileSync } from "node:fs";

// We import dynamically since these are TS files — this script is run via tsx
import { DB_SCHEMA_REGISTRY } from "../../../src/lib/db/schema-registry";
import { BOUNDED_CONTEXT_MAP } from "../../../src/lib/db/bounded-context-map";
import { SCHEMA_AUTHORITY_REGISTRY } from "../../../src/lib/db/schema-authority-registry";
import { TABLE_CLASSIFICATION_MAP } from "../../../src/lib/db/table-classification-map";
import { RETENTION_POLICY_REGISTRY } from "../../../src/lib/db/retention-policy-registry";
import { TTL_GOVERNANCE_MAP } from "../../../src/lib/db/ttl-governance-map";
import { PARTITIONING_STRATEGY_MAP } from "../../../src/lib/db/partitioning-strategy-map";
import { EXPECTED_INDEXES } from "../../../src/lib/db/index-coverage-registry";
import { CRITICAL_QUERY_FAMILIES } from "../../../src/lib/db/query-plan-governance";
import { POLICY_PATTERN_CONTRACTS, auditPolicyPatterns } from "../../../src/lib/db/policy-pattern-registry";
import { TENANT_ISOLATION_REGISTRY } from "../../../src/lib/db/tenant-isolation-map";
import { SUPPORT_VIEW_REGISTRY } from "../../../src/lib/db/support-view-registry";
import { DATA_REPAIR_PROCEDURES } from "../../../src/lib/db/data-repair-procedure-map";
import { DOMAIN_TO_OWNER } from "../../../src/lib/db/table-ownership-map";
import { MIGRATION_REGISTRY } from "../../../src/lib/db/migration-registry";

mkdirSync("generated", { recursive: true });
const ts = new Date().toISOString();

function write(name: string, data: unknown) {
  writeFileSync(`generated/${name}`, JSON.stringify({ generatedAt: ts, ...(data as object) }, null, 2));
  console.log(`  ✅ generated/${name}`);
}

// 1. Bounded context map
write("db-bounded-context-map.json", { totalTables: BOUNDED_CONTEXT_MAP.length, entries: BOUNDED_CONTEXT_MAP });

// 2. Authority map
write("db-authority-map.json", { totalTables: SCHEMA_AUTHORITY_REGISTRY.length, entries: SCHEMA_AUTHORITY_REGISTRY });

// 3. Table classification
write("db-table-classification.json", { totalTables: Object.keys(TABLE_CLASSIFICATION_MAP).length, entries: TABLE_CLASSIFICATION_MAP });

// 4. Retention policy matrix
const retentionByClass = RETENTION_POLICY_REGISTRY.reduce((acc, e) => { acc[e.retentionClass] = (acc[e.retentionClass] || 0) + 1; return acc; }, {} as Record<string, number>);
write("db-retention-policy-matrix.json", { totalTables: RETENTION_POLICY_REGISTRY.length, byClass: retentionByClass, entries: RETENTION_POLICY_REGISTRY });

// 5. Hot/cold data map
const hotColdSummary = RETENTION_POLICY_REGISTRY.reduce((acc, e) => { acc[e.hotCold] = (acc[e.hotCold] || 0) + 1; return acc; }, {} as Record<string, number>);
write("db-hot-cold-data-map.json", { summary: hotColdSummary, entries: RETENTION_POLICY_REGISTRY.map(e => ({ table: e.table, hotCold: e.hotCold, retentionClass: e.retentionClass })) });

// 6. TTL governance report
write("db-ttl-governance-report.json", { totalTtlTables: TTL_GOVERNANCE_MAP.length, entries: TTL_GOVERNANCE_MAP });

// 7. Partition strategy report
const candidates = PARTITIONING_STRATEGY_MAP.filter(e => e.strategy !== "none");
write("db-partition-strategy-report.json", { partitionCandidates: candidates.length, nonPartition: PARTITIONING_STRATEGY_MAP.length - candidates.length, entries: PARTITIONING_STRATEGY_MAP });

// 8. Index coverage
const indexByPriority = EXPECTED_INDEXES.reduce((acc, e) => { acc[e.priority] = (acc[e.priority] || 0) + 1; return acc; }, {} as Record<string, number>);
write("db-index-coverage.json", { totalExpectedIndexes: EXPECTED_INDEXES.length, byPriority: indexByPriority, entries: EXPECTED_INDEXES });

// 9. Query plan baseline
write("db-query-plan-baseline.json", { totalQueryFamilies: CRITICAL_QUERY_FAMILIES.length, entries: CRITICAL_QUERY_FAMILIES });

// 10. Policy pattern audit
const auditResults = auditPolicyPatterns();
const inconsistent = auditResults.filter(r => !r.consistent);
write("db-policy-pattern-audit.json", { totalTables: auditResults.length, consistent: auditResults.length - inconsistent.length, inconsistent: inconsistent.length, patternContracts: POLICY_PATTERN_CONTRACTS.length, issues: inconsistent });

// 11. Tenant isolation proof
const unverified = TENANT_ISOLATION_REGISTRY.filter(e => !e.verified);
write("db-tenant-isolation-proof.json", { totalTables: TENANT_ISOLATION_REGISTRY.length, verified: TENANT_ISOLATION_REGISTRY.length - unverified.length, unverified: unverified.length, entries: TENANT_ISOLATION_REGISTRY });

// 12. Support views map
write("db-support-views-map.json", { totalViews: SUPPORT_VIEW_REGISTRY.length, entries: SUPPORT_VIEW_REGISTRY });

// 13. Repair procedure coverage
write("db-repair-procedure-coverage.json", { totalProcedures: DATA_REPAIR_PROCEDURES.length, entries: DATA_REPAIR_PROCEDURES });

// 14. Schema ownership map
write("db-schema-ownership-map.json", { domainToOwner: DOMAIN_TO_OWNER, tableCount: DB_SCHEMA_REGISTRY.length });

// 15. Migration governance report
const migrationByContext = MIGRATION_REGISTRY.reduce((acc, m) => { acc[m.boundedContext] = (acc[m.boundedContext] || 0) + 1; return acc; }, {} as Record<string, number>);
const highRisk = MIGRATION_REGISTRY.filter(m => m.rollbackRisk === "high" || m.rollbackRisk === "critical");
write("db-migration-governance-report.json", { totalMigrations: MIGRATION_REGISTRY.length, byContext: migrationByContext, highRiskMigrations: highRisk.length, archiveCandidates: MIGRATION_REGISTRY.filter(m => m.category === "seed-data" || m.category === "data-migration").length });

console.log(`\n✅ All 15 DB governance artifacts generated`);