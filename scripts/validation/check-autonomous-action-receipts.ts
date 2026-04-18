// Static check: every executed intent must have receipt_id (enforced at runtime by edge function)
import { readFileSync, existsSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";
const GATE = "autonomous-action-receipts";
const issues: GateIssue[] = [];
const FN = "supabase/functions/internal-agent-execute-action/index.ts";
if (!existsSync(FN)) {
  issues.push({ severity: "error", area: "function", message: "edge function missing" });
} else {
  const src = readFileSync(FN, "utf8");
  if (!src.includes("ai_action_receipts")) issues.push({ severity: "error", area: "receipts", message: "function does not write to ai_action_receipts" });
  if (!src.match(/receipt_id:\s*receiptRow/)) issues.push({ severity: "error", area: "receipts", message: "intent not updated with receipt_id" });
}
const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues });
process.exit(ok ? 0 : 1);
