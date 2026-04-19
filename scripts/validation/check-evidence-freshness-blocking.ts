#!/usr/bin/env node
/* eslint-disable no-console */
// Admin & Validation Closure — evidence-freshness BLOCK promotion gate
// Reads observation-window-status.json. Stays WARN until 30-day clean window.
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport } from "./_lib/emit-gate-report";

const STATUS = "generated/admin-and-validation-closure/observation-window-status.json";
const REQUIRED_CLEAN_DAYS = 30;
const issues: Array<{ severity: "error" | "warning"; area: string; message: string }> = [];

if (!existsSync(STATUS)) {
  emitGateReport({ gate: "evidence-freshness-blocking", ok: true, issues: [{ severity: "warning", area: "status", message: `${STATUS} missing — cannot promote` }] });
  console.log(`⚠ evidence-freshness-blocking: ${STATUS} missing [WARN]`);
  process.exit(0);
}

const data = JSON.parse(readFileSync(STATUS, "utf-8")) as { clean_days_consecutive?: number; any_freshness_failure_in_window?: boolean };
const clean = data.clean_days_consecutive ?? 0;
const failure = data.any_freshness_failure_in_window ?? false;

const eligible = clean >= REQUIRED_CLEAN_DAYS && !failure;
const isBlock = eligible;
const ok = !isBlock || (isBlock && !failure);

if (!isBlock) {
  issues.push({ severity: "warning", area: "observation-window", message: `${clean}/${REQUIRED_CLEAN_DAYS} clean days; failure-in-window=${failure} — staying WARN until promotion eligible` });
}

emitGateReport({
  gate: "evidence-freshness-blocking",
  ok: true, // warn-only until promotion eligible
  issues,
  extra: { cleanDaysConsecutive: clean, requiredCleanDays: REQUIRED_CLEAN_DAYS, eligibleForBlock: eligible, level: eligible ? "block" : "warn" },
});
console.log(`${eligible ? "✅" : "⚠"} evidence-freshness-blocking: ${clean}/${REQUIRED_CLEAN_DAYS} clean days [${eligible ? "BLOCK-ELIGIBLE" : "WARN"}]`);
process.exit(0);
