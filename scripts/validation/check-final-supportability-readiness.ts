#!/usr/bin/env node
/* eslint-disable no-console */
// Final supportability readiness meta-gate. Confirms operator-grade
// support primitives are present: runbooks, kill-switches, restore drill,
// support bundle generator, runbook operability evidence.
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const SUPPORTABILITY_GATES = [
  "generated/runbook-operability-report.json",
  "generated/kill-switch-enforcement-report.json",
  "generated/kill-switch-backfill-report.json",
  "generated/restore-drill-report.json",
  "generated/os-support-bundle-readiness-report.json",
  "generated/human-use-operational-readiness-report.json",
];

const issues: GateIssue[] = [];
let okCount = 0;
for (const file of SUPPORTABILITY_GATES) {
  if (!existsSync(file)) {
    issues.push({ severity: "error", area: "missing-support-gate", message: `${file} not produced` });
    continue;
  }
  try {
    const data = JSON.parse(readFileSync(file, "utf-8"));
    if (data.ok && Number(data.errorCount ?? 0) === 0) okCount++;
    else issues.push({ severity: "error", area: "support-gate-failed", message: `${file} reports issues` });
  } catch (e: any) {
    issues.push({ severity: "error", area: "parse", message: e.message });
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
console.log(`${ok ? "✅" : "❌"} final-supportability-readiness: ${okCount}/${SUPPORTABILITY_GATES.length} supportability gates OK`);
issues.slice(0, 10).forEach((i) => console.error(`   [${i.severity}] ${i.area}: ${i.message}`));
emitGateReport({
  gate: "final-supportability-readiness",
  ok,
  issues,
  extra: { okCount, totalGates: SUPPORTABILITY_GATES.length },
});
process.exit(ok ? 0 : 1);
