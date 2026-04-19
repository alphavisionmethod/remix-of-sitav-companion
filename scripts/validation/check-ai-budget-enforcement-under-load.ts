// SITA OS — AI Runtime Truth: Budget enforcement under load gate.
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "ai-budget-enforcement-under-load";
const issues: GateIssue[] = [];

const FN = "supabase/functions/ai-runtime-nightly-verify/index.ts";
if (!existsSync(FN)) {
  issues.push({ severity: "error", area: "edge-function", message: `Missing verifier: ${FN}` });
} else {
  const src = readFileSync(FN, "utf8");
  for (const required of [
    "ai_workforce_budget_classes",
    "ai_budget_alerts",
    "runBudgetEnforcementCheck",
    "ai_usage_ledger",
  ]) {
    if (!src.includes(required)) {
      issues.push({
        severity: "error",
        area: "budget-enforcement",
        message: `Verifier missing required budget component: ${required}`,
      });
    }
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues });
console.log(`${ok ? "✅" : "❌"} ${GATE}: ${issues.length} issue(s)`);
process.exit(ok ? 0 : 1);
