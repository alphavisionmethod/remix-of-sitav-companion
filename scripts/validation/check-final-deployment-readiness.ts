#!/usr/bin/env node
/* eslint-disable no-console */
// Final deployment readiness meta-gate. Aggregates the operational-readiness
// signals required for cuttable release: restore drill, OAuth refresh probes,
// Boardroom Layer 7 closure, kill-switch enforcement, signed release artifacts.
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const REQUIRED = [
  "generated/restore-drill-report.json",
  "generated/boardroom-layer7-closure-report.json",
  "generated/kill-switch-enforcement-report.json",
  "generated/signed-release-artifacts-report.json",
  "generated/pg-cron-schedules-report.json",
];

const issues: GateIssue[] = [];
let aggregateOk = true;
const checked: Array<{ file: string; ok: boolean; errors: number; warnings: number }> = [];

for (const file of REQUIRED) {
  if (!existsSync(file)) {
    issues.push({ severity: "error", area: "missing-input", message: `Required input ${file} not found` });
    aggregateOk = false;
    continue;
  }
  try {
    const data = JSON.parse(readFileSync(file, "utf-8"));
    const errors = Number(data.errorCount ?? 0);
    const warnings = Number(data.warningCount ?? 0);
    const ok = data.ok ?? errors === 0;
    checked.push({ file, ok, errors, warnings });
    if (!ok) {
      aggregateOk = false;
      issues.push({
        severity: "error",
        area: "downstream-gate",
        message: `${file} not OK (${errors} errors, ${warnings} warnings)`,
      });
    }
  } catch (e: any) {
    issues.push({ severity: "error", area: "parse", message: `Failed to parse ${file}: ${e.message}` });
    aggregateOk = false;
  }
}

console.log(
  `${aggregateOk ? "✅" : "❌"} final-deployment-readiness: ${checked.filter((c) => c.ok).length}/${REQUIRED.length} downstream gates OK`,
);
issues.slice(0, 10).forEach((i) => console.error(`   [${i.severity}] ${i.area}: ${i.message}`));
emitGateReport({
  gate: "final-deployment-readiness",
  ok: aggregateOk,
  issues,
  extra: { checked },
});
process.exit(aggregateOk ? 0 : 1);
