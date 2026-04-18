// Phase 8A — BLOCK validator: chaos scheduler uses safe scenario catalogue
import { readFileSync, existsSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "chaos-safe-catalogue";
const issues: GateIssue[] = [];
const FN = "supabase/functions/internal-agent-chaos-scheduler/index.ts";
if (!existsSync(FN)) {
  issues.push({ severity: "error", area: "function", message: "chaos-scheduler missing" });
} else {
  const src = readFileSync(FN, "utf8");
  if (!src.includes("ALLOWED_SCENARIOS")) {
    issues.push({ severity: "error", area: "catalogue", message: "ALLOWED_SCENARIOS allowlist missing" });
  }
  if (!src.includes("scenario_not_in_safe_catalogue")) {
    issues.push({ severity: "error", area: "catalogue", message: "scenario rejection branch missing" });
  }
  if (src.includes("execute_sql") || /\.rpc\(\s*["']execute_/.test(src)) {
    issues.push({ severity: "error", area: "function", message: "chaos-scheduler must not call execute_sql or arbitrary DDL RPCs" });
  }
}
const ok = issues.filter(i => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues });
process.exit(ok ? 0 : 1);
