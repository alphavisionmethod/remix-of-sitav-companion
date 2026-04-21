#!/usr/bin/env node
/* eslint-disable no-console */
// Wave 16 — ADVISORY: Contract Test Coverage
import { writeFileSync, mkdirSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import { EDGE_FUNCTION_REGISTRY } from "../../../src/lib/backend-topology/edge-function-registry";

const OUT = "generated";
mkdirSync(OUT, { recursive: true });
const FN_DIR = "supabase/functions";

// Scan on-disk test files
const onDiskTests = new Set<string>();
if (existsSync(FN_DIR)) {
  for (const d of readdirSync(FN_DIR)) {
    if (d.startsWith("_")) continue;
    try {
      if (!statSync(join(FN_DIR, d)).isDirectory()) continue;
      const files = readdirSync(join(FN_DIR, d));
      if (files.some(f => /_test\.ts$|\.test\.ts$/.test(f))) onDiskTests.add(d);
    } catch { /* skip */ }
  }
}

const activeFns = EDGE_FUNCTION_REGISTRY.filter(f => f.status === "active");
const total = activeFns.length;
const tested = activeFns.filter(f => onDiskTests.has(f.name)).length;
const pct = Math.round((tested / Math.max(total, 1)) * 100);

interface Issue { fn: string; severity: "warning"; message: string }
const issues: Issue[] = [];

// Flag high side-effect functions without tests
for (const f of activeFns) {
  if (f.sideEffectClass === "high" && !onDiskTests.has(f.name)) {
    issues.push({ fn: f.name, severity: "warning", message: "High side-effect function without contract test" });
  }
}

writeFileSync(join(OUT, "edge-function-contract-tests-report.json"), JSON.stringify({
  generatedAt: new Date().toISOString(), gate: "edge-function-contract-tests",
  ok: true, totalActive: total, tested, coveragePercent: pct,
  warningCount: issues.length, issues,
}, null, 2));

console.log(`${issues.length === 0 ? "✅" : "⚠"} edge-function-contract-tests: ${tested}/${total} (${pct}%) — ${issues.length} warnings`);
process.exit(0);