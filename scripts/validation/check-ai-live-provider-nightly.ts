// SITA OS — AI Runtime Truth: Live-Provider Nightly Verification gate.
// Verifies the nightly verifier edge function exists and is wired into cron docs.
// Behavioral truth (run freshness) is checked via check-ai-runtime-streak-health.ts
// once the cron has fired in production.
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "ai-live-provider-nightly";
const issues: GateIssue[] = [];

const FN = "supabase/functions/ai-runtime-nightly-verify/index.ts";
if (!existsSync(FN)) {
  issues.push({ severity: "error", area: "edge-function", message: `Missing nightly verifier: ${FN}` });
} else {
  const src = readFileSync(FN, "utf8");
  for (const required of [
    "ai.gateway.lovable.dev",
    "ai_runtime_nightly_runs",
    "ai_invocations",
    "ai_usage_ledger",
    "ai_inference_receipts",
    "ai_fallback_events",
    "live_provider_call",
    "receipt_persistence",
    "ledger_write",
    "fallback_path",
    "budget_enforcement",
  ]) {
    if (!src.includes(required)) {
      issues.push({
        severity: "error",
        area: "edge-function",
        message: `Verifier missing required component: ${required}`,
      });
    }
  }
}

const cronDoc = "docs/runbooks/pg-cron-schedules.md";
if (existsSync(cronDoc)) {
  const doc = readFileSync(cronDoc, "utf8");
  if (!doc.includes("ai-runtime-nightly-verify")) {
    issues.push({
      severity: "error",
      area: "cron-doc",
      message: "pg-cron-schedules.md does not document the ai-runtime-nightly-verify schedule",
    });
  }
} else {
  issues.push({ severity: "error", area: "cron-doc", message: "pg-cron-schedules.md missing" });
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues });
console.log(`${ok ? "✅" : "❌"} ${GATE}: ${issues.length} issue(s)`);
process.exit(ok ? 0 : 1);
