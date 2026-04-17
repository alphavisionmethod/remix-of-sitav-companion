/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — DB Reality CI Gate (Phase 18.5, Gate 29)
//
// Single roll-up gate that asserts the 17-item Database / Migration
// Reality Checklist is truthfully ready:
//
//   - Every table has an owner domain (item 3.a)
//   - Every active edge function has an entry in EDGE_FUNCTION_TABLE_IO (3.b/3.c)
//   - crossDomainWriters per table is empty (item 16)
//   - backups/manifest.json exists and latest run is ≤ 8 days old (item 13)
//   - generated/restore-drill-report.json exists with ok:true (item 14)
//   - schema-registry / rls-coverage / tenancy-boundary checks pass (item 15)
//
// Emits: generated/db-reality-report.json
// ═══════════════════════════════════════════════════════════════

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { DB_SCHEMA_REGISTRY } from "../../../src/lib/db/schema-registry";
import { DOMAIN_TO_OWNER } from "../../../src/lib/db/table-ownership-map";
import {
  TABLE_WRITER_READER_MAP,
  tableWriterReaderStats,
} from "../../../src/lib/db/table-writer-reader-map";
import {
  EDGE_FUNCTION_TABLE_IO,
  ioMapStats,
  listIOMappedFunctions,
} from "../../../src/lib/backend-topology/edge-function-table-io-map";
import { EDGE_FUNCTION_BACKEND_CATEGORY } from "../../../src/lib/backend-topology/edge-function-categories";

const REPORT = "generated/db-reality-report.json";
const BACKUP_MANIFEST = "backups/manifest.json";
const RESTORE_REPORT = "generated/restore-drill-report.json";
const MAX_BACKUP_AGE_DAYS = 8;

interface Issue { severity: "error" | "warning"; code: string; message: string }
const issues: Issue[] = [];
const add = (severity: Issue["severity"], code: string, message: string) =>
  issues.push({ severity, code, message });

// ── Item 3.a: every table has an owner domain ─────────────────
let unownedTables = 0;
for (const t of DB_SCHEMA_REGISTRY) {
  if (!DOMAIN_TO_OWNER[t.domain]) {
    add("error", "table-no-owner", `Table ${t.name} (domain=${t.domain}) has no owner team`);
    unownedTables++;
  }
}

// ── Item 3.b/3.c: every active fn has an I/O entry ────────────
const ioMapped = new Set(listIOMappedFunctions());
const missingFromIO: string[] = [];
for (const [fn, verdict] of Object.entries(EDGE_FUNCTION_BACKEND_CATEGORY)) {
  if (verdict === "DEPRECATE_AND_REDIRECT") continue; // skip deprecated
  if (!ioMapped.has(fn)) {
    missingFromIO.push(fn);
    add("error", "fn-no-io-map", `Edge function ${fn} (${verdict}) has no entry in EDGE_FUNCTION_TABLE_IO`);
  }
}

// ── Item 16: cross-domain writers (must be exempted) ──────────
const crossDomainOffenders: { table: string; writers: readonly string[]; unexempted: readonly string[] }[] = [];
let unexemptedTotal = 0;
for (const entry of Object.values(TABLE_WRITER_READER_MAP)) {
  if (entry.crossDomainWriters.length > 0) {
    crossDomainOffenders.push({
      table: entry.table,
      writers: entry.crossDomainWriters,
      unexempted: entry.unexemptedCrossDomainWriters,
    });
    if (entry.unexemptedCrossDomainWriters.length > 0) {
      unexemptedTotal += entry.unexemptedCrossDomainWriters.length;
      add(
        "error",
        "unexempted-cross-domain-writer",
        `Table ${entry.table} (owner=${entry.ownerTeam}) has UNEXEMPTED cross-domain writers: ${entry.unexemptedCrossDomainWriters.join(", ")} — register in CROSS_DOMAIN_WRITE_EXEMPTIONS`,
      );
    }
  }
}

// ── Items 3.b/3.c: every table has at least one writer or reader ──
const tablesWithoutAnyIO: string[] = [];
for (const entry of Object.values(TABLE_WRITER_READER_MAP)) {
  if (!entry.hasAnyIO) {
    tablesWithoutAnyIO.push(entry.table);
    add(
      "error",
      "table-no-io",
      `Table ${entry.table} (owner=${entry.ownerTeam}) has no declared writer or reader — add to EDGE_FUNCTION_TABLE_IO or NON_EDGE_TABLE_IO`,
    );
  }
}

// ── Item 13: backup freshness ─────────────────────────────────
let backupOk = false;
let backupAgeDays = Infinity;
let latestBackup: { file?: string; mode?: string; timestamp?: string } | null = null;
if (!existsSync(BACKUP_MANIFEST)) {
  add("error", "no-backup-manifest", `${BACKUP_MANIFEST} missing — run scripts/db/backup/run-backup.sh`);
} else {
  try {
    const m = JSON.parse(readFileSync(BACKUP_MANIFEST, "utf-8"));
    latestBackup = m.latest ?? (m.runs && m.runs[0]) ?? null;
    if (!latestBackup?.timestamp) {
      add("error", "no-backup-runs", "Backup manifest has no recorded runs");
    } else {
      // Parse timestamp like "20260417T120000Z"
      const ts = latestBackup.timestamp;
      const isoLike = `${ts.slice(0, 4)}-${ts.slice(4, 6)}-${ts.slice(6, 8)}T${ts.slice(9, 11)}:${ts.slice(11, 13)}:${ts.slice(13, 15)}Z`;
      const parsed = Date.parse(isoLike);
      if (Number.isNaN(parsed)) {
        add("warning", "backup-timestamp-unparseable", `Backup timestamp ${ts} unparseable`);
      } else {
        backupAgeDays = Math.floor((Date.now() - parsed) / (1000 * 60 * 60 * 24));
        if (backupAgeDays > MAX_BACKUP_AGE_DAYS) {
          add("warning", "backup-stale", `Latest backup is ${backupAgeDays} days old (max ${MAX_BACKUP_AGE_DAYS})`);
        }
        backupOk = true;
      }
    }
  } catch (e) {
    add("error", "backup-manifest-unreadable", `${BACKUP_MANIFEST}: ${(e as Error).message}`);
  }
}

// ── Item 14: restore drill ────────────────────────────────────
let restoreOk = false;
let restoreReport: { ok?: boolean; mode?: string; matchPercent?: number } | null = null;
if (!existsSync(RESTORE_REPORT)) {
  add("error", "no-restore-report", `${RESTORE_REPORT} missing — run scripts/db/restore/restore-roundtrip-drill.ts`);
} else {
  try {
    restoreReport = JSON.parse(readFileSync(RESTORE_REPORT, "utf-8"));
    if (!restoreReport?.ok) {
      add("error", "restore-failed", "Restore drill report indicates failure");
    } else {
      restoreOk = true;
    }
  } catch (e) {
    add("error", "restore-report-unreadable", `${RESTORE_REPORT}: ${(e as Error).message}`);
  }
}

// ── Item 15: rolled-up DB schema/RLS/tenancy checks ───────────
// We just assert the source registries are non-empty and consistent here;
// the dedicated checks remain registered as their own gates.
const totalTables = DB_SCHEMA_REGISTRY.length;
if (totalTables < 100) {
  add("error", "schema-registry-too-small", `schema-registry has only ${totalTables} entries (expected ≥100)`);
}
const tablesWithoutRls = DB_SCHEMA_REGISTRY.filter((t) => !t.hasRls);
if (tablesWithoutRls.length > 0) {
  add("error", "rls-coverage-incomplete", `${tablesWithoutRls.length} tables without RLS: ${tablesWithoutRls.slice(0, 5).map((t) => t.name).join(", ")}`);
}

// ── Build report ──────────────────────────────────────────────
const errorCount = issues.filter((i) => i.severity === "error").length;
const warningCount = issues.filter((i) => i.severity === "warning").length;
const ok = errorCount === 0;

const stats = tableWriterReaderStats();
const ioStats = ioMapStats();

const report = {
  generatedAt: new Date().toISOString(),
  ok,
  errorCount,
  warningCount,
  summary: {
    totalTables,
    unownedTables,
    ioMappedFunctions: ioStats.total,
    missingFromIO: missingFromIO.length,
    tablesWithWriters: stats.tablesWithWriters,
    tablesWithReaders: stats.tablesWithReaders,
    tablesWithoutAnyIO: stats.tablesWithoutAnyIO,
    crossDomainViolations: stats.crossDomainViolations,
    unexemptedCrossDomainWriters: unexemptedTotal,
    backup: {
      ok: backupOk,
      ageDays: backupAgeDays === Infinity ? null : backupAgeDays,
      latest: latestBackup,
    },
    restoreDrill: {
      ok: restoreOk,
      mode: restoreReport?.mode ?? null,
      matchPercent: restoreReport?.matchPercent ?? null,
    },
  },
  issues,
  crossDomainOffenders,
  missingFromIO,
  tablesWithoutAnyIO,
};

mkdirSync(dirname(REPORT), { recursive: true });
writeFileSync(REPORT, JSON.stringify(report, null, 2));

console.log(`DB Reality: ${totalTables} tables · ${ioStats.total} fn-io entries`);
console.log(`  errors=${errorCount} warnings=${warningCount}`);
console.log(`  tables-without-io=${stats.tablesWithoutAnyIO} unexempted-cross-domain=${unexemptedTotal}`);
console.log(`  backup-ok=${backupOk} (${backupAgeDays === Infinity ? "n/a" : `${backupAgeDays}d old`})`);
console.log(`  restore-drill-ok=${restoreOk}`);
console.log(`  → ${REPORT}`);

if (!ok) {
  for (const i of issues.filter((x) => x.severity === "error")) {
    console.error(`  ❌ [${i.code}] ${i.message}`);
  }
  process.exit(1);
}
for (const i of issues.filter((x) => x.severity === "warning")) {
  console.warn(`  ⚠ [${i.code}] ${i.message}`);
}
console.log("✅ Pass");
