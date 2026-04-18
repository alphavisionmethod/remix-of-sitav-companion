import { readFileSync, existsSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";
const GATE = "internal-agent-execute-action";
const issues: GateIssue[] = [];
const FN = "supabase/functions/internal-agent-execute-action/index.ts";
if (!existsSync(FN)) {
  issues.push({ severity: "error", area: "function", message: "edge function missing" });
  emitGateReport({ gate: GATE, ok: false, issues });
  process.exit(1);
}
const src = readFileSync(FN, "utf8");
const required = [
  "evaluate_action_safety_gates",
  "internal_agent_action_intents",
  "internal_agent_actions",
  "ai_action_receipts",
  "ai_workforce_approval_queue",
  "restart_workflow",
  "replay_workflow",
  "clear_stale_lock",
  "rotate_expired_token",
  "disable_unhealthy_connector",
  "trigger_safe_repair_path",
];
for (const t of required) {
  if (!src.includes(t)) issues.push({ severity: "error", area: "wiring", message: `missing token: ${t}` });
}
const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues });
process.exit(ok ? 0 : 1);
