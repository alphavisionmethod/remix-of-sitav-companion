// SITA OS — AI Runtime Truth: Fallback path verification gate.
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "ai-fallback-verification";
const issues: GateIssue[] = [];

const FN = "supabase/functions/ai-runtime-nightly-verify/index.ts";
if (!existsSync(FN)) {
  issues.push({ severity: "error", area: "edge-function", message: `Missing verifier: ${FN}` });
} else {
  const src = readFileSync(FN, "utf8");
  if (!src.includes("ai_fallback_events")) {
    issues.push({
      severity: "error",
      area: "fallback-path",
      message: "Verifier does not exercise ai_fallback_events table",
    });
  }
  if (!src.includes("runFallbackCheck")) {
    issues.push({
      severity: "error",
      area: "fallback-check",
      message: "Verifier missing fallback sub-check",
    });
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues });
console.log(`${ok ? "✅" : "❌"} ${GATE}: ${issues.length} issue(s)`);
process.exit(ok ? 0 : 1);
