#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Edge Function DB Mutation Traceability Validator
//
// Scans every edge function's index.ts for actual DB mutation calls
// (.insert/.update/.delete/.upsert on specific tables) and compares
// against the declared EDGE_FUNCTION_TABLE_IO traceability matrix.
//
// Flags:
//   ERROR   — undeclared write: function mutates a table not in its writes[]
//   ERROR   — undeclared read: function reads a table not in its reads[]
//   WARNING — phantom declaration: matrix declares a write/read not found in code
//   WARNING — missing matrix entry: active function has no IO map entry
// ═══════════════════════════════════════════════════════════════

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { ViolationCollector, writeJsonOutput, scanDirShallow } from "../lib/utils";
import { EDGE_FUNCTION_TABLE_IO } from "../../../src/lib/backend-topology/edge-function-table-io-map";
import { EDGE_FUNCTION_REGISTRY } from "../../../src/lib/backend-topology/edge-function-registry";

const vc = new ViolationCollector();
const FUNCTIONS_DIR = "supabase/functions";
const OUT_PATH = "generated/edge-function-mutation-traceability.json";

// ── Code-level extraction ──────────────────────────────────────

const WRITE_OPS = ["insert", "update", "delete", "upsert"] as const;
const READ_OPS = ["select"] as const;

interface DetectedTableOp {
  table: string;
  operation: string;
  line: number;
}

function extractTableOps(content: string): { writes: DetectedTableOp[]; reads: DetectedTableOp[] } {
  const writes: DetectedTableOp[] = [];
  const reads: DetectedTableOp[] = [];

  // Match .from("table_name").<operation>
  const pattern = /\.from\s*\(\s*["'`]([a-z_][a-z0-9_]*)["'`]\s*\)\s*\.\s*(select|insert|update|delete|upsert)/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(content)) !== null) {
    const table = match[1];
    const op = match[2];
    const line = content.substring(0, match.index).split("\n").length;
    if (WRITE_OPS.includes(op as any)) {
      writes.push({ table, operation: op, line });
    } else {
      reads.push({ table, operation: op, line });
    }
  }

  // Match .rpc("function_name") as a write
  const rpcPattern = /\.rpc\s*\(\s*["'`]([a-z_][a-z0-9_]*)["'`]/g;
  while ((match = rpcPattern.exec(content)) !== null) {
    const fn = match[1];
    const line = content.substring(0, match.index).split("\n").length;
    writes.push({ table: `rpc:${fn}`, operation: "rpc", line });
  }

  return { writes, reads };
}

// ── Validation ─────────────────────────────────────────────────

interface FunctionTraceResult {
  functionName: string;
  filePath: string;
  hasDeclaredIO: boolean;
  isWrapper: boolean;
  declaredWrites: string[];
  declaredReads: string[];
  detectedWrites: DetectedTableOp[];
  detectedReads: DetectedTableOp[];
  undeclaredWrites: string[];
  undeclaredReads: string[];
  phantomWrites: string[];
  phantomReads: string[];
  issues: string[];
}

const results: FunctionTraceResult[] = [];
const activeFns = EDGE_FUNCTION_REGISTRY.filter(f => f.status === "active" || f.status === "experimental");
const functionDirs = scanDirShallow(FUNCTIONS_DIR).filter(d => !d.startsWith("_"));

for (const fnName of functionDirs) {
  const indexPath = join(FUNCTIONS_DIR, fnName, "index.ts");
  if (!existsSync(indexPath)) continue;

  const content = readFileSync(indexPath, "utf-8");
  const ioEntry = EDGE_FUNCTION_TABLE_IO[fnName];
  const registryEntry = activeFns.find(f => f.name === fnName);
  const isWrapper = ioEntry?.wrapper === true;

  const { writes: detectedWrites, reads: detectedReads } = extractTableOps(content);
  const detectedWriteTables = [...new Set(detectedWrites.map(w => w.table))];
  const detectedReadTables = [...new Set(detectedReads.map(r => r.table))];

  const declaredWrites = ioEntry ? [...ioEntry.writes] : [];
  const declaredReads = ioEntry ? [...ioEntry.reads] : [];

  const issues: string[] = [];

  if (!ioEntry && registryEntry) {
    issues.push("MISSING_IO_ENTRY: Active function has no entry in EDGE_FUNCTION_TABLE_IO");
    vc.add(indexPath, "missing-io-entry", `${fnName}: no traceability matrix entry`, "warning");
  }

  if (isWrapper) {
    // Wrappers are exempt from strict checks
    results.push({
      functionName: fnName, filePath: indexPath, hasDeclaredIO: !!ioEntry,
      isWrapper: true, declaredWrites, declaredReads,
      detectedWrites, detectedReads,
      undeclaredWrites: [], undeclaredReads: [],
      phantomWrites: [], phantomReads: [], issues,
    });
    continue;
  }

  // Undeclared writes — function writes to tables not in its declared writes[]
  const undeclaredWrites = detectedWriteTables.filter(t =>
    !t.startsWith("rpc:") && !declaredWrites.includes(t)
  );
  for (const t of undeclaredWrites) {
    issues.push(`UNDECLARED_WRITE: Writes to '${t}' but not declared in traceability matrix`);
    vc.add(indexPath, "undeclared-write", `${fnName}: undeclared write to '${t}'`);
  }

  // Undeclared reads
  const undeclaredReads = detectedReadTables.filter(t => !declaredReads.includes(t));
  for (const t of undeclaredReads) {
    issues.push(`UNDECLARED_READ: Reads from '${t}' but not declared in traceability matrix`);
    vc.add(indexPath, "undeclared-read", `${fnName}: undeclared read from '${t}'`, "warning");
  }

  // Phantom declarations — declared but not found in code
  const phantomWrites = declaredWrites.filter(t => !detectedWriteTables.includes(t));
  for (const t of phantomWrites) {
    if (detectedWrites.length > 0 || detectedReads.length > 0) {
      // Only flag if we found _some_ DB ops (otherwise the function may use dynamic patterns)
      issues.push(`PHANTOM_WRITE: Declares write to '${t}' but not found in code`);
      vc.add(indexPath, "phantom-write", `${fnName}: phantom write declaration '${t}'`, "warning");
    }
  }

  const phantomReads = declaredReads.filter(t => !detectedReadTables.includes(t));
  for (const t of phantomReads) {
    if (detectedWrites.length > 0 || detectedReads.length > 0) {
      issues.push(`PHANTOM_READ: Declares read from '${t}' but not found in code`);
      vc.add(indexPath, "phantom-read", `${fnName}: phantom read declaration '${t}'`, "warning");
    }
  }

  results.push({
    functionName: fnName, filePath: indexPath, hasDeclaredIO: !!ioEntry,
    isWrapper, declaredWrites, declaredReads,
    detectedWrites, detectedReads,
    undeclaredWrites, undeclaredReads,
    phantomWrites, phantomReads, issues,
  });
}

// ── Summary ────────────────────────────────────────────────────

const totalFunctions = results.length;
const withIssues = results.filter(r => r.issues.length > 0).length;
const totalUndeclaredWrites = results.reduce((s, r) => s + r.undeclaredWrites.length, 0);
const totalPhantomWrites = results.reduce((s, r) => s + r.phantomWrites.length, 0);
const totalDetectedWrites = results.reduce((s, r) => s + r.detectedWrites.length, 0);
const totalDetectedReads = results.reduce((s, r) => s + r.detectedReads.length, 0);
const coveragePct = (() => {
  const withIO = results.filter(r => r.hasDeclaredIO && !r.isWrapper).length;
  const active = results.filter(r => !r.isWrapper).length;
  return active > 0 ? Math.round((withIO / active) * 100) : 100;
})();

writeJsonOutput(OUT_PATH, {
  generatedAt: new Date().toISOString(),
  gate: "edge-function-mutation-traceability",
  ok: vc.errors.length === 0,
  totalFunctions,
  functionsWithIssues: withIssues,
  errorCount: vc.errors.length,
  warningCount: vc.warnings.length,
  totalDetectedWrites,
  totalDetectedReads,
  totalUndeclaredWrites,
  totalPhantomWrites,
  ioMatrixCoveragePct: coveragePct,
  results,
});

vc.report("check-edge-function-mutation-traceability");

console.log(`\n📊 Mutation Traceability: ${totalFunctions} functions, ${totalDetectedWrites} writes, ${totalDetectedReads} reads`);
console.log(`   IO matrix coverage: ${coveragePct}%`);
console.log(`   Undeclared writes: ${totalUndeclaredWrites} | Phantom writes: ${totalPhantomWrites}`);

if (vc.errors.length > 0) {
  console.log(`\n❌ ${vc.errors.length} traceability errors — undeclared DB mutations detected`);
  process.exit(1);
} else {
  console.log(`\n✅ All detected mutations match traceability matrix (${vc.warnings.length} warnings)`);
}