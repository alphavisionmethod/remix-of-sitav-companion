#!/usr/bin/env node
import { existsSync } from "node:fs";
import { emitGateReport, type GateIssue } from "../../validation/_lib/emit-gate-report";
const issues: GateIssue[] = [];
const PACKS = ["public/generated/release-artifact-proof/desktop/proof-pack.json","public/generated/release-artifact-proof/os-images/proof-pack.json"];
for (const f of PACKS) { if (!existsSync(f)) issues.push({ severity: "error", area: "evidence-packs", message: `Missing: ${f}` }); }
const REQUIRED = ["generated/desktop-notarization-status.json","generated/os-boot-ci-matrix.json","generated/install-upgrade-rollback-matrix.json","generated/hardware-compatibility-validation.json","generated/first-boot-certification-report.json","generated/release-channel-migration-report.json","generated/release-checksums.json","generated/supply-chain-attestation.json","generated/release-supportability-report.json","generated/release-provenance-attestation.json"];
for (const f of REQUIRED) { if (!existsSync(f)) issues.push({ severity: "error", area: "evidence-packs", message: `Missing: ${f}` }); }
const ok = issues.filter(i => i.severity === "error").length === 0;
emitGateReport({ gate: "release-evidence-packs", ok, issues });
console.log(`Release evidence packs: ${ok ? "✅" : "❌"}`);
if (!ok) process.exit(1);