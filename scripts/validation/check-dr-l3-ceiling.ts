#!/usr/bin/env node
/* eslint-disable no-console */
// Verifies DR-related code never exceeds L3 (region_failover_events trigger + clamp fn).
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { emitGateReport } from "./_lib/emit-gate-report";

const dir = "supabase/migrations";
const blob = (existsSync(dir) ? readdirSync(dir).filter(f => f.endsWith(".sql")) : [])
  .map(f => readFileSync(`${dir}/${f}`, "utf-8")).join("\n");

const hasClamp = blob.includes("clamp_dr_action_autonomy");
const hasTrigger = blob.includes("enforce_dr_l3_ceiling") && blob.includes("trg_dr_l3_ceiling");
const ok = hasClamp && hasTrigger;
console.log(`${ok ? "✅" : "❌"} dr-l3-ceiling: clamp=${hasClamp} trigger=${hasTrigger}`);
emitGateReport({
  gate: "dr-l3-ceiling", ok,
  issues: ok ? [] : [
    !hasClamp && { severity: "error" as const, area: "dr", message: "clamp_dr_action_autonomy missing" },
    !hasTrigger && { severity: "error" as const, area: "dr", message: "enforce_dr_l3_ceiling trigger missing" },
  ].filter(Boolean) as Array<{ severity: "error"; area: string; message: string }>,
});
process.exit(ok ? 0 : 1);
