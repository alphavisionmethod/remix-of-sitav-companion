#!/usr/bin/env node
/* eslint-disable no-console */
// Admin & Validation Closure — behavioral CI coverage gate
// Asserts every deployment-critical area has a behavioral or e2e validator.
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport } from "./_lib/emit-gate-report";

const STATUS = "generated/admin-and-validation-closure/gate-quality-status.json";
const issues: Array<{ severity: "error" | "warning"; area: string; message: string }> = [];

if (!existsSync(STATUS)) {
  emitGateReport({ gate: "behavioral-ci-coverage", ok: false, issues: [{ severity: "error", area: "status", message: `Missing ${STATUS}` }] });
  console.error(`❌ behavioral-ci-coverage: missing ${STATUS}`);
  process.exit(1);
}

const data = JSON.parse(readFileSync(STATUS, "utf-8")) as { deployment_critical_behavioral_areas?: Array<{ area: string; validator: string; class: string; status?: string }> };
const areas = data.deployment_critical_behavioral_areas ?? [];

const REQUIRED_AREAS = new Set([
  "ai-live-provider", "ai-receipt-persistence", "ai-ledger", "ai-fallback", "ai-budget",
  "oauth-google", "oauth-microsoft", "oauth-slack",
  "boardroom-l7", "restore-drill",
]);
const present = new Set(areas.map((a) => a.area));
for (const required of REQUIRED_AREAS) {
  if (!present.has(required)) {
    issues.push({ severity: "error", area: required, message: `Missing behavioral validator declaration for required area` });
  }
}
for (const a of areas) {
  if (REQUIRED_AREAS.has(a.area) && !["behavioral", "e2e"].includes(a.class)) {
    issues.push({ severity: "error", area: a.area, message: `Required area not behavioral/e2e (class=${a.class})` });
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({ gate: "behavioral-ci-coverage", ok, issues, extra: { areasDeclared: areas.length, requiredAreas: REQUIRED_AREAS.size } });
console.log(`${ok ? "✅" : "❌"} behavioral-ci-coverage: ${areas.length} areas declared, ${issues.length} issue(s) [BLOCK]`);
process.exit(ok ? 0 : 1);
