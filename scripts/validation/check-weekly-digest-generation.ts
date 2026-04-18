// SITA OS — Phase 3 BLOCK gate: weekly digest generation wired end-to-end
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "weekly-digest-generation";
const issues: GateIssue[] = [];

const FN = "supabase/functions/internal-agent-weekly-digest/index.ts";
const PAGE = "src/pages/admin/ai-runtime/WeeklyDigestBoard.tsx";
const ROUTES = "src/routes/AdminRoutes.tsx";
const HUB = "src/pages/admin/ai-runtime/AIRuntimeHome.tsx";

for (const f of [FN, PAGE, ROUTES, HUB]) {
  if (!existsSync(f)) issues.push({ severity: "error", area: "files", message: `missing: ${f}` });
}

if (existsSync(FN)) {
  const src = readFileSync(FN, "utf8");
  for (const tok of [
    "SUPABASE_SERVICE_ROLE_KEY",
    "internal_agent_weekly_digests",
    // Real source aggregation
    "error_patrol_detections",
    "ai_implementation_suggestions",
    "internal_agent_reflections",
    "ai_budget_alerts",
    "internal_agent_consensus_sessions",
    "kc-knowledge-coordinator",
    "period_start",
    "period_end",
  ]) {
    if (!src.includes(tok)) issues.push({ severity: "error", area: "wiring", message: `digest function missing: ${tok}` });
  }
}

if (existsSync(PAGE)) {
  const src = readFileSync(PAGE, "utf8");
  if (!src.includes("internal_agent_weekly_digests")) issues.push({ severity: "error", area: "page", message: "page must read digest table" });
  if (!src.includes("internal-agent-weekly-digest")) issues.push({ severity: "error", area: "page", message: "page must invoke digest function" });
}

if (existsSync(ROUTES) && !readFileSync(ROUTES, "utf8").includes("/admin/ai-runtime/weekly-digest")) {
  issues.push({ severity: "error", area: "route", message: "/admin/ai-runtime/weekly-digest not registered" });
}

if (existsSync(HUB) && !readFileSync(HUB, "utf8").includes('id: "weekly-digest"')) {
  issues.push({ severity: "error", area: "hub", message: "AIRuntimeHome missing weekly-digest module" });
}

// Cron documented
const CRON = "docs/runbooks/pg-cron-schedules.md";
if (existsSync(CRON) && !readFileSync(CRON, "utf8").includes("internal-agent-weekly-digest")) {
  issues.push({ severity: "warning", area: "scheduling", message: "weekly digest cron not documented in pg-cron-schedules.md" });
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues });
process.exit(ok ? 0 : 1);
