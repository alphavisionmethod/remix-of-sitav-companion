#!/usr/bin/env node
import { existsSync } from "node:fs";
import { emitGateReport, type GateIssue } from "../../validation/_lib/emit-gate-report";
const issues: GateIssue[] = [];
if (!existsSync("src/lib/release/first-boot-certification.ts")) issues.push({ severity: "error", area: "first-boot", message: "Missing certification source" });
if (!existsSync("generated/first-boot-certification-report.json")) issues.push({ severity: "error", area: "first-boot", message: "Missing generated report" });
if (!existsSync("scripts/release/iso/sita-first-boot.sh")) issues.push({ severity: "error", area: "first-boot", message: "Missing first-boot script" });
const ok = issues.filter(i => i.severity === "error").length === 0;
emitGateReport({ gate: "first-boot-certification", ok, issues });
console.log(`First-boot certification: ${ok ? "✅" : "❌"}`);
if (!ok) process.exit(1);