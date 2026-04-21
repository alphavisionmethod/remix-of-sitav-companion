#!/usr/bin/env node
import { existsSync } from "node:fs";
import { emitGateReport, type GateIssue } from "../validation/_lib/emit-gate-report";
const issues: GateIssue[] = [];
if (!existsSync("src/lib/mobile/mobile-support-pack-builder.ts")) issues.push({ severity: "error", area: "mobile-supportability", message: "Missing source: src/lib/mobile/mobile-support-pack-builder.ts" });
if (!existsSync("generated/mobile-supportability-report.json")) issues.push({ severity: "error", area: "mobile-supportability", message: "Missing: generated/mobile-supportability-report.json" });
const ok = issues.filter(i => i.severity === "error").length === 0;
emitGateReport({ gate: "mobile-supportability", ok, issues });
console.log("Mobile supportability: " + (ok ? "✅" : "❌"));
if (!ok) process.exit(1);
