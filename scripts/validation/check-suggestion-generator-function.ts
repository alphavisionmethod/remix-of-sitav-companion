// SITA OS — Phase 3 BLOCK gate: suggestion generator function reads real signals
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "suggestion-generator-function";
const issues: GateIssue[] = [];
const FN = "supabase/functions/internal-agent-suggestion-generator/index.ts";

if (!existsSync(FN)) {
  issues.push({ severity: "error", area: "function", message: "edge function missing" });
} else {
  const src = readFileSync(FN, "utf8");
  for (const tok of [
    "SUPABASE_SERVICE_ROLE_KEY",
    "propose_implementation_suggestion",
    // Real signal sources (ALL must be wired)
    "error_patrol_detections",
    "internal_agent_reflections",
    "ai_budget_alerts",
    "internal_agent_consensus_sessions",
    "internal_agent_policy_drafts",
    // Idempotency on signal_ref
    "source_signal_ref",
  ]) {
    if (!src.includes(tok)) {
      issues.push({ severity: "error", area: "wiring", message: `generator missing token: ${tok}` });
    }
  }
  // Refuse fake content
  if (/(fake|sample|seed|hardcoded).{0,30}suggestion/i.test(src)) {
    issues.push({ severity: "error", area: "fake-content", message: "generator appears to contain fake/sample/seed suggestions" });
  }
  // Must not use anon-key client
  if (/SUPABASE_ANON_KEY|VITE_SUPABASE_PUBLISHABLE/.test(src)) {
    issues.push({ severity: "error", area: "auth", message: "generator must use service-role only" });
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues });
process.exit(ok ? 0 : 1);
