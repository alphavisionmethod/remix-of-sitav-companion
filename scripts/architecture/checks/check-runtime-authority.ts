#!/usr/bin/env node
/* eslint-disable no-console */
// SITA OS — Runtime Authority Closure Validator
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { emitGateReport, type GateIssue } from "../../validation/_lib/emit-gate-report";

const issues: GateIssue[] = [];

const REQUIRED_FILES = [
  "src/runtimes/runtime-authority.ts",
  "src/runtimes/runtime-surface-contract.ts",
  "src/runtimes/runtime-detection.ts",
  "src/runtimes/runtime-capability-matrix.ts",
  "src/runtimes/feature-runtime-tier-registry.ts",
];

for (const f of REQUIRED_FILES) {
  if (!existsSync(f)) issues.push({ severity: "error", area: "runtime-authority", message: `Missing: ${f}` });
}

if (!existsSync("generated/runtime-capability-closure.json")) {
  issues.push({ severity: "warning", area: "proof", message: "Missing generated/runtime-capability-closure.json" });
}

const file = emitGateReport({ gate: "runtime-authority", ok: issues.filter(i => i.severity === "error").length === 0, issues });
console.log(`Runtime authority: ${issues.filter(i => i.severity === "error").length === 0 ? "✅" : "❌"} → ${file}`);
if (issues.filter(i => i.severity === "error").length > 0) process.exit(1);