#!/usr/bin/env node
/* eslint-disable no-console */
// SITA OS — App Platform Lifecycle Closure Validator
import { existsSync } from "node:fs";
import { emitGateReport, type GateIssue } from "../../validation/_lib/emit-gate-report";

const issues: GateIssue[] = [];

const REQUIRED = [
  "src/lib/app-platform/app-recovery-manager.ts",
  "src/lib/app-platform/install-state.ts",
  "generated/app-lifecycle-closure.json",
];

for (const f of REQUIRED) {
  if (!existsSync(f)) issues.push({ severity: "error", area: "app-lifecycle", message: `Missing: ${f}` });
}

const file = emitGateReport({ gate: "app-lifecycle-closure", ok: issues.filter(i => i.severity === "error").length === 0, issues });
console.log(`App lifecycle: ${issues.filter(i => i.severity === "error").length === 0 ? "✅" : "❌"} → ${file}`);
if (issues.filter(i => i.severity === "error").length > 0) process.exit(1);