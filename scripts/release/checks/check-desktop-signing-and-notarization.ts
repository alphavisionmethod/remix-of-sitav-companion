#!/usr/bin/env node
import { existsSync } from "node:fs";
import { emitGateReport, type GateIssue } from "../../validation/_lib/emit-gate-report";
const issues: GateIssue[] = [];
const FILES = ["src/lib/release/desktop-signing-policy.ts","generated/desktop-notarization-status.json","electron/entitlements.plist","electron/forge.config.cjs"];
for (const f of FILES) { if (!existsSync(f)) issues.push({ severity: "error", area: "desktop-signing", message: `Missing: ${f}` }); }
if (!existsSync("scripts/release/desktop/verify-signing-credentials.ts")) issues.push({ severity: "error", area: "desktop-signing", message: "Missing credential verifier" });
if (!existsSync(".github/workflows/release-electron.yml")) issues.push({ severity: "error", area: "desktop-signing", message: "Missing release-electron workflow" });
const ok = issues.filter(i => i.severity === "error").length === 0;
emitGateReport({ gate: "desktop-signing-notarization", ok, issues });
console.log(`Desktop signing/notarization: ${ok ? "✅" : "❌"}`);
if (!ok) process.exit(1);