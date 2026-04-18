// SITA OS — Internal Agent Execute Action (Phase 2 BLOCK gate)
// Asserts the constrained-action edge function exists, contains the 6
// canonical handlers, calls the safety gate RPC, and references the master
// kill-switch. No stubs allowed.
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "internal-agent-execute-action";
const issues: GateIssue[] = [];
const FN = "supabase/functions/internal-agent-execute-action/index.ts";

if (!existsSync(FN)) {
  issues.push({ severity: "error", area: "function", message: "internal-agent-execute-action edge function missing" });
  emitGateReport({ gate: GATE, ok: false, issues });
  process.exit(1);
}

const src = readFileSync(FN, "utf8");

const requiredHandlers = [
  "restart_workflow",
  "replay_workflow",
  "clear_stale_lock",
  "rotate_expired_token",
  "disable_unhealthy_connector",
  "trigger_safe_repair_path",
];
for (const h of requiredHandlers) {
  if (!src.includes(`"${h}"`) && !src.includes(`'${h}'`)) {
    issues.push({ severity: "error", area: "handlers", message: `missing handler for action class ${h}` });
  }
}

const requiredTokens: Array<{ token: string; reason: string }> = [
  { token: "evaluate_action_safety_gates", reason: "executor must call the canonical 7-gate safety RPC" },
  { token: "internal_agent_action_intents", reason: "executor must persist a pre-execution intent row" },
  { token: "internal_agent_actions", reason: "executor must persist post-execution action receipt" },
  { token: "ai_action_receipts", reason: "executor must emit canonical AI action receipt" },
  { token: "KS-INTERNAL-AGENTS-EXECUTE", reason: "executor must reference master kill-switch" },
];
for (const r of requiredTokens) {
  if (!src.includes(r.token)) {
    issues.push({ severity: "error", area: "wiring", message: `${r.reason} (token: ${r.token})` });
  }
}

if (!src.includes("ai_workforce_approval_queue")) {
  issues.push({ severity: "error", area: "approval", message: "executor must route to existing approval queue when requires_approval=true" });
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues, extra: { handlers: requiredHandlers.length } });
process.exit(ok ? 0 : 1);
