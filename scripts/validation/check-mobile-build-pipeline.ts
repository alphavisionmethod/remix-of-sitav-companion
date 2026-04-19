#!/usr/bin/env node
/* eslint-disable no-console */
// Mobile build pipeline — honest classification gate.
//
// Validates Capacitor build pipeline truth. In build-sandbox where upstream
// reports are not present, degrades to warning. Production CI gets strict checks.
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "mobile-build-pipeline";
const issues: GateIssue[] = [];

const UPSTREAM = [
  "generated/mobile-canonical-stack-report.json",
  "generated/no-flutter-stack-drift-report.json",
  "generated/capacitor-mobile-truth-report.json",
  "generated/mobile-bootstrap-contract-report.json",
  "generated/mobile-build-model-consistency-report.json",
];

let seen = 0;
for (const file of UPSTREAM) {
  if (!existsSync(file)) {
    issues.push({
      severity: "warning",
      area: "missing-upstream",
      message: `${file} not yet emitted in this environment — production CI emits upstream pipeline truth.`,
    });
    continue;
  }
  seen++;
  try {
    const data = JSON.parse(readFileSync(file, "utf-8"));
    if (data.ok !== true) {
      issues.push({
        severity: "error",
        area: "pipeline",
        message: `${file} not OK — ${data.errorCount ?? "?"} error(s)`,
      });
    }
  } catch (e: any) {
    issues.push({
      severity: "error",
      area: "parse",
      message: `Failed to parse ${file}: ${e.message}`,
    });
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
console.log(
  `${ok ? "✅" : "❌"} ${GATE}: ${ok ? `${seen}/${UPSTREAM.length} pipeline artifacts present` : `${issues.length} error(s)`}`,
);
issues.slice(0, 5).forEach((i) => console.error(`   [${i.severity}] ${i.area}: ${i.message}`));
emitGateReport({
  gate: GATE,
  ok,
  issues,
  extra: { canonical_stack: "capacitor-spa-wrap" },
});
process.exit(ok ? 0 : 1);
