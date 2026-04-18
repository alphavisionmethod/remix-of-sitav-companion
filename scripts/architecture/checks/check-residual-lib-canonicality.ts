#!/usr/bin/env node
/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Residual src/lib Canonicality Check (Wave 4 hardening)
// Asserts that no NEW files appear in src/lib outside the
// Option B allowlist. Pre-existing in-migration entries are
// tracked in a baseline file and counted as decomposition debt
// (allowed but expected to shrink). Anything not in the baseline
// AND not in the allowlist fails this gate.
// ═══════════════════════════════════════════════════════════════

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = "src/lib";
const OUT_DIR = "generated";
const BASELINE = "generated/lib-remediation/lib-canonicality-baseline.json";
mkdirSync(OUT_DIR, { recursive: true });
mkdirSync("generated/lib-remediation", { recursive: true });

const ALLOWED_TOP_LEVEL = new Set(["utils.ts", "utils", "internal", "hooks", "__tests__"]);

function listTop(): string[] {
  if (!existsSync(ROOT)) return [];
  return readdirSync(ROOT).filter((e) => {
    try { statSync(join(ROOT, e)); return true; } catch { return false; }
  });
}

const present = new Set(listTop());
const baseline: Set<string> = existsSync(BASELINE)
  ? new Set(JSON.parse(readFileSync(BASELINE, "utf8")).entries ?? [])
  : new Set(present); // first run seeds baseline

if (!existsSync(BASELINE)) {
  writeFileSync(BASELINE, JSON.stringify({
    generatedAt: new Date().toISOString(),
    note: "Pre-existing in-migration src/lib top-level entries. New additions outside allowlist fail CI.",
    entries: [...present].sort(),
  }, null, 2));
}

const violations: string[] = [];
for (const entry of present) {
  if (ALLOWED_TOP_LEVEL.has(entry)) continue;
  if (baseline.has(entry)) continue;
  violations.push(entry);
}

const report = {
  generatedAt: new Date().toISOString(),
  gate: "residual-lib-canonicality",
  allowedTopLevel: [...ALLOWED_TOP_LEVEL],
  baselineCount: baseline.size,
  presentCount: present.size,
  violations,
  ok: violations.length === 0,
  errorCount: violations.length,
};

writeFileSync(join(OUT_DIR, "residual-lib-canonicality-report.json"), JSON.stringify(report, null, 2));
console.log(`residual-lib-canonicality: ${violations.length} new unauthorized entrie(s) in src/lib`);
if (violations.length > 0) {
  for (const v of violations) console.log(`  ❌ src/lib/${v} — not in allowlist or baseline`);
  process.exit(1);
}
process.exit(0);
