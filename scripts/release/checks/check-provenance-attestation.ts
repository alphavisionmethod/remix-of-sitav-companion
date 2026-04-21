#!/usr/bin/env node
import { existsSync } from "node:fs";
import { emitGateReport, type GateIssue } from "../../validation/_lib/emit-gate-report";
const issues: GateIssue[] = [];
const FILES = ["src/lib/release/provenance-attestation-builder.ts","generated/release-provenance-attestation.json","generated/supply-chain-attestation.json"];
for (const f of FILES) { if (!existsSync(f)) issues.push({ severity: "error", area: "provenance", message: `Missing: ${f}` }); }
const ok = issues.filter(i => i.severity === "error").length === 0;
emitGateReport({ gate: "provenance-attestation", ok, issues });
console.log(`Provenance/attestation: ${ok ? "✅" : "❌"}`);
if (!ok) process.exit(1);