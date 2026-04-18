// ═══════════════════════════════════════════════════════════════
// SITA OS — Table Writer/Reader Registry (Phase 18.2)
//
// Inverse projection of EDGE_FUNCTION_TABLE_IO. For every table in
// DB_SCHEMA_REGISTRY, computes:
//   - owner domain (from table-ownership-map)
//   - declared writers + readers (from edge-function-table-io-map)
//   - crossDomainWriters: writer functions whose owner-team does NOT
//     match the table's owner team — release blocker.
//
// Used by: check-db-reality.ts (CI Gate 29) and DbTruthExplorer.tsx.
// ═══════════════════════════════════════════════════════════════

import { DB_SCHEMA_REGISTRY, type DbDomain } from "./schema-registry";
import { DOMAIN_TO_OWNER, type OwnershipTeam } from "./table-ownership-map";
import {
  EDGE_FUNCTION_TABLE_IO,
  getReadersFor,
  getWritersFor,
} from "../backend-topology/edge-function-table-io-map";
import { EDGE_FUNCTION_OWNER_MAP, type OwnerTeam } from "../backend-topology/edge-function-owner-map";
import { NON_EDGE_TABLE_IO, type TableIOSource } from "./non-edge-table-io-sources";
import {
  isExemptedCrossDomainWriter,
} from "./cross-domain-write-exemptions";

export interface TableWriterReaderEntry {
  readonly table: string;
  readonly domain: DbDomain;
  readonly ownerTeam: OwnershipTeam;
  /** Edge-function writers (function names). */
  readonly writers: readonly string[];
  /** Edge-function readers (function names). */
  readonly readers: readonly string[];
  /** Non-edge writers (client-sdk / rpc / trigger / system / view). */
  readonly nonEdgeWriters: readonly TableIOSource[];
  /** Non-edge readers. */
  readonly nonEdgeReaders: readonly TableIOSource[];
  /** Writer functions whose owner-team is NOT aligned with the table's owner team. */
  readonly crossDomainWriters: readonly string[];
  /** Cross-domain writers without an exemption — release blocker. */
  readonly unexemptedCrossDomainWriters: readonly string[];
  /** True when at least one writer or reader (edge OR non-edge) is declared. */
  readonly hasAnyIO: boolean;
}

/** Map function-owner team → table-owner team for cross-domain comparison. */
const FUNCTION_OWNER_TO_TABLE_OWNER: Record<OwnerTeam, OwnershipTeam> = {
  "platform-core": "platform-engineering",
  "admin-governance": "admin-governance",
  "advisor-intelligence": "advisor-team",
  "agent-runtime": "platform-engineering",
  "ai-engineering": "ai-engineering",
  "cloud-infrastructure": "cloud-team",
  "connector-integrations": "connector-team",
  "finance-engine": "finance-team",
  "notification-services": "notification-team",
  "os-kernel": "os-kernel-team",
  "compliance-security": "compliance-team",
  "user-experience": "ux-team",
};

/** Tables exempt from cross-domain writer check (shared/infrastructure). */
const SHARED_TABLES = new Set<string>([
  "admin_action_audit",      // any admin-tier function may audit
  "audit_logs",              // legacy generic audit table
  "timeline_events",         // global timeline log
  "approval_decisions",      // any function may request approval
  "command_steps",           // executor + helpers
  "communication_log",       // shared comms
  "platform_notifications",  // shared notification stream
  "ai_inference_receipts",   // ai-gateway side-effect from any caller
  "ai_usage_ledger",         // ai-gateway ledger
  "cloud_audit_events",      // shared cloud audit
  "receipts",                // shared finance receipt
]);

export const TABLE_WRITER_READER_MAP: Record<string, TableWriterReaderEntry> =
  Object.fromEntries(
    DB_SCHEMA_REGISTRY.map((t) => {
      const writers = getWritersFor(t.name);
      const readers = getReadersFor(t.name);
      const ownerTeam = DOMAIN_TO_OWNER[t.domain];
      const nonEdge = NON_EDGE_TABLE_IO[t.name];
      const nonEdgeWriters = nonEdge?.writers ?? [];
      const nonEdgeReaders = nonEdge?.readers ?? [];
      const crossDomainWriters = SHARED_TABLES.has(t.name)
        ? []
        : writers.filter((fn) => {
            const io = EDGE_FUNCTION_TABLE_IO[fn];
            if (io?.wrapper) return false;
            const fnOwner = EDGE_FUNCTION_OWNER_MAP[fn];
            if (!fnOwner) return false;
            const expectedTableOwner = FUNCTION_OWNER_TO_TABLE_OWNER[fnOwner];
            return expectedTableOwner !== ownerTeam;
          });
      const unexemptedCrossDomainWriters = crossDomainWriters.filter(
        (fn) => !isExemptedCrossDomainWriter(t.name, fn),
      );
      const hasAnyIO =
        writers.length > 0 ||
        readers.length > 0 ||
        nonEdgeWriters.length > 0 ||
        nonEdgeReaders.length > 0;
      return [
        t.name,
        {
          table: t.name,
          domain: t.domain,
          ownerTeam,
          writers,
          readers,
          nonEdgeWriters,
          nonEdgeReaders,
          crossDomainWriters,
          unexemptedCrossDomainWriters,
          hasAnyIO,
        } as TableWriterReaderEntry,
      ];
    }),
  );

export function getTableWriterReader(table: string): TableWriterReaderEntry | undefined {
  return TABLE_WRITER_READER_MAP[table];
}

export function tableWriterReaderStats() {
  const entries = Object.values(TABLE_WRITER_READER_MAP);
  return {
    totalTables: entries.length,
    tablesWithWriters: entries.filter((e) => e.writers.length > 0 || e.nonEdgeWriters.length > 0).length,
    tablesWithReaders: entries.filter((e) => e.readers.length > 0 || e.nonEdgeReaders.length > 0).length,
    tablesWithoutAnyIO: entries.filter((e) => !e.hasAnyIO).length,
    crossDomainViolations: entries.reduce((acc, e) => acc + e.crossDomainWriters.length, 0),
    tablesWithCrossDomainWriters: entries.filter((e) => e.crossDomainWriters.length > 0).length,
    unexemptedCrossDomainWriters: entries.reduce(
      (acc, e) => acc + e.unexemptedCrossDomainWriters.length,
      0,
    ),
  };
}
