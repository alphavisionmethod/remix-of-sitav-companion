#!/usr/bin/env node
/* eslint-disable no-console */
// SITA OS — Runbook Linkage Validator
import { existsSync } from "node:fs";
import { emitGateReport, type GateIssue } from "../validation/_lib/emit-gate-report";

const issues: GateIssue[] = [];

if (!existsSync("src/lib/operations/golden-path-registry.ts")) {
  issues.push({ severity: "error", area: "runbooks", message: "Missing golden-path-registry.ts" });
}
if (!existsSync("src/lib/control-plane/kill-switch-registry.ts")) {
  issues.push({ severity: "error", area: "kill-switches", message: "Missing kill-switch-registry.ts" });
}
if (!existsSync("src/lib/operations/recovery-execution-engine.ts")) {
  issues.push({ severity: "error", area: "recovery", message: "Missing recovery-execution-engine.ts" });
}

const ok = issues.filter(i => i.severity === "error").length === 0;
const file = emitGateReport({ gate: "runbook-linkage", ok, issues });
console.log(`Runbook linkage: ${ok ? "✅" : "❌"} → ${file}`);
if (!ok) process.exit(1);