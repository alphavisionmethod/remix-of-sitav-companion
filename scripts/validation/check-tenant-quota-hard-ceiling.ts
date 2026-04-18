#!/usr/bin/env node
/* eslint-disable no-console */
// Tenant quotas must enforce hard_ceiling at the RLS layer.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { emitGateReport } from "./_lib/emit-gate-report";

const dir = "supabase/migrations";
const blob = (existsSync(dir) ? readdirSync(dir).filter(f => f.endsWith(".sql")) : [])
  .map(f => readFileSync(`${dir}/${f}`, "utf-8")).join("\n");

const ok = /tenants update own tq[\s\S]{0,500}quota_value <= hard_ceiling/.test(blob);
console.log(`${ok ? "✅" : "❌"} tenant-quota-hard-ceiling`);
emitGateReport({
  gate: "tenant-quota-hard-ceiling", ok,
  issues: ok ? [] : [{ severity: "error" as const, area: "tenant", message: "RLS does not enforce hard_ceiling" }],
});
process.exit(ok ? 0 : 1);
