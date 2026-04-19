// SITA OS — AI Runtime Truth: Receipt persistence verification gate.
// Asserts that the verifier wires real ai_inference_receipts inserts.
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "ai-receipt-persistence";
const issues: GateIssue[] = [];

const FN = "supabase/functions/ai-runtime-nightly-verify/index.ts";
if (!existsSync(FN)) {
  issues.push({ severity: "error", area: "edge-function", message: `Missing verifier: ${FN}` });
} else {
  const src = readFileSync(FN, "utf8");
  if (!src.includes("ai_inference_receipts") || !src.includes(".insert(")) {
    issues.push({
      severity: "error",
      area: "receipt-write",
      message: "Verifier does not insert into ai_inference_receipts",
    });
  }
  if (!src.includes("runReceiptPersistenceCheck")) {
    issues.push({
      severity: "error",
      area: "receipt-check",
      message: "Verifier missing receipt persistence sub-check",
    });
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues });
console.log(`${ok ? "✅" : "❌"} ${GATE}: ${issues.length} issue(s)`);
process.exit(ok ? 0 : 1);
