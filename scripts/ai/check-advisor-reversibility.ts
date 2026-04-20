#!/usr/bin/env node
/* eslint-disable no-console */
// SITA OS — Advisor Reversibility Validator (advisory)
import { existsSync, mkdirSync, writeFileSync } from "node:fs";

const issues: Array<{ severity: "warning"; area: string; message: string }> = [];

if (!existsSync("src/lib/ai-platform/runtime/advisor-reversibility-map.ts")) {
  issues.push({ severity: "warning", area: "reversibility", message: "Missing advisor-reversibility-map.ts" });
}
if (!existsSync("generated/advisor-action-reversibility-report.json")) {
  issues.push({ severity: "warning", area: "proof", message: "Missing advisor-action-reversibility-report.json" });
}

mkdirSync("generated", { recursive: true });
writeFileSync("generated/advisor-reversibility-check-report.json", JSON.stringify({
  generatedAt: new Date().toISOString(), gate: "advisor-reversibility", ok: true, advisory: true, issues,
}, null, 2));
console.log("✅ Advisor reversibility check (advisory)");