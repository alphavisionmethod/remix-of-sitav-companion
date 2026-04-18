// Phase 3 BLOCK gate: reflection table, indexes, RLS, and RPC must exist
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "internal-agent-reflection-table";
const issues: GateIssue[] = [];
const migDir = "supabase/migrations";

if (!existsSync(migDir)) {
  issues.push({ severity: "error", area: "migrations", message: "migrations directory missing" });
} else {
  const concat = readdirSync(migDir)
    .filter((f) => f.endsWith(".sql"))
    .map((f) => readFileSync(`${migDir}/${f}`, "utf8"))
    .join("\n");

  const required: Array<[string, string]> = [
    ["CREATE TABLE IF NOT EXISTS public.internal_agent_reflections", "table missing"],
    ["intent_id uuid NOT NULL REFERENCES public.internal_agent_action_intents", "intent_id FK missing"],
    ["outcome_quality numeric", "outcome_quality column missing"],
    ["gate_fitness_score numeric", "gate_fitness_score column missing"],
    ["pattern_tags jsonb", "pattern_tags column missing"],
    ["should_repeat boolean", "should_repeat column missing"],
    ["ALTER TABLE public.internal_agent_reflections ENABLE ROW LEVEL SECURITY", "RLS not enabled"],
    ["Admins can read reflections", "admin SELECT policy missing"],
    ["Block direct writes to reflections", "direct-write block policy missing"],
    ["CREATE OR REPLACE FUNCTION public.record_internal_agent_reflection", "record RPC missing"],
    ["CREATE OR REPLACE FUNCTION public.summarize_internal_agent_learning", "summarize RPC missing"],
    ["GRANT EXECUTE ON FUNCTION public.record_internal_agent_reflection", "service-role grant on record RPC missing"],
    ["GRANT EXECUTE ON FUNCTION public.summarize_internal_agent_learning", "grants on summarize RPC missing"],
    ["idx_iar_agent", "agent index missing"],
    ["idx_iar_intent", "intent index missing"],
  ];

  for (const [token, msg] of required) {
    if (!concat.includes(token)) {
      issues.push({ severity: "error", area: "schema", message: `${msg} (token: ${token})` });
    }
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues });
process.exit(ok ? 0 : 1);
