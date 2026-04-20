#!/usr/bin/env node
/* eslint-disable no-console */
// SITA OS — OAuth Security Closure Validator
import { existsSync } from "node:fs";
import { emitGateReport, type GateIssue } from "../validation/_lib/emit-gate-report";

const issues: GateIssue[] = [];

if (!existsSync("generated/oauth-security-closure.json")) {
  issues.push({ severity: "error", area: "oauth", message: "Missing generated/oauth-security-closure.json" });
}

const ok = issues.filter(i => i.severity === "error").length === 0;
const file = emitGateReport({ gate: "oauth-security-closure", ok, issues });
console.log(`OAuth security closure: ${ok ? "✅" : "❌"} → ${file}`);
if (!ok) process.exit(1);