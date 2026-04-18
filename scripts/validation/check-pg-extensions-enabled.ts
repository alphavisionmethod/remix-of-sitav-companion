#!/usr/bin/env node
/* eslint-disable no-console */
// Phase 9 hardening — pg_cron + pg_net extension enablement must be documented.
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport } from "./_lib/emit-gate-report";

const docPath = "docs/runbooks/pg-cron-schedules.md";
const exists = existsSync(docPath);
const blob = exists ? readFileSync(docPath, "utf-8") : "";
const hasPgCron = /pg_cron/i.test(blob);
const hasPgNet = /pg_net/i.test(blob);
const ok = exists && hasPgCron && hasPgNet;
console.log(`${ok ? "✅" : "❌"} pg-extensions-enabled: doc=${exists} pg_cron=${hasPgCron} pg_net=${hasPgNet}`);
emitGateReport({
  gate: "pg-extensions-enabled", ok,
  issues: ok ? [] : [{ severity: "error" as const, area: "extensions", message: "pg_cron/pg_net enablement not documented" }],
});
process.exit(ok ? 0 : 1);
