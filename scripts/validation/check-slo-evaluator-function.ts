// Phase 7 — BLOCK validator: SLO evaluator writes snapshots and emits anomaly signals
import { readFileSync, existsSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "slo-evaluator-function";
const issues: GateIssue[] = [];
const FN = "supabase/functions/internal-agent-slo-evaluator/index.ts";
if (!existsSync(FN)) {
  issues.push({ severity: "error", area: "function", message: "slo-evaluator function missing" });
} else {
  const src = readFileSync(FN, "utf8");
  if (!src.includes("internal_agent_slo_snapshots")) issues.push({ severity: "error", area: "snapshots", message: "evaluator does not insert SLO snapshots" });
  if (!src.includes("internal_agent_anomaly_signals")) issues.push({ severity: "error", area: "anomalies", message: "evaluator does not raise anomaly signals" });
  if (!src.includes("p95_latency_ms")) issues.push({ severity: "error", area: "metrics", message: "evaluator missing p95 latency calculation" });
}
const ok = issues.filter(i => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues });
process.exit(ok ? 0 : 1);
