#!/usr/bin/env node
/* eslint-disable no-console */
// Mobile build pipeline — honest classification gate.
//
// Validates that the Capacitor build pipeline truth artifacts exist and
// classify the build path consistently (no Flutter drift, no native
// generation that pretends to be store-uploadable without external accounts).
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "mobile-build-pipeline";
const issues: GateIssue[] = [];

const REQUIRED = [
  "generated/mobile-canonical-stack-report.json",
  "generated/no-flutter-stack-drift-report.json",
  "generated/capacitor-mobile-truth-report.json",
  "generated/mobile-bootstrap-contract-report.json",
  "generated/mobile-build-model-consistency-report.json",
];

for (const file of REQUIRED) {
  if (!existsSync(file)) {
    issues.push({
      severity: "error",
      area: "artifact",
      message: `${file} missing — mobile build pipeline not classified`,
    });
    continue;
  }
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
  `${ok ? "✅" : "❌"} ${GATE}: ${ok ? `${REQUIRED.length}/${REQUIRED.length} pipeline artifacts consistent` : `${issues.length} issue(s)`}`,
);
issues.slice(0, 5).forEach((i) => console.error(`   [${i.severity}] ${i.area}: ${i.message}`));
emitGateReport({
  gate: GATE,
  ok,
  issues,
  extra: { canonical_stack: "capacitor-spa-wrap" },
});
process.exit(ok ? 0 : 1);
