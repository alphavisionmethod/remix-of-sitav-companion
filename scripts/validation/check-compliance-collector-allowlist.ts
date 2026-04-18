#!/usr/bin/env node
/* eslint-disable no-console */
// Phase 9 hardening — compliance collector allowlist must include 10+ entries.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { emitGateReport } from "./_lib/emit-gate-report";

const dir = "supabase/migrations";
const blob = (existsSync(dir) ? readdirSync(dir).filter(f => f.endsWith(".sql")) : [])
  .map(f => readFileSync(`${dir}/${f}`, "utf-8")).join("\n");

const hasTable = /compliance_evidence_collectors/.test(blob);
const matches = blob.match(/INSERT INTO public\.compliance_evidence_collectors[\s\S]*?ON CONFLICT/);
const insertBlock = matches?.[0] ?? "";
const collectorRows = (insertBlock.match(/^\s+\('/gm) ?? []).length;
const hasCron = existsSync("supabase/functions/compliance-evidence-cron/index.ts");
const ok = hasTable && collectorRows >= 10 && hasCron;
console.log(`${ok ? "✅" : "❌"} compliance-collector-allowlist: table=${hasTable} rows=${collectorRows} cron=${hasCron}`);
emitGateReport({
  gate: "compliance-collector-allowlist", ok,
  issues: ok ? [] : [{ severity: "error" as const, area: "compliance", message: "allowlist must contain >=10 collectors and cron must exist" }],
});
process.exit(ok ? 0 : 1);
