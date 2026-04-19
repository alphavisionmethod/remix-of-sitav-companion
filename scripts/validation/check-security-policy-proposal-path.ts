// AI Workforce Phase 4 — BLOCK gate
// Asserts security policy gaps route through Phase 3 propose_implementation_suggestion
// and never via direct DDL in any security edge function.
import { readFileSync, existsSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "security-policy-proposal-path";
const issues: GateIssue[] = [];

const TICK = "supabase/functions/security-council-tick/index.ts";
if (!existsSync(TICK)) {
  issues.push({ severity: "error", area: "function", message: `Missing ${TICK}` });
} else {
  const src = readFileSync(TICK, "utf-8");
  if (!src.includes("propose_implementation_suggestion")) {
    issues.push({
      severity: "error",
      area: "routing",
      message: "tick must route policy findings via propose_implementation_suggestion (Phase 3 RPC)",
    });
  }
  // Ban direct DDL execution
  if (/execute\s+sql/i.test(src) || /\.rpc\(\s*["']execute_sql/.test(src)) {
    issues.push({
      severity: "error",
      area: "auto-apply",
      message: "tick must NOT execute raw SQL or call execute_sql",
    });
  }
  if (/CREATE\s+POLICY|ALTER\s+TABLE/i.test(src)) {
    issues.push({
      severity: "error",
      area: "auto-apply",
      message: "tick must NOT contain DDL statements (CREATE POLICY / ALTER TABLE)",
    });
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues });
console.log(`${ok ? "✅" : "❌"} ${GATE}: ${issues.filter((i) => i.severity === "error").length} errors`);
process.exit(ok ? 0 : 1);
