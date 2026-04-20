#!/usr/bin/env node
/* eslint-disable no-console */
// SITA OS — Truth Surface Coverage Validator
import { existsSync } from "node:fs";
import { emitGateReport, type GateIssue } from "../validation/_lib/emit-gate-report";

const issues: GateIssue[] = [];

if (!existsSync("src/lib/frontend/truth-surface-registry.ts")) {
  issues.push({ severity: "error", area: "truth-surfaces", message: "Missing truth-surface-registry.ts" });
}
if (!existsSync("generated/frontend-closure-bundle.json")) {
  issues.push({ severity: "warning", area: "proof", message: "Missing frontend-closure-bundle.json" });
}

const file = emitGateReport({ gate: "truth-surface-coverage", ok: issues.filter(i => i.severity === "error").length === 0, issues });
console.log(`Truth surface coverage: ${issues.filter(i => i.severity === "error").length === 0 ? "✅" : "❌"} → ${file}`);
if (issues.filter(i => i.severity === "error").length > 0) process.exit(1);