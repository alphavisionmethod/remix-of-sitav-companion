#!/usr/bin/env node
/* eslint-disable no-console */
// SITA OS — AI Capability Proof Validator
import { existsSync } from "node:fs";
import { emitGateReport, type GateIssue } from "../validation/_lib/emit-gate-report";

const issues: GateIssue[] = [];

if (!existsSync("generated/ai-capability-proof-matrix.json")) {
  issues.push({ severity: "error", area: "ai-proof", message: "Missing generated/ai-capability-proof-matrix.json" });
}
if (!existsSync("src/lib/ai-platform/runtime/advisor-permission-matrix.ts")) {
  issues.push({ severity: "error", area: "ai-contracts", message: "Missing advisor-permission-matrix.ts" });
}
if (!existsSync("src/lib/ai-platform/runtime/advisor-escalation-policy.ts")) {
  issues.push({ severity: "error", area: "ai-contracts", message: "Missing advisor-escalation-policy.ts" });
}

const ok = issues.filter(i => i.severity === "error").length === 0;
const file = emitGateReport({ gate: "ai-capability-proof", ok, issues });
console.log(`AI capability proof: ${ok ? "✅" : "❌"} → ${file}`);
if (!ok) process.exit(1);