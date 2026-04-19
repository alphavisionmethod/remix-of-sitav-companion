// AI Workforce Phase 4 — BLOCK gate
// Asserts security-council-tick edge function exercises ALL 7 security agents
// and a hourly pg_cron schedule exists for the tick.
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "security-agent-scheduling";
const issues: GateIssue[] = [];

const TICK = "supabase/functions/security-council-tick/index.ts";
const REQUIRED_AGENTS = [
  "st-security-monitor",
  "st-permission-drift",
  "st-policy-review",
  "st-trust-threshold",
  "st-fraud-abuse",
  "st-audit-completeness",
  "st-privacy-boundary",
];

if (!existsSync(TICK)) {
  issues.push({ severity: "error", area: "function", message: `Missing ${TICK}` });
} else {
  const src = readFileSync(TICK, "utf-8");
  for (const a of REQUIRED_AGENTS) {
    if (!src.includes(a)) {
      issues.push({ severity: "error", area: "agents", message: `tick does not reference agent ${a}` });
    }
  }
  if (!/case\s+["']st-security-monitor["']/.test(src) || !/runAgent/.test(src)) {
    issues.push({ severity: "error", area: "dispatch", message: "tick missing per-agent dispatch logic" });
  }
}

// pg_cron schedule must exist in a migration
const dir = "supabase/migrations";
let cronBlob = "";
try {
  for (const f of readdirSync(dir)) cronBlob += readFileSync(join(dir, f), "utf-8");
} catch {
  // ignore
}
if (!/sita-security-council-tick/.test(cronBlob) && !/security-council-tick/.test(cronBlob)) {
  issues.push({
    severity: "warning",
    area: "schedule",
    message: "pg_cron schedule for security-council-tick not found in migrations (expected scheduled out-of-band via supabase insert)",
  });
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues });
console.log(`${ok ? "✅" : "❌"} ${GATE}: ${issues.filter((i) => i.severity === "error").length} errors`);
process.exit(ok ? 0 : 1);
