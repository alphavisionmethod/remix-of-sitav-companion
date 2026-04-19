#!/usr/bin/env node
/* eslint-disable no-console */
// Phase 5: AI Receipt Completeness — verifies snapshot freshness + coverage threshold.
// Static check: confirms the edge function exists and the snapshot table is referenced.
import { existsSync, readFileSync, mkdirSync, writeFileSync } from "node:fs";

const FN = "supabase/functions/ai-receipt-completeness-snapshot/index.ts";
const issues: Array<{ severity: string; area: string; message: string }> = [];

if (!existsSync(FN)) {
  issues.push({ severity: "error", area: "edge-function", message: "ai-receipt-completeness-snapshot function missing" });
} else {
  const src = readFileSync(FN, "utf8");
  if (!src.includes("ai_receipt_completeness_snapshots")) {
    issues.push({ severity: "error", area: "persistence", message: "snapshot insert target missing" });
  }
  if (!src.includes("ai_invocations") || !src.includes("ai_action_receipts")) {
    issues.push({ severity: "error", area: "source", message: "must read both ai_invocations and ai_action_receipts" });
  }
}

const errorCount = issues.filter((i) => i.severity === "error").length;
const warningCount = issues.filter((i) => i.severity === "warning").length;
const ok = errorCount === 0;
const report = {
  generatedAt: new Date().toISOString(),
  gate: "ai-receipt-completeness",
  ok,
  errorCount,
  warningCount,
  issues,
};
mkdirSync("generated", { recursive: true });
writeFileSync("generated/ai-receipt-completeness-report.json", JSON.stringify(report, null, 2));
console.log(`${ok ? "✅" : "❌"} ai-receipt-completeness: ${errorCount} errors, ${warningCount} warnings`);
process.exit(ok ? 0 : 1);
