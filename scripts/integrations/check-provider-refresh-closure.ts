#!/usr/bin/env node
/* eslint-disable no-console */
// SITA OS — Provider Refresh Closure Validator
import { existsSync } from "node:fs";
import { emitGateReport, type GateIssue } from "../validation/_lib/emit-gate-report";

const issues: GateIssue[] = [];

if (!existsSync("generated/provider-refresh-closure.json")) {
  issues.push({ severity: "error", area: "refresh", message: "Missing generated/provider-refresh-closure.json" });
}
if (!existsSync("generated/integration-health-matrix.json")) {
  issues.push({ severity: "error", area: "health", message: "Missing generated/integration-health-matrix.json" });
}

const ok = issues.filter(i => i.severity === "error").length === 0;
const file = emitGateReport({ gate: "provider-refresh-closure", ok, issues });
console.log(`Provider refresh closure: ${ok ? "✅" : "❌"} → ${file}`);
if (!ok) process.exit(1);