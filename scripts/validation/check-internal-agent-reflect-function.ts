// Phase 3 BLOCK gate: internal-agent-reflect edge function is wired correctly
import { readFileSync, existsSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "internal-agent-reflect-function";
const issues: GateIssue[] = [];
const FN = "supabase/functions/internal-agent-reflect/index.ts";

if (!existsSync(FN)) {
  issues.push({ severity: "error", area: "function", message: "edge function missing" });
} else {
  const src = readFileSync(FN, "utf8");

  const required: Array<[string, string]> = [
    ["SUPABASE_SERVICE_ROLE_KEY", "must use service-role key"],
    ["internal_agent_action_intents", "must read intents table"],
    ["internal_agent_reflections", "must check existing reflections to stay idempotent"],
    ["record_internal_agent_reflection", "must persist via canonical RPC (no direct INSERT)"],
    ["computeGateFitness", "gate fitness scoring missing"],
    ["detectPatterns", "pattern detection missing"],
    ["scoreOutcome", "outcome scoring missing"],
    ["lookback_hours", "lookback window param missing"],
  ];

  for (const [token, msg] of required) {
    if (!src.includes(token)) {
      issues.push({ severity: "error", area: "wiring", message: `${msg} (token: ${token})` });
    }
  }

  // The function MUST NOT bypass the RPC and write directly to the table
  if (/from\(['"]internal_agent_reflections['"]\)\s*\.\s*(insert|update|upsert|delete)/.test(src)) {
    issues.push({ severity: "error", area: "safety", message: "direct write to reflections table detected — must use record_internal_agent_reflection RPC" });
  }
  // The function MUST NOT mutate intent rows
  if (/from\(['"]internal_agent_action_intents['"]\)\s*\.\s*(update|delete|insert|upsert)/.test(src)) {
    issues.push({ severity: "error", area: "safety", message: "reflection function must be read-only on intents table" });
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues });
process.exit(ok ? 0 : 1);
