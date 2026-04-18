// Phase 7 — BLOCK validator: all 9 phase-7 tables exist in a migration
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "internal-agent-phase7-tables";
const required = [
  "internal_agent_slo_snapshots",
  "internal_agent_anomaly_signals",
  "internal_agent_drift_findings",
  "internal_agent_canary_runs",
  "owner_copilot_briefings",
  "owner_copilot_handoffs",
  "internal_agent_tenant_scopes",
  "internal_agent_tenant_quotas",
  "internal_agent_tenant_kill_switches",
];
const issues: GateIssue[] = [];
const all = readdirSync("supabase/migrations").filter(f => f.endsWith(".sql"))
  .map(f => readFileSync(join("supabase/migrations", f), "utf8")).join("\n");
for (const t of required) {
  if (!all.includes(`public.${t}`)) issues.push({ severity: "error", area: t, message: `table ${t} not created` });
  if (!new RegExp(`ALTER TABLE public\\.${t} ENABLE ROW LEVEL SECURITY`).test(all)) {
    issues.push({ severity: "error", area: t, message: `RLS not enabled for ${t}` });
  }
}
const ok = issues.filter(i => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues });
process.exit(ok ? 0 : 1);
