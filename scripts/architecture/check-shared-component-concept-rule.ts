#!/usr/bin/env tsx
/**
 * ════════════════════════════════════════════════════════════════════════
 * SITA OS — Shared Component Concept-Rule Validator (Wave 0.9, BLOCKING)
 * ════════════════════════════════════════════════════════════════════════
 *
 * Constitution Rules 36, 37, 38.
 *
 * Enforces the 3-test concept rule from
 *   docs/architecture/SHARED_COMPONENT_OWNERSHIP_MODEL.md
 *
 * Sources of truth:
 *   - generated/manifests/shared-component-ownership-map.json    (live state)
 *   - generated/manifests/shared-component-semantic-violation-baseline.json (sealed)
 *
 * Pass/fail rules:
 *   1. Live violator count MUST be ≤ baseline count (monotone ratchet).
 *   2. Every NEW file appearing under src/components/** MUST be classified
 *      `shared-clean` or `deprecated-shim`. A net-new file in any violator
 *      bucket BLOCKS CI.
 *   3. Any baselined file whose `classification` REGRESSES to a more severe
 *      bucket BLOCKS CI.
 *
 * Modes:
 *   --strict (default in CI): non-zero exit on any violation.
 *   --warn: report but always exit 0 (used during in-flight relocation waves).
 *
 * Run: npx tsx scripts/architecture/check-shared-component-concept-rule.ts
 * ════════════════════════════════════════════════════════════════════════
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const STRICT = !process.argv.includes("--warn");
const MAP_PATH = join(ROOT, "generated", "manifests", "shared-component-ownership-map.json");
const BASELINE_PATH = join(ROOT, "generated", "manifests", "shared-component-semantic-violation-baseline.json");
const REPORT_PATH = join(ROOT, "generated", "shared-component-concept-rule-report.json");

interface ViolatorRow {
  file: string;
  classification: string;
  targetOwner: string | null;
  reason: string;
}

function load<T>(path: string, label: string): T {
  if (!existsSync(path)) {
    console.error(`[shared-component-concept-rule] ${label} missing: ${path}`);
    console.error(`  Re-run: npx tsx scripts/manifests/generate/generate-shared-component-ownership-map.ts`);
    process.exit(1);
  }
  return JSON.parse(readFileSync(path, "utf-8")) as T;
}

const map = load<{ totals: { filesScanned: number; sharedClean: number; deprecatedShim: number; violators: number }, violators: ViolatorRow[]; files: ViolatorRow[] }>(MAP_PATH, "ownership map");
const baseline = load<{ baselineCount: number; violators: ViolatorRow[] }>(BASELINE_PATH, "violation baseline");

const liveByFile = new Map(map.violators.map((v) => [v.file, v]));
const baselineByFile = new Map(baseline.violators.map((v) => [v.file, v]));

const SEVERITY: Record<string, number> = {
  "shared-clean": 0,
  "deprecated-shim": 1,
  "barrel-only-reexport": 2,
  "wrapper-with-platform-import": 3,
  "shell-runtime-semantic": 4,
  "platform-semantic": 5,
  "pillar-semantic": 5,
  "admin-semantic": 5,
};

const errors: string[] = [];

// Rule A — monotone ratchet on count.
if (map.violators.length > baseline.baselineCount) {
  errors.push(
    `RATCHET BREACH: live violator count ${map.violators.length} exceeds sealed baseline ${baseline.baselineCount}.`
  );
}

// Rule B — net-new violators must not appear.
const newViolators: ViolatorRow[] = [];
for (const [file, row] of liveByFile.entries()) {
  if (!baselineByFile.has(file)) newViolators.push(row);
}
if (newViolators.length > 0) {
  for (const v of newViolators) {
    errors.push(
      `NEW VIOLATOR: ${v.file} (${v.classification}) — must be classified shared-clean. Move to: ${v.targetOwner}.`
    );
  }
}

// Rule C — no severity regressions on baselined files.
const regressions: Array<{ file: string; from: string; to: string }> = [];
for (const [file, baselineRow] of baselineByFile.entries()) {
  const live = liveByFile.get(file);
  if (!live) continue; // file relocated → ratchet decrease, allowed.
  if ((SEVERITY[live.classification] ?? 0) > (SEVERITY[baselineRow.classification] ?? 0)) {
    regressions.push({ file, from: baselineRow.classification, to: live.classification });
    errors.push(
      `SEVERITY REGRESSION: ${file} moved ${baselineRow.classification} → ${live.classification}. Concept-rule severity may not increase.`
    );
  }
}

// Compute drained files (good news — ratchet decrease).
const drained: string[] = [];
for (const file of baselineByFile.keys()) {
  if (!liveByFile.has(file)) drained.push(file);
}

const ok = errors.length === 0;
const report = {
  generatedAt: new Date().toISOString(),
  gate: "shared-component-concept-rule",
  classification: "block" as const,
  rule: "Constitution Rules 36, 37, 38",
  model: "docs/architecture/SHARED_COMPONENT_OWNERSHIP_MODEL.md",
  baselineCount: baseline.baselineCount,
  liveCount: map.violators.length,
  ratchetDelta: baseline.baselineCount - map.violators.length,
  newViolators: newViolators.map((v) => v.file),
  regressions,
  drained,
  errors,
  ok,
};
mkdirSync(join(ROOT, "generated"), { recursive: true });
writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

console.log("════════════════════════════════════════════════════════════");
console.log("Wave 0.9 — Shared Component Concept-Rule Check");
console.log("════════════════════════════════════════════════════════════");
console.log(`  baseline count : ${baseline.baselineCount}`);
console.log(`  live count     : ${map.violators.length}`);
console.log(`  ratchet delta  : ${report.ratchetDelta} (≥0 required)`);
console.log(`  new violators  : ${newViolators.length}`);
console.log(`  regressions    : ${regressions.length}`);
console.log(`  drained        : ${drained.length}`);

if (!ok) {
  console.log("\n❌ Errors:");
  for (const e of errors) console.log(`  • ${e}`);
  if (STRICT) process.exit(1);
  console.log("\n(--warn mode: not failing build)");
  process.exit(0);
}
console.log("\n✅ shared-component-concept-rule: GREEN");
process.exit(0);