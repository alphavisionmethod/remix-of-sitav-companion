// AI Workforce Phase 4 — BLOCK gate
// Asserts security-anomaly-rotation-trigger only invokes secret-rotation-orchestrator
// with dryRun: true and rejects low-severity signals.
import { readFileSync, existsSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "anomaly-driven-secret-rotation";
const issues: GateIssue[] = [];

const FN = "supabase/functions/security-anomaly-rotation-trigger/index.ts";
if (!existsSync(FN)) {
  issues.push({ severity: "error", area: "function", message: `Missing ${FN}` });
} else {
  const src = readFileSync(FN, "utf-8");
  if (!src.includes("secret-rotation-orchestrator")) {
    issues.push({
      severity: "error",
      area: "orchestrator",
      message: "trigger must call existing secret-rotation-orchestrator (no separate rotation path)",
    });
  }
  if (!/dryRun:\s*true/.test(src)) {
    issues.push({
      severity: "error",
      area: "guardrail",
      message: "trigger must pass dryRun: true to orchestrator (live rotation forbidden in this path)",
    });
  }
  if (/dryRun:\s*false/.test(src)) {
    issues.push({
      severity: "error",
      area: "guardrail",
      message: "trigger must NEVER pass dryRun: false",
    });
  }
  if (!src.includes("trigger_anomaly_secret_rotation")) {
    issues.push({
      severity: "error",
      area: "rpc",
      message: "trigger must persist via trigger_anomaly_secret_rotation RPC",
    });
  }
  if (!/severity_too_low|severity\s*===\s*["']low["']/.test(src)) {
    issues.push({
      severity: "warning",
      area: "noise",
      message: "trigger should reject low-severity anomalies to avoid noise",
    });
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues });
console.log(`${ok ? "✅" : "❌"} ${GATE}: ${issues.filter((i) => i.severity === "error").length} errors`);
process.exit(ok ? 0 : 1);
