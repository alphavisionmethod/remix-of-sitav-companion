// AI Workforce Phase 4 — BLOCK gate
// Cross-cutting guardrail: no Phase 4 security edge function may execute DDL,
// arm kill switches, or rotate secrets directly.
import { readFileSync, existsSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "no-direct-security-auto-apply";
const issues: GateIssue[] = [];

const FUNCTIONS = [
  "supabase/functions/security-council-tick/index.ts",
  "supabase/functions/security-kill-switch-recommender/index.ts",
  "supabase/functions/security-anomaly-rotation-trigger/index.ts",
];

const BANNED_PATTERNS: Array<{ rx: RegExp; reason: string }> = [
  { rx: /\.rpc\(\s*["']execute_sql/, reason: "execute_sql RPC call" },
  { rx: /CREATE\s+POLICY/i, reason: "DDL CREATE POLICY" },
  { rx: /DROP\s+POLICY/i, reason: "DDL DROP POLICY" },
  { rx: /ALTER\s+TABLE\s+\w+\s+(ENABLE|DISABLE)\s+ROW/i, reason: "RLS toggle" },
  { rx: /\barm_kill_switch\b/, reason: "direct kill-switch arming" },
  { rx: /\bactivate_kill_switch\b/, reason: "direct kill-switch activation" },
  { rx: /dryRun:\s*false/, reason: "live (non-dryrun) secret rotation" },
];

for (const fn of FUNCTIONS) {
  if (!existsSync(fn)) {
    issues.push({ severity: "error", area: "missing", message: `Missing function ${fn}` });
    continue;
  }
  const src = readFileSync(fn, "utf-8");
  for (const { rx, reason } of BANNED_PATTERNS) {
    if (rx.test(src)) {
      issues.push({ severity: "error", area: "auto-apply", message: `${fn}: contains ${reason}` });
    }
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues });
console.log(`${ok ? "✅" : "❌"} ${GATE}: ${issues.filter((i) => i.severity === "error").length} errors`);
process.exit(ok ? 0 : 1);
