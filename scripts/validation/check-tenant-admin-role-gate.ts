#!/usr/bin/env node
/* eslint-disable no-console */
// Phase 9 hardening — Tenant Self-Service Console must check is_tenant_admin.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { emitGateReport } from "./_lib/emit-gate-report";

const dir = "supabase/migrations";
const blob = (existsSync(dir) ? readdirSync(dir).filter(f => f.endsWith(".sql")) : [])
  .map(f => readFileSync(`${dir}/${f}`, "utf-8")).join("\n");

const hasFn = /CREATE OR REPLACE FUNCTION public\.is_tenant_admin/.test(blob);
const hasTable = /CREATE TABLE IF NOT EXISTS public\.tenant_roles/.test(blob);
const hasKsRls = /tenants manage their own kill switches/.test(blob);
const ok = hasFn && hasTable && hasKsRls;
console.log(`${ok ? "✅" : "❌"} tenant-admin-role-gate: fn=${hasFn} table=${hasTable} ks_rls=${hasKsRls}`);
emitGateReport({
  gate: "tenant-admin-role-gate", ok,
  issues: ok ? [] : [{ severity: "error" as const, area: "tenant-rbac", message: "tenant admin role gate incomplete" }],
});
process.exit(ok ? 0 : 1);
