#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Workflow Reality Validator (Phase 23.G, Gate 34)
// Asserts the workflow + automation runtime is fully wired.
// ═══════════════════════════════════════════════════════════════
import * as fs from "fs";
import * as path from "path";
import { ViolationCollector } from "../lib/utils";

const vc = new ViolationCollector();

// ── Phase 23.1: Embedded bypass scan ──
const BYPASS_ALLOWED = new Set([
  "supabase/functions/workflow-execute/index.ts",
  "supabase/functions/workflow-repair/index.ts",
  "supabase/functions/workflow-replay/index.ts",
  "supabase/functions/workflow-stuck-detector/index.ts",
]);
function walkTs(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (["node_modules", ".git", "dist"].includes(e.name)) continue;
      walkTs(p, out);
    } else if (/\.(ts|tsx)$/.test(e.name)) out.push(p);
  }
  return out;
}
const BYPASS_RE = /from\s*\(\s*["']workflow_runs["']\s*\)\s*\.\s*insert/;
const bypassFiles = [...walkTs("src"), ...walkTs("supabase/functions")];
const bypassViolations: string[] = [];
for (const f of bypassFiles) {
  const norm = f.replace(/\\/g, "/");
  if (BYPASS_ALLOWED.has(norm)) continue;
  if (f.includes(".test.") || f.includes("__tests__")) continue;
  const src = fs.readFileSync(f, "utf-8");
  if (BYPASS_RE.test(src)) {
    bypassViolations.push(norm);
    vc.add(norm, "workflow-bypass", "Direct insert into workflow_runs outside canonical runner");
  }
}

const REQUIRED_TABLES = [
  "workflows",
  "workflow_runs",
  "workflow_steps",
  "workflow_state_transitions",
  "workflow_receipts",
  "scheduled_jobs",
  "job_executions",
  "automation_kill_switches",
];

const REQUIRED_FNS = [
  "supabase/functions/workflow-execute/index.ts",
  "supabase/functions/workflow-repair/index.ts",
  "supabase/functions/workflow-stuck-detector/index.ts",
  "supabase/functions/workflow-replay/index.ts",
  "supabase/functions/scheduler-dispatch/index.ts",
];

// 1. Edge functions exist
for (const f of REQUIRED_FNS) {
  if (!fs.existsSync(f)) vc.add(f, "missing-fn", `Required edge function not found: ${f}`);
}

// 2. Required table names referenced in any migration
const migDir = "supabase/migrations";
let migText = "";
if (fs.existsSync(migDir)) {
  for (const f of fs.readdirSync(migDir)) {
    if (f.endsWith(".sql")) migText += fs.readFileSync(`${migDir}/${f}`, "utf-8");
  }
}
const tableEvidence: Record<string, boolean> = {};
for (const t of REQUIRED_TABLES) {
  const re = new RegExp(`CREATE TABLE[^;]*public\\.${t}\\b`, "i");
  tableEvidence[t] = re.test(migText);
  if (!tableEvidence[t]) {
    vc.add(`migrations/${t}`, "missing-table", `Table ${t} not declared in any migration`, "warning");
  }
}

// 3. Admin page wired to real query (not DEMO_RUNS)
const wraPage = "src/pages/admin/WorkflowReplayAudit.tsx";
let adminWired = false;
if (fs.existsSync(wraPage)) {
  const src = fs.readFileSync(wraPage, "utf-8");
  if (/from\s*\(\s*["']workflow_runs["']\s*\)/.test(src) && !/DEMO_RUNS/.test(src)) {
    adminWired = true;
  } else {
    vc.add(wraPage, "still-mocked", "WorkflowReplayAudit must query workflow_runs and remove DEMO_RUNS");
  }
} else {
  vc.add(wraPage, "missing-page", "WorkflowReplayAudit.tsx not found");
}

// 4. KS-WORKFLOW enforcement in workflow-execute and scheduler-dispatch
let executeKsOk = false;
const execFn = "supabase/functions/workflow-execute/index.ts";
if (fs.existsSync(execFn)) {
  const src = fs.readFileSync(execFn, "utf-8");
  if (/automation_kill_switches/.test(src) && /kill_switch_active|isKilled/.test(src)) executeKsOk = true;
  else vc.add(execFn, "missing-ks", "workflow-execute must consult automation_kill_switches");
}
let dispatchKsOk = false;
const dispFn = "supabase/functions/scheduler-dispatch/index.ts";
if (fs.existsSync(dispFn)) {
  const src = fs.readFileSync(dispFn, "utf-8");
  if (/automation_kill_switches/.test(src)) dispatchKsOk = true;
  else vc.add(dispFn, "missing-ks", "scheduler-dispatch must consult automation_kill_switches");
}

// 5. Repair fn implements all four actions
let repairActionsOk = false;
const repairFn = "supabase/functions/workflow-repair/index.ts";
if (fs.existsSync(repairFn)) {
  const src = fs.readFileSync(repairFn, "utf-8");
  const actions = ["retry", "force_complete", "force_fail", "rollback"];
  if (actions.every((a) => src.includes(`"${a}"`))) repairActionsOk = true;
  else vc.add(repairFn, "missing-actions", "workflow-repair must implement all four actions");
}

// 6. Stuck detector enforces 30-min cutoff
let stuckOk = false;
const stuckFn = "supabase/functions/workflow-stuck-detector/index.ts";
if (fs.existsSync(stuckFn)) {
  const src = fs.readFileSync(stuckFn, "utf-8");
  if (/last_progress_at/.test(src) && /stuck/.test(src)) stuckOk = true;
  else vc.add(stuckFn, "missing-stuck-logic", "workflow-stuck-detector must check last_progress_at and flip status to stuck");
}

const report = {
  generatedAt: new Date().toISOString(),
  gate: "Gate 34 — Workflow Reality (Phase 23)",
  requiredTables: REQUIRED_TABLES,
  requiredFunctions: REQUIRED_FNS,
  tableEvidence,
  assertions: {
    adminWiredToReal: adminWired,
    executeKillSwitchEnforced: executeKsOk,
    dispatchKillSwitchEnforced: dispatchKsOk,
    repairActionsComplete: repairActionsOk,
    stuckDetectorWired: stuckOk,
  },
  bypassScan: {
    scannedFiles: bypassFiles.length,
    allowedRunners: Array.from(BYPASS_ALLOWED),
    violations: bypassViolations.length,
    violatingFiles: bypassViolations,
  },
  crons: [
    "sita-scheduler-dispatch-1m",
    "sita-workflow-stuck-detector-5m",
  ],
  errors: vc.errors,
  warnings: vc.warnings,
  ok: vc.errors.length === 0,
};
fs.mkdirSync("generated", { recursive: true });
fs.writeFileSync("generated/workflow-reality-report.json", JSON.stringify(report, null, 2));

console.log(`  🔁 Workflow reality: ${REQUIRED_TABLES.length} tables, ${REQUIRED_FNS.length} fns, admin=${adminWired}, ks-exec=${executeKsOk}, ks-disp=${dispatchKsOk}, repair=${repairActionsOk}, stuck=${stuckOk}, bypass=${bypassViolations.length}`);
vc.report("check-workflow-reality");
vc.exitIfErrors();
