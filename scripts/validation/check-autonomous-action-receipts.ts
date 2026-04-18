// SITA OS — Autonomous Action Receipts (Phase 2 BLOCK gate)
// Static guard: every code path that executes a whitelisted action class
// must persist into ai_action_receipts (single canonical receipt ledger).
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "autonomous-action-receipts";
const issues: GateIssue[] = [];
const FN = "supabase/functions/internal-agent-execute-action/index.ts";

if (!existsSync(FN)) {
  issues.push({ severity: "error", area: "function", message: "executor missing — cannot verify receipt coverage" });
  emitGateReport({ gate: GATE, ok: false, issues });
  process.exit(1);
}
const src = readFileSync(FN, "utf8");

if (!src.includes("ai_action_receipts")) {
  issues.push({ severity: "error", area: "receipts", message: "executor must insert into ai_action_receipts" });
}
if (!src.includes("internal_agent_actions")) {
  issues.push({ severity: "error", area: "receipts", message: "executor must persist internal_agent_actions row" });
}
// Receipt must come AFTER successful execution — look for a status update path
if (!/status\s*[:=]\s*['"]executed['"]/.test(src) && !src.includes("'executed'") && !src.includes('"executed"')) {
  issues.push({ severity: "error", area: "lifecycle", message: "executor must mark intent status as executed after handler success" });
}
// No second action ledger: forbid usage of advisor_action_queue / advisor_board_actions for internal-agent flow
if (src.includes("advisor_action_queue") || src.includes("advisor_board_actions")) {
  issues.push({ severity: "error", area: "duplication", message: "executor must NOT use advisor_* tables — internal agents use internal_agent_actions only" });
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues });
process.exit(ok ? 0 : 1);
