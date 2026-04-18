// SITA OS — Internal Agent Runtime Loop (BLOCK gate)
//
// Asserts the canonical edge function exists and references the required
// budget / kill-switch / receipt patterns to keep autonomy safe.
import { readFileSync, existsSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "internal-agent-runtime-loop";
const issues: GateIssue[] = [];

const LOOP = "supabase/functions/internal-agent-loop/index.ts";

if (!existsSync(LOOP)) {
  issues.push({ severity: "error", area: "function", message: "internal-agent-loop edge function missing" });
  emitGateReport({ gate: GATE, ok: false, issues });
  process.exit(1);
}

const src = readFileSync(LOOP, "utf8");

const required: Array<{ token: string; reason: string }> = [
  { token: "checkAIBudget", reason: "Loop must consult shared AI budget guard" },
  { token: "internal_agent_runtime_state", reason: "Loop must update runtime state" },
  { token: "internal_agent_actions", reason: "Loop must persist a per-action receipt row" },
  { token: "ai.gateway.lovable.dev", reason: "Loop must use the canonical AI gateway" },
];

for (const r of required) {
  if (!src.includes(r.token)) {
    issues.push({
      severity: "error",
      area: "loop",
      message: `${r.reason} (missing token: ${r.token})`,
    });
  }
}

// Cooldown / kill-switch evidence — at least one of these guard tokens must appear.
const guards = ["cooldown_until", "is_active", "suspension_reason"];
if (!guards.some((g) => src.includes(g))) {
  issues.push({
    severity: "error",
    area: "guards",
    message: "Loop missing kill-switch / cooldown / suspension guard",
  });
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues });
process.exit(ok ? 0 : 1);
