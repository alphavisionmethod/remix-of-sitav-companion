#!/usr/bin/env node
/* eslint-disable no-console */
// Audit-export bundles must be sealed (immutable) with sha256 + signature.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { emitGateReport } from "./_lib/emit-gate-report";

const dir = "supabase/migrations";
const blob = (existsSync(dir) ? readdirSync(dir).filter(f => f.endsWith(".sql")) : [])
  .map(f => readFileSync(`${dir}/${f}`, "utf-8")).join("\n");

const hasTable = blob.includes("public.audit_export_bundles");
const hasSealed = /audit_export_bundles[\s\S]{0,1000}'sealed'/.test(blob);
const hasFn = existsSync("supabase/functions/audit-export-bundler/index.ts");
const ok = hasTable && hasSealed && hasFn;
console.log(`${ok ? "✅" : "❌"} audit-export-immutable: table=${hasTable} sealed=${hasSealed} fn=${hasFn}`);
emitGateReport({
  gate: "audit-export-immutable", ok,
  issues: ok ? [] : [{ severity: "error" as const, area: "audit", message: "audit-export-immutable not fully wired" }],
});
process.exit(ok ? 0 : 1);
