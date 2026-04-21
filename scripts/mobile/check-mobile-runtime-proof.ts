#!/usr/bin/env node
import { existsSync } from "node:fs";
import { emitGateReport, type GateIssue } from "../validation/_lib/emit-gate-report";
const issues: GateIssue[] = [];
if (!existsSync("src/lib/mobile/mobile-runtime-proof-map.ts")) issues.push({ severity: "error", area: "mobile-runtime-proof", message: "Missing source: src/lib/mobile/mobile-runtime-proof-map.ts" });
if (!existsSync("generated/mobile-runtime-proof-report.json")) issues.push({ severity: "error", area: "mobile-runtime-proof", message: "Missing: generated/mobile-runtime-proof-report.json" });
const ok = issues.filter(i => i.severity === "error").length === 0;
emitGateReport({ gate: "mobile-runtime-proof", ok, issues });
console.log("Mobile runtime-proof: " + (ok ? "✅" : "❌"));
if (!ok) process.exit(1);
