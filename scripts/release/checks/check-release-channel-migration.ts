#!/usr/bin/env node
import { existsSync } from "node:fs";
import { emitGateReport, type GateIssue } from "../../validation/_lib/emit-gate-report";
const issues: GateIssue[] = [];
if (!existsSync("src/lib/release/release-channel-policy.ts")) issues.push({ severity: "error", area: "channels", message: "Missing channel policy" });
if (!existsSync("generated/release-channel-migration-report.json")) issues.push({ severity: "error", area: "channels", message: "Missing migration report" });
const ok = issues.filter(i => i.severity === "error").length === 0;
emitGateReport({ gate: "release-channel-migration", ok, issues });
console.log(`Release channel migration: ${ok ? "✅" : "❌"}`);
if (!ok) process.exit(1);