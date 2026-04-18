// Phase 8 — BLOCK validator: all 9 phase-8 tables exist with RLS
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "internal-agent-phase8-tables";
const required = [
  "internal_agent_chaos_drills",
  "internal_agent_assurance_reports",
  "internal_agent_auto_rollback_events",
  "external_workforce_api_keys",
  "external_workforce_subscriptions",
  "external_workforce_webhook_deliveries",
  "tenant_federation_optins",
  "federated_knowledge_shares",
  "federated_pattern_aggregates",
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
