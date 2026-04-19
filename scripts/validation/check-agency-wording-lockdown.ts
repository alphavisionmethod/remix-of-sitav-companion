#!/usr/bin/env node
/* eslint-disable no-console */
// Economic-Trust-Future Closure — agency-wording lockdown.
// Re-asserts that trust-copy-quality and trust-ladder-never-self-promote are present.
import { existsSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "agency-wording-lockdown";
const REQUIRED = [
  "scripts/validation/check-trust-copy-quality.ts",
  "scripts/validation/check-trust-ladder-never-self-promote.ts",
];
const issues: GateIssue[] = [];
for (const f of REQUIRED) {
  if (!existsSync(f)) issues.push({ severity: "error", area: "missing-validator", message: `${f} missing` });
}

const ok = issues.length === 0;
console.log(`${ok ? "✅" : "❌"} ${GATE}: ${issues.length} issue(s)`);
emitGateReport({ gate: GATE, ok, issues });
process.exit(ok ? 0 : 1);
