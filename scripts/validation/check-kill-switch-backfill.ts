// Phase 2 BLOCK gate: master kill-switch backfill is present in migrations
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "kill-switch-backfill";
const issues: GateIssue[] = [];
const migDir = "supabase/migrations";

if (!existsSync(migDir)) {
  issues.push({ severity: "error", area: "migrations", message: "migrations directory missing" });
} else {
  const concat = readdirSync(migDir)
    .filter((f) => f.endsWith(".sql"))
    .map((f) => readFileSync(`${migDir}/${f}`, "utf8"))
    .join("\n");

  const required: Array<[string, string]> = [
    ["seed_master_internal_agent_kill_switch", "seeder function missing"],
    ["KS-INTERNAL-AGENTS-EXECUTE", "kill-switch ID never declared"],
    ["FROM public.user_roles", "admin backfill loop missing"],
    ["list_stale_locked_workflow_runs", "incident-response helper RPC missing"],
    ["list_unhealthy_connector_accounts", "spend-control helper RPC missing"],
    ["list_unescalated_security_events", "security-monitor helper RPC missing"],
    ["GRANT EXECUTE", "service-role grants missing on bridge helpers"],
  ];

  for (const [token, msg] of required) {
    if (!concat.includes(token)) {
      issues.push({ severity: "error", area: "backfill", message: `${msg} (token: ${token})` });
    }
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues });
process.exit(ok ? 0 : 1);
