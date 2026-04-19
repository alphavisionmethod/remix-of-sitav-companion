#!/usr/bin/env node
/* eslint-disable no-console */
// Admin & Validation Closure — top-task discoverability gate
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport } from "./_lib/emit-gate-report";

const STATUS = "generated/admin-and-validation-closure/admin-usability-status.json";
const issues: Array<{ severity: "error" | "warning"; area: string; message: string }> = [];

if (!existsSync(STATUS)) {
  issues.push({ severity: "error", area: "admin-usability-status", message: `Missing ${STATUS}` });
  emitGateReport({ gate: "admin-top-task-discoverability", ok: false, issues });
  console.error(`❌ admin-top-task-discoverability: ${STATUS} missing`);
  process.exit(1);
}

const data = JSON.parse(readFileSync(STATUS, "utf-8")) as { top_tasks?: Array<{ id: string; clicks: number; path: string; find_target_seconds: number }> };
const tasks = data.top_tasks ?? [];

if (tasks.length < 10) {
  issues.push({ severity: "error", area: "top_tasks", message: `Need ≥10 top tasks, found ${tasks.length}` });
}
for (const t of tasks) {
  if (!t.path) issues.push({ severity: "error", area: t.id, message: "missing path" });
  if (typeof t.clicks !== "number" || t.clicks > 3) {
    issues.push({ severity: "error", area: t.id, message: `clicks=${t.clicks} exceeds ≤3 target` });
  }
  if (typeof t.find_target_seconds !== "number" || t.find_target_seconds > 30) {
    issues.push({ severity: "error", area: t.id, message: `find_target_seconds=${t.find_target_seconds} exceeds 30s` });
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({ gate: "admin-top-task-discoverability", ok, issues, extra: { taskCount: tasks.length } });
console.log(`${ok ? "✅" : "❌"} admin-top-task-discoverability: ${tasks.length} tasks, ${issues.length} issue(s) [BLOCK]`);
process.exit(ok ? 0 : 1);
