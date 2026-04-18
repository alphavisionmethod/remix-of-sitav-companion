// Phase 8A — BLOCK validator: assurance L3 ceiling enforced
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "assurance-l3-ceiling";
const issues: GateIssue[] = [];
const all = readdirSync("supabase/migrations").filter(f => f.endsWith(".sql"))
  .map(f => readFileSync(join("supabase/migrations", f), "utf8")).join("\n");

if (!all.includes("clamp_assurance_action_autonomy")) {
  issues.push({ severity: "error", area: "rpc", message: "clamp_assurance_action_autonomy RPC missing" });
}
if (!all.match(/LEAST\(GREATEST\(COALESCE\(p_requested_level,\s*0\),\s*0\),\s*3\)/)) {
  issues.push({ severity: "error", area: "rpc", message: "clamp_assurance_action_autonomy not capped at 3" });
}
if (!all.includes("applied_autonomy    INTEGER NOT NULL DEFAULT 0 CHECK (applied_autonomy BETWEEN 0 AND 3)")) {
  issues.push({ severity: "error", area: "schema", message: "auto_rollback_events.applied_autonomy missing 0..3 CHECK" });
}

const fn = "supabase/functions/internal-agent-canary-runner/index.ts";
if (!existsSync(fn)) {
  issues.push({ severity: "error", area: "function", message: "canary-runner missing" });
} else {
  const src = readFileSync(fn, "utf8");
  if (!src.includes("clamp_assurance_action_autonomy")) {
    issues.push({ severity: "error", area: "function", message: "canary-runner does not call clamp_assurance_action_autonomy on rollback" });
  }
}

const ok = issues.filter(i => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues });
process.exit(ok ? 0 : 1);
