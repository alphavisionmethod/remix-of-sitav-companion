#!/usr/bin/env node
/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Misplaced Runtime Logic Check
// Flags runtime/substrate concerns living outside src/runtimes.
// Heuristic: imports of runtime-only APIs from src/domains or
// src/data should not exist; runtime-flavored identifiers
// (window detection, electron bridge, capability-matrix) inside
// domain/data files indicate misplacement.
// Soft-fail (warning) during the active src/lib decomposition.
// ═══════════════════════════════════════════════════════════════

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const OUT_DIR = "generated";
mkdirSync(OUT_DIR, { recursive: true });

const SCAN_ROOTS = ["src/domains", "src/data"];
const RUNTIME_HINTS = [
  /from ["']@\/runtimes\//,
  /from ["']@\/lib\/runtime\//,
  /from ["']@\/lib\/devices\//,
  /from ["']@\/lib\/surfaces\//,
  /electronBridge|isElectron|window\.electronAPI/,
  /capabilityMatrix|runtimeDetection/,
];

interface Hit { file: string; pattern: string; }
const hits: Hit[] = [];

function walk(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const e of readdirSync(dir)) {
    const full = join(dir, e);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.(ts|tsx)$/.test(e)) out.push(full);
  }
  return out;
}

for (const root of SCAN_ROOTS) {
  for (const file of walk(root)) {
    const content = readFileSync(file, "utf8");
    for (const pat of RUNTIME_HINTS) {
      if (pat.test(content)) hits.push({ file: relative(".", file), pattern: pat.toString() });
    }
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  gate: "misplaced-runtime-logic",
  scanRoots: SCAN_ROOTS,
  hits: hits.slice(0, 200),
  hitCount: hits.length,
  ok: true,                        // soft-fail during migration
  errorCount: 0,
  warningCount: hits.length,
};

writeFileSync(join(OUT_DIR, "misplaced-runtime-logic-report.json"), JSON.stringify(report, null, 2));
console.log(`misplaced-runtime-logic: ${hits.length} candidate(s) [warning-level]`);
process.exit(0);
