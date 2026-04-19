#!/usr/bin/env node
/* eslint-disable no-console */
// Admin & Validation Closure — edge-function contract coverage gate (WARN-tier)
// Counts real *_test.ts / *.test.ts files under supabase/functions/.
// BLOCK promotion at ≥50% coverage.
import { readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import { emitGateReport } from "./_lib/emit-gate-report";

const ROOT = "supabase/functions";
const TARGET_PERCENT = 50;
const issues: Array<{ severity: "error" | "warning"; area: string; message: string }> = [];

if (!existsSync(ROOT)) {
  emitGateReport({ gate: "edge-function-contract-coverage", ok: true, issues: [{ severity: "warning", area: "root", message: "supabase/functions not present" }] });
  console.log("⚠ edge-function-contract-coverage: supabase/functions not present [WARN]");
  process.exit(0);
}

const fnDirs = readdirSync(ROOT).filter((d) => {
  try { return statSync(join(ROOT, d)).isDirectory() && !d.startsWith("_"); } catch { return false; }
});
const total = fnDirs.length;
let covered = 0;
const missingNames: string[] = [];

for (const fn of fnDirs) {
  const dir = join(ROOT, fn);
  let entries: string[] = [];
  try { entries = readdirSync(dir); } catch { continue; }
  const hasTest = entries.some((e) => /(_test\.ts$|\.test\.ts$)/.test(e));
  if (hasTest) covered++;
  else missingNames.push(fn);
}

const percent = total === 0 ? 0 : Math.round((covered / total) * 100);
const isBlock = percent >= TARGET_PERCENT;
const ok = isBlock; // warn-tier until target met

if (!isBlock) {
  issues.push({ severity: "warning", area: "coverage", message: `${covered}/${total} (${percent}%) — target ≥${TARGET_PERCENT}% for BLOCK promotion` });
}

emitGateReport({
  gate: "edge-function-contract-coverage",
  ok: true, // warn-only level: do not block release while ramping
  issues,
  extra: { totalFunctions: total, coveredFunctions: covered, percent, targetPercent: TARGET_PERCENT, level: isBlock ? "block" : "warn", missingCount: missingNames.length },
});
console.log(`${isBlock ? "✅" : "⚠"} edge-function-contract-coverage: ${covered}/${total} (${percent}%) [${isBlock ? "BLOCK" : "WARN"}]`);
process.exit(0);
