// SITA OS — AI Runtime Truth: Ledger write verification gate.
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "ai-ledger-write-verification";
const issues: GateIssue[] = [];

const FN = "supabase/functions/ai-runtime-nightly-verify/index.ts";
if (!existsSync(FN)) {
  issues.push({ severity: "error", area: "edge-function", message: `Missing verifier: ${FN}` });
} else {
  const src = readFileSync(FN, "utf8");
  if (!src.includes("ai_usage_ledger")) {
    issues.push({
      severity: "error",
      area: "ledger-write",
      message: "Verifier does not insert into ai_usage_ledger",
    });
  }
  if (!src.includes("runLedgerWriteCheck")) {
    issues.push({
      severity: "error",
      area: "ledger-check",
      message: "Verifier missing ledger write sub-check",
    });
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues });
console.log(`${ok ? "✅" : "❌"} ${GATE}: ${issues.length} issue(s)`);
process.exit(ok ? 0 : 1);
