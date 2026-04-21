#!/usr/bin/env node
import { existsSync } from "node:fs";
import { emitGateReport, type GateIssue } from "../validation/_lib/emit-gate-report";
const issues: GateIssue[] = [];
if (!existsSync("src/lib/mobile/mobile-offline-policy.ts")) issues.push({ severity: "error", area: "mobile-offline-policy", message: "Missing source: src/lib/mobile/mobile-offline-policy.ts" });
if (!existsSync("generated/mobile-offline-policy-report.json")) issues.push({ severity: "error", area: "mobile-offline-policy", message: "Missing: generated/mobile-offline-policy-report.json" });
const ok = issues.filter(i => i.severity === "error").length === 0;
emitGateReport({ gate: "mobile-offline-policy", ok, issues });
console.log("Mobile offline-policy: " + (ok ? "✅" : "❌"));
if (!ok) process.exit(1);
