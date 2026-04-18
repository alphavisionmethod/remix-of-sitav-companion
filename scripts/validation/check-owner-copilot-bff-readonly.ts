// Phase 7 — BLOCK validator: owner-copilot BFF only writes via the SECURITY DEFINER RPC
import { readFileSync, existsSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "owner-copilot-bff-readonly";
const issues: GateIssue[] = [];
const FN = "supabase/functions/owner-copilot-bff/index.ts";
if (!existsSync(FN)) {
  issues.push({ severity: "error", area: "function", message: "owner-copilot-bff missing" });
} else {
  const src = readFileSync(FN, "utf8");
  if (!src.includes("record_owner_copilot_handoff")) {
    issues.push({ severity: "error", area: "function", message: "BFF does not route handoffs through record_owner_copilot_handoff RPC" });
  }
  // Forbid direct writes to owner_copilot_briefings or owner_copilot_handoffs.
  if (/\.from\(\s*["']owner_copilot_briefings["']\s*\)\.(insert|update|upsert|delete)/.test(src) ||
      /\.from\(\s*["']owner_copilot_handoffs["']\s*\)\.(insert|update|upsert|delete)/.test(src)) {
    issues.push({ severity: "error", area: "function", message: "BFF performs a direct write — must use the RPC" });
  }
}
const ok = issues.filter(i => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues });
process.exit(ok ? 0 : 1);
