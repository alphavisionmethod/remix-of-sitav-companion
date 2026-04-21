#!/usr/bin/env node
import { existsSync } from "node:fs";
import { emitGateReport, type GateIssue } from "../../validation/_lib/emit-gate-report";
const issues: GateIssue[] = [];
if (!existsSync("src/lib/release/hardware-compatibility-matrix.ts")) issues.push({ severity: "error", area: "hw-compat", message: "Missing matrix source" });
if (!existsSync("generated/hardware-compatibility-validation.json")) issues.push({ severity: "error", area: "hw-compat", message: "Missing generated report" });
const ok = issues.filter(i => i.severity === "error").length === 0;
emitGateReport({ gate: "hardware-compatibility", ok, issues });
console.log(`Hardware compatibility: ${ok ? "✅" : "❌"}`);
if (!ok) process.exit(1);