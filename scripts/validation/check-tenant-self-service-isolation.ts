#!/usr/bin/env node
/* eslint-disable no-console */
// Tenant self-service: tables must have RLS limiting to auth.uid() = user_id; BFF must exist.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { emitGateReport } from "./_lib/emit-gate-report";

const dir = "supabase/migrations";
const blob = (existsSync(dir) ? readdirSync(dir).filter(f => f.endsWith(".sql")) : [])
  .map(f => readFileSync(`${dir}/${f}`, "utf-8")).join("\n");

const tssa = /tenant_self_service_actions[\s\S]{0,3000}auth\.uid\(\) = user_id/.test(blob);
const tq = /tenant_quotas[\s\S]{0,3000}auth\.uid\(\) = user_id/.test(blob);
const bff = existsSync("supabase/functions/tenant-self-service-bff/index.ts");
const page = existsSync("src/pages/tenant/TenantSelfServiceConsole.tsx");
const ok = tssa && tq && bff && page;
console.log(`${ok ? "✅" : "❌"} tenant-self-service: tssa=${tssa} tq=${tq} bff=${bff} page=${page}`);
emitGateReport({
  gate: "tenant-self-service-isolation", ok,
  issues: ok ? [] : [{ severity: "error" as const, area: "tenant", message: "tenant self-service incomplete or unsafe" }],
});
process.exit(ok ? 0 : 1);
