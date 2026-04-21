#!/usr/bin/env node
import { existsSync } from "node:fs";
import { emitGateReport, type GateIssue } from "../../validation/_lib/emit-gate-report";
const issues: GateIssue[] = [];
if (!existsSync("src/lib/release/install-upgrade-rollback-matrix.ts")) issues.push({ severity: "error", area: "lifecycle", message: "Missing matrix source" });
if (!existsSync("generated/install-upgrade-rollback-matrix.json")) issues.push({ severity: "error", area: "lifecycle", message: "Missing generated matrix" });
const ok = issues.filter(i => i.severity === "error").length === 0;
emitGateReport({ gate: "install-upgrade-rollback", ok, issues });
console.log(`Install/upgrade/rollback: ${ok ? "✅" : "❌"}`);
if (!ok) process.exit(1);