#!/usr/bin/env node
/* eslint-disable no-console */
// Phase 9 hardening — pg_cron schedules must be documented for the 4 critical loops.
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport } from "./_lib/emit-gate-report";

const docPath = "docs/runbooks/pg-cron-schedules.md";
const exists = existsSync(docPath);
const blob = exists ? readFileSync(docPath, "utf-8") : "";
const required = [
  "canary-chaos-cron",
  "webhook-retry-processor",
  "compliance-evidence-cron",
  "dr-drill-cron",
];
const missing = required.filter(r => !blob.includes(r));
const ok = exists && missing.length === 0;
console.log(`${ok ? "✅" : "❌"} pg-cron-schedules: doc=${exists} missing=${missing.join(",") || "none"}`);
emitGateReport({
  gate: "pg-cron-schedules", ok,
  issues: ok ? [] : [{ severity: "error" as const, area: "scheduling", message: `pg_cron schedules doc missing entries: ${missing.join(", ")}` }],
});
process.exit(ok ? 0 : 1);
