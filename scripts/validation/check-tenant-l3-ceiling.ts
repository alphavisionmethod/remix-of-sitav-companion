// Phase 7 — BLOCK validator: tenant-facing autonomy is hard-clamped to L3
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "tenant-l3-ceiling";
const issues: GateIssue[] = [];
const all = readdirSync("supabase/migrations").filter(f => f.endsWith(".sql"))
  .map(f => readFileSync(join("supabase/migrations", f), "utf8")).join("\n");

if (!all.includes("clamp_tenant_action_autonomy")) {
  issues.push({ severity: "error", area: "rpc", message: "clamp_tenant_action_autonomy RPC missing" });
}
if (!all.match(/LEAST\(GREATEST\(COALESCE\(p_requested_level,\s*0\),\s*0\),\s*3\)/)) {
  issues.push({ severity: "error", area: "rpc", message: "clamp_tenant_action_autonomy not capped at 3" });
}
if (!all.includes("trust_rung      INTEGER NOT NULL DEFAULT 0 CHECK (trust_rung BETWEEN 0 AND 3)")) {
  issues.push({ severity: "error", area: "schema", message: "internal_agent_tenant_scopes.trust_rung missing 0..3 CHECK" });
}

const fed = "supabase/functions/internal-agent-tenant-federation/index.ts";
if (!existsSync(fed)) {
  issues.push({ severity: "error", area: "function", message: "tenant federation function missing" });
} else {
  const src = readFileSync(fed, "utf8");
  if (!src.includes("clamp_tenant_action_autonomy")) {
    issues.push({ severity: "error", area: "function", message: "set_scope path does not call clamp_tenant_action_autonomy" });
  }
}

const ok = issues.filter(i => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues });
process.exit(ok ? 0 : 1);
