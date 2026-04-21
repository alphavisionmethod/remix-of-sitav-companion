#!/usr/bin/env node
/* eslint-disable no-console */
// SITA OS — Release Artifact Proof Closure Validator
import { existsSync } from "node:fs";
import { emitGateReport, type GateIssue } from "../validation/_lib/emit-gate-report";

const issues: GateIssue[] = [];

const REQUIRED = [
  "generated/release-provenance-attestation.json",
  "generated/rollback-verification.json",
  "generated/desktop-notarization-status.json",
  "generated/os-boot-ci-matrix.json",
  "generated/install-upgrade-rollback-matrix.json",
  "generated/hardware-compatibility-validation.json",
  "generated/first-boot-certification-report.json",
  "generated/release-channel-migration-report.json",
  "generated/supply-chain-attestation.json",
  "generated/release-checksums.json",
  "generated/release-supportability-report.json",
  "public/generated/release-artifact-proof/desktop/proof-pack.json",
  "public/generated/release-artifact-proof/os-images/proof-pack.json",
];

for (const f of REQUIRED) {
  if (!existsSync(f)) issues.push({ severity: "error", area: "release-proof", message: `Missing: ${f}` });
}

const ok = issues.filter(i => i.severity === "error").length === 0;
const file = emitGateReport({ gate: "artifact-proof-closure", ok, issues });
console.log(`Artifact proof closure: ${ok ? "✅" : "❌"} → ${file}`);
if (!ok) process.exit(1);