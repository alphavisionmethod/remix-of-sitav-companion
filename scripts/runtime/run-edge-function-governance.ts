#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Edge Function Governance Aggregator
//
// Runs all edge function governance checks + emits a unified report.
//
// Usage:
//   npx tsx scripts/runtime/run-edge-function-governance.ts
//   npx tsx scripts/runtime/run-edge-function-governance.ts --strict
// ═══════════════════════════════════════════════════════════════

import { spawnSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import {
  EDGE_FUNCTION_AUTHORITY,
  getCategoryCounts,
} from "../../src/lib/migration/edge-function-authority-map";

const STRICT = process.argv.includes("--strict");

interface Step {
  name: string;
  script: string;
  required: boolean;
}

const STEPS: Step[] = [
  { name: "Ownership map",       script: "scripts/runtime/edge-functions/check-edge-function-ownership.ts",     required: true },
  { name: "CORS coverage",       script: "scripts/runtime/edge-functions/check-edge-function-cors.ts",          required: true },
  { name: "Auth alignment",      script: "scripts/runtime/edge-functions/check-edge-function-auth.ts",          required: true },
  { name: "Test coverage",       script: "scripts/runtime/edge-functions/check-edge-function-test-coverage.ts", required: false },
];

console.log("═══════════════════════════════════════════════════════════════");
console.log("  SITA OS — Edge Function Governance");
console.log(`  Mode: ${STRICT ? "STRICT" : "STANDARD"}`);
console.log(`  Authority map: ${EDGE_FUNCTION_AUTHORITY.length} functions classified`);
console.log("═══════════════════════════════════════════════════════════════\n");

let failed = 0;
const results: Array<{ name: string; ok: boolean; output: string; required: boolean }> = [];

for (const step of STEPS) {
  process.stdout.write(`▶ ${step.name.padEnd(28)} `);
  const r = spawnSync("npx", ["tsx", step.script], { encoding: "utf-8" });
  const ok = r.status === 0;
  results.push({ name: step.name, ok, output: (r.stdout || "") + (r.stderr || ""), required: step.required });
  console.log(ok ? "✅" : (step.required ? "❌" : "⚠️"));
  if (!ok && step.required) failed++;
  if (!ok && STRICT) failed++;
}

// ── Emit JSON report ─────────────────────────────────────────────
const categoryCounts = getCategoryCounts();
const authCounts = EDGE_FUNCTION_AUTHORITY.reduce((acc, e) => {
  acc[e.authClass] = (acc[e.authClass] || 0) + 1;
  return acc;
}, {} as Record<string, number>);
const riskCounts = EDGE_FUNCTION_AUTHORITY.reduce((acc, e) => {
  acc[e.riskTier] = (acc[e.riskTier] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

const reportJson = {
  generatedAt: new Date().toISOString(),
  mode: STRICT ? "strict" : "standard",
  totalFunctions: EDGE_FUNCTION_AUTHORITY.length,
  categoryCounts,
  authClassCounts: authCounts,
  riskTierCounts: riskCounts,
  checks: results.map((r) => ({ name: r.name, status: r.ok ? "PASS" : "FAIL", required: r.required })),
  summary: {
    passed: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
    overallStatus: failed === 0 ? "GREEN" : "RED",
  },
};

fs.mkdirSync("generated", { recursive: true });
fs.writeFileSync(
  path.join("generated", "edge-function-governance-report.json"),
  JSON.stringify(reportJson, null, 2),
);

// ── Console summary ──────────────────────────────────────────────
console.log("\n═══════════════════════════════════════════════════════════════");
console.log(`📊 Edge Function Governance: ${results.filter((r) => r.ok).length}/${results.length} checks passed`);
console.log(`📂 Categories: ${Object.entries(categoryCounts).map(([k, v]) => `${k}=${v}`).join(", ")}`);
console.log(`🔐 Auth: ${Object.entries(authCounts).map(([k, v]) => `${k}=${v}`).join(", ")}`);
console.log(`⚠️  Risk: ${Object.entries(riskCounts).map(([k, v]) => `${k}=${v}`).join(", ")}`);
console.log(`📄 Report: generated/edge-function-governance-report.json`);
console.log("═══════════════════════════════════════════════════════════════");

if (failed > 0) {
  console.log("\n❌ FAILED STEPS:\n");
  for (const r of results.filter((x) => !x.ok)) {
    console.log(`── ${r.name} ──`);
    console.log(r.output);
  }
  process.exit(1);
}

console.log("\n✅ Edge function governance: GREEN");
process.exit(0);
