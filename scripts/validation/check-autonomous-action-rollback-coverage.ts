import { readFileSync, existsSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";
const GATE = "autonomous-action-rollback-coverage";
const issues: GateIssue[] = [];
const FN = "supabase/functions/internal-agent-execute-action/index.ts";
if (!existsSync(FN)) {
  issues.push({ severity: "error", area: "function", message: "edge function missing" });
} else {
  const src = readFileSync(FN, "utf8");
  // Reverse classes must be implemented for every reversible class
  for (const reverse of ["enable_connector", "cancel_workflow_run"]) {
    if (!src.includes(`case "${reverse}"`)) issues.push({ severity: "error", area: "rollback", message: `missing reverse handler: ${reverse}` });
  }
  if (!src.includes("rollback_plan")) issues.push({ severity: "error", area: "rollback", message: "rollback_plan not persisted on intent" });
}
const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues });
process.exit(ok ? 0 : 1);
