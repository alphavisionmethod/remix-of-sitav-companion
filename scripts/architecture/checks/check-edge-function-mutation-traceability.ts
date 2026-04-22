#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Edge Function DB Mutation Traceability Validator v2
//
// Scans every edge function's index.ts for actual DB mutation calls
// (.insert/.update/.delete/.upsert on specific tables) and compares
// against the declared EDGE_FUNCTION_TABLE_IO traceability matrix.
//
// v2 additions:
//   - Allowlist/ignore mechanism for known false-positives
//   - Indirect mutation detection via shared helper imports
//   - Configurable undeclared-write threshold for CI gating
//   - Stale allowlist entry detection (>180 days)
//   - Full allowlist surfaced in generated report
//
// Flags:
//   ERROR   — undeclared write (not allowlisted, threshold exceeded)
//   WARNING — undeclared read
//   WARNING — phantom declaration
//   WARNING — stale allowlist entry (>180 days old)
//   INFO    — allowlisted suppression applied
// ═══════════════════════════════════════════════════════════════

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { ViolationCollector, writeJsonOutput, scanDirShallow } from "../lib/utils";
import {
  EDGE_FUNCTION_TABLE_IO,
  MUTATION_TRACEABILITY_ALLOWLIST,
  SHARED_HELPER_TABLE_IO,
  type TraceabilityAllowlistEntry,
} from "../../../src/lib/backend-topology/edge-function-table-io-map";
import { EDGE_FUNCTION_REGISTRY } from "../../../src/lib/backend-topology/edge-function-registry";

const vc = new ViolationCollector();
const FUNCTIONS_DIR = "supabase/functions";
const SHARED_DIR = join(FUNCTIONS_DIR, "_shared");
const OUT_PATH = "generated/edge-function-mutation-traceability.json";

// ── CI threshold ───────────────────────────────────────────────
// Fail the build when total undeclared writes (after allowlist)
// exceed this number. Override with env MUTATION_UNDECLARED_THRESHOLD.
const UNDECLARED_WRITE_THRESHOLD = parseInt(
  process.env.MUTATION_UNDECLARED_THRESHOLD ?? "0",
  10,
);
const STALE_ALLOWLIST_DAYS = 180;

// ── Code-level extraction ──────────────────────────────────────

const WRITE_OPS = ["insert", "update", "delete", "upsert"] as const;

interface DetectedTableOp {
  table: string;
  operation: string;
  line: number;
  source: "direct" | "indirect";
  helperFile?: string;
}

function extractTableOps(content: string): { writes: DetectedTableOp[]; reads: DetectedTableOp[] } {
  const writes: DetectedTableOp[] = [];
  const reads: DetectedTableOp[] = [];

  const pattern = /\.from\s*\(\s*["'`]([a-z_][a-z0-9_]*)["'`]\s*\)\s*\.\s*(select|insert|update|delete|upsert)/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(content)) !== null) {
    const table = match[1];
    const op = match[2];
    const line = content.substring(0, match.index).split("\n").length;
    if (WRITE_OPS.includes(op as any)) {
      writes.push({ table, operation: op, line, source: "direct" });
    } else {
      reads.push({ table, operation: op, line, source: "direct" });
    }
  }

  const rpcPattern = /\.rpc\s*\(\s*["'`]([a-z_][a-z0-9_]*)["'`]/g;
  while ((match = rpcPattern.exec(content)) !== null) {
    const fn = match[1];
    const line = content.substring(0, match.index).split("\n").length;
    writes.push({ table: `rpc:${fn}`, operation: "rpc", line, source: "direct" });
  }

  return { writes, reads };
}

// ── Indirect mutation detection via _shared helper imports ─────

function resolveIndirectOps(content: string): { writes: DetectedTableOp[]; reads: DetectedTableOp[] } {
  const writes: DetectedTableOp[] = [];
  const reads: DetectedTableOp[] = [];

  // Detect imports from ../_shared/<helper>
  const importPattern = /import\s+.*?\s+from\s+["']\.\.?\/_shared\/([^"']+?)(?:\.ts)?["']/g;
  let match: RegExpExecArray | null;
  while ((match = importPattern.exec(content)) !== null) {
    const helperName = match[1] + ".ts";
    const helperContract = SHARED_HELPER_TABLE_IO.find(
      (h) => h.helperFile === helperName,
    );
    if (!helperContract) continue;

    const line = content.substring(0, match.index).split("\n").length;
    for (const table of helperContract.writes) {
      writes.push({ table, operation: "indirect-write", line, source: "indirect", helperFile: helperName });
    }
    for (const table of helperContract.reads) {
      reads.push({ table, operation: "indirect-read", line, source: "indirect", helperFile: helperName });
    }
  }

  return { writes, reads };
}

// ── Allowlist lookup ───────────────────────────────────────────

interface AllowlistMatch {
  entry: TraceabilityAllowlistEntry;
  stale: boolean;
  expired: boolean;
}

function findAllowlistMatch(
  fnName: string,
  target: string,
  kind: TraceabilityAllowlistEntry["suppressionKind"],
): AllowlistMatch | null {
  const now = Date.now();
  for (const entry of MUTATION_TRACEABILITY_ALLOWLIST) {
    if (entry.suppressionKind !== kind) continue;
    if (entry.functionName !== "*" && entry.functionName !== fnName) continue;
    if (entry.target !== target) continue;

    const addedMs = new Date(entry.addedAt).getTime();
    const stale = (now - addedMs) > STALE_ALLOWLIST_DAYS * 86_400_000;
    const expired = entry.expiresAt ? now > new Date(entry.expiresAt).getTime() : false;
    return { entry, stale, expired };
  }
  return null;
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
  indirectWrites: DetectedTableOp[];
  indirectReads: DetectedTableOp[];
  undeclaredWrites: string[];
  undeclaredReads: string[];
  allowlistedWrites: string[];
  allowlistedReads: string[];
  phantomWrites: string[];
  phantomReads: string[];
  issues: string[];
}

const results: FunctionTraceResult[] = [];
const activeFns = EDGE_FUNCTION_REGISTRY.filter(f => f.status === "active" || f.status === "experimental");
const functionDirs = scanDirShallow(FUNCTIONS_DIR).filter(d => !d.startsWith("_"));
const allowlistApplied: Array<{ functionName: string; target: string; kind: string; reason: string }> = [];

for (const fnName of functionDirs) {
  const indexPath = join(FUNCTIONS_DIR, fnName, "index.ts");
  if (!existsSync(indexPath)) continue;

  const content = readFileSync(indexPath, "utf-8");
  const ioEntry = EDGE_FUNCTION_TABLE_IO[fnName];
  const registryEntry = activeFns.find(f => f.name === fnName);
  const isWrapper = ioEntry?.wrapper === true;

  // Direct detection
  const { writes: directWrites, reads: directReads } = extractTableOps(content);

  // Indirect detection via shared helpers
  const { writes: indirectWrites, reads: indirectReads } = resolveIndirectOps(content);

  // Merge all detected ops
  const allWrites = [...directWrites, ...indirectWrites];
  const allReads = [...directReads, ...indirectReads];
  const detectedWriteTables = [...new Set(allWrites.map(w => w.table))];
  const detectedReadTables = [...new Set(allReads.map(r => r.table))];

  const declaredWrites = ioEntry ? [...ioEntry.writes] : [];
  const declaredReads = ioEntry ? [...ioEntry.reads] : [];

  const issues: string[] = [];
  const fnAllowlistedWrites: string[] = [];
  const fnAllowlistedReads: string[] = [];

  if (!ioEntry && registryEntry) {
    issues.push("MISSING_IO_ENTRY: Active function has no entry in EDGE_FUNCTION_TABLE_IO");
    vc.add(indexPath, "missing-io-entry", `${fnName}: no traceability matrix entry`, "warning");
  }

  if (isWrapper) {
    results.push({
      functionName: fnName, filePath: indexPath, hasDeclaredIO: !!ioEntry,
      isWrapper: true, declaredWrites, declaredReads,
      detectedWrites: directWrites, detectedReads: directReads,
      indirectWrites, indirectReads,
      undeclaredWrites: [], undeclaredReads: [],
      allowlistedWrites: [], allowlistedReads: [],
      phantomWrites: [], phantomReads: [], issues,
    });
    continue;
  }

  // Undeclared writes — check allowlist before flagging
  const rawUndeclaredWrites = detectedWriteTables.filter(t =>
    !t.startsWith("rpc:") && !declaredWrites.includes(t),
  );
  const undeclaredWrites: string[] = [];
  for (const t of rawUndeclaredWrites) {
    const alMatch = findAllowlistMatch(fnName, t, "undeclared-write");
    if (alMatch && !alMatch.expired) {
      fnAllowlistedWrites.push(t);
      allowlistApplied.push({ functionName: fnName, target: t, kind: "undeclared-write", reason: alMatch.entry.reason });
      if (alMatch.stale) {
        vc.add(indexPath, "stale-allowlist", `${fnName}: allowlist entry for '${t}' is >180 days old`, "warning");
      }
    } else {
      undeclaredWrites.push(t);
      issues.push(`UNDECLARED_WRITE: Writes to '${t}' but not declared in traceability matrix`);
      vc.add(indexPath, "undeclared-write", `${fnName}: undeclared write to '${t}'`);
    }
  }

  // Undeclared reads — check allowlist
  const rawUndeclaredReads = detectedReadTables.filter(t => !declaredReads.includes(t));
  const undeclaredReads: string[] = [];
  for (const t of rawUndeclaredReads) {
    const alMatch = findAllowlistMatch(fnName, t, "undeclared-read");
    if (alMatch && !alMatch.expired) {
      fnAllowlistedReads.push(t);
      allowlistApplied.push({ functionName: fnName, target: t, kind: "undeclared-read", reason: alMatch.entry.reason });
    } else {
      undeclaredReads.push(t);
      issues.push(`UNDECLARED_READ: Reads from '${t}' but not declared in traceability matrix`);
      vc.add(indexPath, "undeclared-read", `${fnName}: undeclared read from '${t}'`, "warning");
    }
  }

  // Phantom declarations — declared but not found in code (direct or indirect)
  const phantomWrites = declaredWrites.filter(t => !detectedWriteTables.includes(t));
  for (const t of phantomWrites) {
    if (allWrites.length > 0 || allReads.length > 0) {
      const alMatch = findAllowlistMatch(fnName, t, "phantom-write");
      if (alMatch && !alMatch.expired) continue;
      issues.push(`PHANTOM_WRITE: Declares write to '${t}' but not found in code`);
      vc.add(indexPath, "phantom-write", `${fnName}: phantom write declaration '${t}'`, "warning");
    }
  }

  const phantomReads = declaredReads.filter(t => !detectedReadTables.includes(t));
  for (const t of phantomReads) {
    if (allWrites.length > 0 || allReads.length > 0) {
      const alMatch = findAllowlistMatch(fnName, t, "phantom-read");
      if (alMatch && !alMatch.expired) continue;
      issues.push(`PHANTOM_READ: Declares read from '${t}' but not found in code`);
      vc.add(indexPath, "phantom-read", `${fnName}: phantom read declaration '${t}'`, "warning");
    }
  }

  results.push({
    functionName: fnName, filePath: indexPath, hasDeclaredIO: !!ioEntry,
    isWrapper, declaredWrites, declaredReads,
    detectedWrites: directWrites, detectedReads: directReads,
    indirectWrites, indirectReads,
    undeclaredWrites, undeclaredReads,
    allowlistedWrites: fnAllowlistedWrites, allowlistedReads: fnAllowlistedReads,
    phantomWrites, phantomReads, issues,
  });
}

// ── Summary ────────────────────────────────────────────────────

const totalFunctions = results.length;
const withIssues = results.filter(r => r.issues.length > 0).length;
const totalUndeclaredWrites = results.reduce((s, r) => s + r.undeclaredWrites.length, 0);
const totalAllowlistedWrites = results.reduce((s, r) => s + r.allowlistedWrites.length, 0);
const totalPhantomWrites = results.reduce((s, r) => s + r.phantomWrites.length, 0);
const totalDetectedWrites = results.reduce((s, r) => s + r.detectedWrites.length, 0);
const totalIndirectWrites = results.reduce((s, r) => s + r.indirectWrites.length, 0);
const totalDetectedReads = results.reduce((s, r) => s + r.detectedReads.length, 0);
const totalIndirectReads = results.reduce((s, r) => s + r.indirectReads.length, 0);
const coveragePct = (() => {
  const withIO = results.filter(r => r.hasDeclaredIO && !r.isWrapper).length;
  const active = results.filter(r => !r.isWrapper).length;
  return active > 0 ? Math.round((withIO / active) * 100) : 100;
})();

// CI gate: fail if undeclared writes exceed threshold
const thresholdExceeded = totalUndeclaredWrites > UNDECLARED_WRITE_THRESHOLD;
const gateOk = vc.errors.length === 0 && !thresholdExceeded;

writeJsonOutput(OUT_PATH, {
  generatedAt: new Date().toISOString(),
  gate: "edge-function-mutation-traceability",
  ok: gateOk,
  undeclaredWriteThreshold: UNDECLARED_WRITE_THRESHOLD,
  thresholdExceeded,
  totalFunctions,
  functionsWithIssues: withIssues,
  errorCount: vc.errors.length,
  warningCount: vc.warnings.length,
  totalDetectedWrites,
  totalIndirectWrites,
  totalDetectedReads,
  totalIndirectReads,
  totalUndeclaredWrites,
  totalAllowlistedWrites,
  totalPhantomWrites,
  ioMatrixCoveragePct: coveragePct,
  allowlist: {
    totalEntries: MUTATION_TRACEABILITY_ALLOWLIST.length,
    appliedThisRun: allowlistApplied,
    entries: MUTATION_TRACEABILITY_ALLOWLIST,
  },
  sharedHelperContracts: SHARED_HELPER_TABLE_IO,
  results,
});

vc.report("check-edge-function-mutation-traceability");

console.log(`\n📊 Mutation Traceability v2: ${totalFunctions} functions`);
console.log(`   Direct writes: ${totalDetectedWrites} | Indirect writes: ${totalIndirectWrites}`);
console.log(`   Direct reads:  ${totalDetectedReads} | Indirect reads:  ${totalIndirectReads}`);
console.log(`   IO matrix coverage: ${coveragePct}%`);
console.log(`   Undeclared writes: ${totalUndeclaredWrites} (threshold: ${UNDECLARED_WRITE_THRESHOLD})`);
console.log(`   Allowlisted writes: ${totalAllowlistedWrites}`);
console.log(`   Phantom writes: ${totalPhantomWrites}`);

if (allowlistApplied.length > 0) {
  console.log(`\n📋 Allowlist suppressions applied (${allowlistApplied.length}):`);
  for (const a of allowlistApplied) {
    console.log(`   ✓ ${a.functionName} → ${a.target} (${a.kind}): ${a.reason}`);
  }
}

if (!gateOk) {
  console.log(`\n❌ ${vc.errors.length} traceability errors — ${totalUndeclaredWrites} undeclared writes (threshold ${UNDECLARED_WRITE_THRESHOLD})`);
  process.exit(1);
} else {
  console.log(`\n✅ All detected mutations match traceability matrix (${vc.warnings.length} warnings)`);
}