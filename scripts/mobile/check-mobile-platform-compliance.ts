#!/usr/bin/env node
import { existsSync } from "node:fs";
import { emitGateReport, type GateIssue } from "../validation/_lib/emit-gate-report";
const issues: GateIssue[] = [];
if (!existsSync("src/lib/mobile/mobile-platform-compliance-map.ts")) issues.push({ severity: "error", area: "mobile-platform-compliance", message: "Missing source: src/lib/mobile/mobile-platform-compliance-map.ts" });
if (!existsSync("generated/mobile-platform-compliance-report.json")) issues.push({ severity: "error", area: "mobile-platform-compliance", message: "Missing: generated/mobile-platform-compliance-report.json" });
const ok = issues.filter(i => i.severity === "error").length === 0;
emitGateReport({ gate: "mobile-platform-compliance", ok, issues });
console.log("Mobile platform-compliance: " + (ok ? "✅" : "❌"));
if (!ok) process.exit(1);
