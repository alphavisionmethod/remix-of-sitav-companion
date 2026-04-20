#!/usr/bin/env node
/* eslint-disable no-console */
// SITA OS — Route × Plane × Runtime × Profile Consistency Validator
import { existsSync } from "node:fs";
import { emitGateReport, type GateIssue } from "../../validation/_lib/emit-gate-report";

const issues: GateIssue[] = [];

const REQUIRED = [
  "src/platform/architecture/route-registry.ts",
  "src/platform/architecture/route-runtime-map.ts",
  "src/platform/architecture/route-profile-map.ts",
  "src/platform/architecture/page-owner-map.ts",
];

for (const f of REQUIRED) {
  if (!existsSync(f)) issues.push({ severity: "error", area: "route-consistency", message: `Missing: ${f}` });
}

const file = emitGateReport({ gate: "route-plane-runtime-profile-consistency", ok: issues.filter(i => i.severity === "error").length === 0, issues });
console.log(`Route consistency: ${issues.filter(i => i.severity === "error").length === 0 ? "✅" : "❌"} → ${file}`);
if (issues.filter(i => i.severity === "error").length > 0) process.exit(1);