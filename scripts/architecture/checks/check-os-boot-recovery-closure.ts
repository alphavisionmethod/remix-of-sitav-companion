#!/usr/bin/env node
/* eslint-disable no-console */
// SITA OS — Boot Chain & Recovery Closure Validator
import { existsSync } from "node:fs";
import { emitGateReport, type GateIssue } from "../../validation/_lib/emit-gate-report";

const issues: GateIssue[] = [];

const REQUIRED = [
  "src/runtimes/appliance/boot-chain-contract.ts",
  "src/runtimes/appliance/platform-daemon-registry.ts",
  "src/runtimes/appliance/recovery-contract.ts",
  "generated/os-boot-proof-bundle.json",
  "generated/recovery-path-verification.json",
  "generated/runtime-degradation-matrix.json",
];

for (const f of REQUIRED) {
  if (!existsSync(f)) issues.push({ severity: "error", area: "boot-recovery", message: `Missing: ${f}` });
}

const file = emitGateReport({ gate: "os-boot-recovery-closure", ok: issues.filter(i => i.severity === "error").length === 0, issues });
console.log(`Boot/recovery closure: ${issues.filter(i => i.severity === "error").length === 0 ? "✅" : "❌"} → ${file}`);
if (issues.filter(i => i.severity === "error").length > 0) process.exit(1);