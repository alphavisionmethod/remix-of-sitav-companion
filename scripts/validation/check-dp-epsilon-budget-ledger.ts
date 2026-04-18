#!/usr/bin/env node
/* eslint-disable no-console */
// Phase 9 hardening — rolling DP epsilon budget ledger must be enforced.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { emitGateReport } from "./_lib/emit-gate-report";

const dir = "supabase/migrations";
const blob = (existsSync(dir) ? readdirSync(dir).filter(f => f.endsWith(".sql")) : [])
  .map(f => readFileSync(`${dir}/${f}`, "utf-8")).join("\n");

const hasTable = /tenant_dp_epsilon_ledger/.test(blob);
const hasFn = /CREATE OR REPLACE FUNCTION public\.record_dp_epsilon_spend/.test(blob);
const hasGuard = /epsilon budget exceeded/.test(blob);
const ok = hasTable && hasFn && hasGuard;
console.log(`${ok ? "✅" : "❌"} dp-epsilon-budget-ledger: table=${hasTable} fn=${hasFn} guard=${hasGuard}`);
emitGateReport({
  gate: "dp-epsilon-budget-ledger", ok,
  issues: ok ? [] : [{ severity: "error" as const, area: "privacy", message: "rolling epsilon budget not enforced" }],
});
process.exit(ok ? 0 : 1);
