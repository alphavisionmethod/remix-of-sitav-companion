// SITA OS — Autonomous Action Rollback Coverage (Phase 2 BLOCK gate)
// Static guard: the whitelist seed must define a reverse_action_class for
// every reversible class, and the executor must populate rollback_plan
// before execution for those classes.
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "autonomous-action-rollback-coverage";
const issues: GateIssue[] = [];

const MIG_DIR = "supabase/migrations";
let allSql = "";
for (const f of readdirSync(MIG_DIR).sort()) {
  if (f.endsWith(".sql")) allSql += readFileSync(join(MIG_DIR, f), "utf8") + "\n";
}

if (!allSql.includes("internal_agent_action_whitelist")) {
  issues.push({ severity: "error", area: "schema", message: "internal_agent_action_whitelist table missing in migrations" });
  emitGateReport({ gate: GATE, ok: false, issues });
  process.exit(1);
}

const reversibleClasses = [
  { cls: "disable_unhealthy_connector", reverse: "enable_connector" },
  { cls: "clear_stale_lock", reverse: "cancel_workflow_run" },
];
for (const r of reversibleClasses) {
  if (!allSql.includes(r.cls)) {
    issues.push({ severity: "error", area: "seed", message: `whitelist missing seed for reversible class ${r.cls}` });
  }
  if (!allSql.includes(r.reverse)) {
    issues.push({ severity: "error", area: "seed", message: `whitelist missing reverse_action_class ${r.reverse} for ${r.cls}` });
  }
}

const FN = "supabase/functions/internal-agent-execute-action/index.ts";
if (!existsSync(FN)) {
  issues.push({ severity: "error", area: "function", message: "executor missing" });
} else {
  const src = readFileSync(FN, "utf8");
  if (!src.includes("rollback_plan")) {
    issues.push({ severity: "error", area: "executor", message: "executor must persist rollback_plan into intent row before handler runs" });
  }
  if (!src.includes("reverse_action_class")) {
    issues.push({ severity: "error", area: "executor", message: "executor must reference reverse_action_class from gate result" });
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues, extra: { reversibleClasses: reversibleClasses.length } });
process.exit(ok ? 0 : 1);
