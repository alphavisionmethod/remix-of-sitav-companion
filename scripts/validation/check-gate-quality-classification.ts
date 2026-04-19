#!/usr/bin/env node
/* eslint-disable no-console */
// Admin & Validation Closure — gate quality classification gate
// Ensures gate-quality-status.json declares a valid taxonomy summary.
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport } from "./_lib/emit-gate-report";

const STATUS = "generated/admin-and-validation-closure/gate-quality-status.json";
const issues: Array<{ severity: "error" | "warning"; area: string; message: string }> = [];

if (!existsSync(STATUS)) {
  emitGateReport({ gate: "gate-quality-classification", ok: false, issues: [{ severity: "error", area: "status", message: `Missing ${STATUS}` }] });
  console.error(`❌ gate-quality-classification: missing ${STATUS}`);
  process.exit(1);
}

const data = JSON.parse(readFileSync(STATUS, "utf-8")) as { taxonomy?: string[]; summary?: Record<string, number> };

const REQUIRED = ["structural", "smoke", "behavioral", "e2e", "warn-only"];
for (const k of REQUIRED) {
  if (!data.taxonomy?.includes(k)) issues.push({ severity: "error", area: "taxonomy", message: `Missing class ${k}` });
  if (typeof data.summary?.[k] !== "number") issues.push({ severity: "error", area: "summary", message: `Missing summary count for ${k}` });
}
if (typeof data.summary?.total !== "number") issues.push({ severity: "error", area: "summary", message: "Missing total" });

const sumOfClasses = REQUIRED.reduce((acc, k) => acc + (data.summary?.[k] ?? 0), 0);
const declaredTotal = data.summary?.total ?? 0;
if (sumOfClasses !== declaredTotal) {
  issues.push({ severity: "error", area: "summary", message: `Class sum ${sumOfClasses} ≠ declared total ${declaredTotal}` });
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({ gate: "gate-quality-classification", ok, issues, extra: { totalClassified: declaredTotal } });
console.log(`${ok ? "✅" : "❌"} gate-quality-classification: ${declaredTotal} gates classified, ${issues.length} issue(s) [BLOCK]`);
process.exit(ok ? 0 : 1);
