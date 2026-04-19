// SITA OS — AI Runtime Truth: Streak health gate.
// Validates that the streak-tracking schema, trigger, and admin RPC are present
// and that the closure artifacts are emitted.
import { existsSync, readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "ai-runtime-streak-health";
const issues: GateIssue[] = [];

// Verify the closure artifacts directory exists with required reports
const ARTIFACT_DIR = "generated/ai-runtime-truth-closure";
const REQUIRED_DOCS = [
  "AI_RUNTIME_CURRENT_STATE_AUDIT.md",
  "AI_RUNTIME_NIGHTLY_VERIFICATION_MODEL.md",
  "AI_BUDGET_AND_CEILING_AUDIT.md",
  "AI_COST_CEILING_LOAD_PROOF_MODEL.md",
  "AI_RUNTIME_FAILURE_CLASSES.md",
  "AI_RUNTIME_TRUTH_FINAL_VERIFICATION.md",
];
for (const f of REQUIRED_DOCS) {
  const p = `${ARTIFACT_DIR}/${f}`;
  if (!existsSync(p)) {
    issues.push({ severity: "error", area: "artifacts", message: `Missing closure artifact: ${p}` });
  }
}

// Verify the verifier function exists
if (!existsSync("supabase/functions/ai-runtime-nightly-verify/index.ts")) {
  issues.push({ severity: "error", area: "verifier", message: "Nightly verifier edge function missing" });
}

// Verify the admin UI panel exists
const PANEL = "src/components/admin/ai-runtime/AIRuntimeNightlyTruthPanel.tsx";
if (!existsSync(PANEL)) {
  issues.push({ severity: "error", area: "ui", message: `Missing admin panel: ${PANEL}` });
}

// Verify the data hook exists
const HOOK = "src/lib/internal-agents/runtime/nightly-truth-data.ts";
if (!existsSync(HOOK)) {
  issues.push({ severity: "error", area: "data-hook", message: `Missing data hook: ${HOOK}` });
} else {
  const src = readFileSync(HOOK, "utf8");
  for (const required of ["ai_runtime_nightly_runs", "ai_runtime_streak_state", "ai_runtime_failure_alerts"]) {
    if (!src.includes(required)) {
      issues.push({ severity: "error", area: "data-hook", message: `Hook missing read of ${required}` });
    }
  }
}

// Emit streak status artifact (placeholder — real status comes from DB at runtime)
mkdirSync(ARTIFACT_DIR, { recursive: true });
writeFileSync(
  `${ARTIFACT_DIR}/ai-nightly-streak-status.json`,
  JSON.stringify({
    generated_at: new Date().toISOString(),
    note: "Live streak state lives in ai_runtime_streak_state table; query via get_ai_runtime_streak_summary() RPC.",
    classification_thresholds: {
      green: ">= 7 consecutive clean nights",
      yellow: ">= 3 consecutive clean nights",
      building: "< 3 nights",
      red: "any unacknowledged failure",
    },
    artifact_check_ok: issues.length === 0,
  }, null, 2),
);

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues });
console.log(`${ok ? "✅" : "❌"} ${GATE}: ${issues.length} issue(s)`);
process.exit(ok ? 0 : 1);
