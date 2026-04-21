#!/usr/bin/env node
import { existsSync } from "node:fs";
import { emitGateReport, type GateIssue } from "../../validation/_lib/emit-gate-report";
const issues: GateIssue[] = [];
const FILES = ["src/lib/release/os-boot-validation-policy.ts","generated/os-boot-ci-matrix.json",".github/workflows/os-build-iso.yml","os/qemu-validate.sh"];
for (const f of FILES) { if (!existsSync(f)) issues.push({ severity: "error", area: "os-boot", message: `Missing: ${f}` }); }
const ok = issues.filter(i => i.severity === "error").length === 0;
emitGateReport({ gate: "os-boot-validation", ok, issues });
console.log(`OS boot validation: ${ok ? "✅" : "❌"}`);
if (!ok) process.exit(1);