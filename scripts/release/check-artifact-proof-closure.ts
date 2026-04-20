#!/usr/bin/env node
/* eslint-disable no-console */
// SITA OS — Release Artifact Proof Closure Validator
import { existsSync } from "node:fs";
import { emitGateReport, type GateIssue } from "../validation/_lib/emit-gate-report";

const issues: GateIssue[] = [];

const REQUIRED = [
  "generated/release-provenance-attestation.json",
  "generated/rollback-verification.json",
];

for (const f of REQUIRED) {
  if (!existsSync(f)) issues.push({ severity: "error", area: "release-proof", message: `Missing: ${f}` });
}

const ok = issues.filter(i => i.severity === "error").length === 0;
const file = emitGateReport({ gate: "artifact-proof-closure", ok, issues });
console.log(`Artifact proof closure: ${ok ? "✅" : "❌"} → ${file}`);
if (!ok) process.exit(1);