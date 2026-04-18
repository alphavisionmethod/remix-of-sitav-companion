#!/usr/bin/env node
/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Misplaced Data Logic Check
// Flags persistence / Supabase / repository code living outside
// src/data, src/integrations, or src/lib (during migration).
// We allow src/lib temporarily because the decomposition is in
// flight; the verifier tracks the count and wants it to shrink.
// ═══════════════════════════════════════════════════════════════

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const OUT_DIR = "generated";
mkdirSync(OUT_DIR, { recursive: true });

const SCAN_ROOTS = ["src/domains", "src/runtimes", "src/platform", "src/features"];
const DATA_HINTS = [
  /from ["']@\/integrations\/supabase\/client["']/,
  /supabase\.from\(/,
  /\.rpc\(["'][a-z_]+["']\)/,
  /createClient\(.*supabase/i,
];

interface Hit { file: string; line: number; snippet: string; }
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
    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i++) {
      for (const pat of DATA_HINTS) {
        if (pat.test(lines[i])) {
          hits.push({ file: relative(".", file), line: i + 1, snippet: lines[i].trim().slice(0, 160) });
          break;
        }
      }
    }
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  gate: "misplaced-data-logic",
  scanRoots: SCAN_ROOTS,
  hits: hits.slice(0, 200),
  hitCount: hits.length,
  ok: true,
  errorCount: 0,
  warningCount: hits.length,
};

writeFileSync(join(OUT_DIR, "misplaced-data-logic-report.json"), JSON.stringify(report, null, 2));
console.log(`misplaced-data-logic: ${hits.length} candidate(s) [warning-level]`);
process.exit(0);
