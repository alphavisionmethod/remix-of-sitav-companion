// AI Workforce Phase 4 — BLOCK gate
// Asserts security-kill-switch-recommender NEVER arms switches directly.
// It must only call propose_kill_switch_recommendation; arming requires
// existing kill_switch_approvals dual-admin workflow.
import { readFileSync, existsSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "kill-switch-recommendation-flow";
const issues: GateIssue[] = [];

const FN = "supabase/functions/security-kill-switch-recommender/index.ts";
if (!existsSync(FN)) {
  issues.push({ severity: "error", area: "function", message: `Missing ${FN}` });
} else {
  const src = readFileSync(FN, "utf-8");
  if (!src.includes("propose_kill_switch_recommendation")) {
    issues.push({
      severity: "error",
      area: "rpc",
      message: "recommender must call propose_kill_switch_recommendation",
    });
  }
  // Banned: anything that would actually arm a switch
  const banned = ["arm_kill_switch", "activate_kill_switch", "kill_switch_state", "set_kill_switch_active"];
  for (const b of banned) {
    if (src.includes(b)) {
      issues.push({
        severity: "error",
        area: "guardrail",
        message: `recommender must NOT call ${b} — arming requires admin dual-approval`,
      });
    }
  }
  if (!/arms_kill_switch:\s*false/.test(src)) {
    issues.push({
      severity: "warning",
      area: "response",
      message: "response should explicitly include arms_kill_switch: false for operator clarity",
    });
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues });
console.log(`${ok ? "✅" : "❌"} ${GATE}: ${issues.filter((i) => i.severity === "error").length} errors`);
process.exit(ok ? 0 : 1);
