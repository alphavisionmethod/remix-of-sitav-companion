#!/usr/bin/env node
/* eslint-disable no-console */
// Admin & Validation Closure — top-task discoverability gate.
// Cross-validates admin-usability-status.json AND top-tasks-status.json:
// every top task must have ≤3 clicks, ≤30s find time, and a complete ideal path.
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport } from "./_lib/emit-gate-report";

const STATUS = "generated/admin-and-validation-closure/admin-usability-status.json";
const PATHS = "generated/admin-and-validation-closure/top-tasks-status.json";

interface UsabilityTask { id: string; clicks: number; path: string; find_target_seconds: number }
interface PathTask { id: string; name: string; route: string; expectedClicks: number; idealPath: string[]; complete: boolean }

const issues: Array<{ severity: "error" | "warning"; area: string; message: string }> = [];

if (!existsSync(STATUS)) {
  issues.push({ severity: "error", area: "admin-usability-status", message: `Missing ${STATUS}` });
  emitGateReport({ gate: "admin-top-task-discoverability", ok: false, issues });
  console.error(`❌ admin-top-task-discoverability: ${STATUS} missing`);
  process.exit(1);
}

const usability = JSON.parse(readFileSync(STATUS, "utf-8")) as { top_tasks?: UsabilityTask[] };
const tasks = usability.top_tasks ?? [];
const pathsData = existsSync(PATHS) ? (JSON.parse(readFileSync(PATHS, "utf-8")) as { tasks?: PathTask[]; clickCeiling?: number; findTimeCeilingSeconds?: number }) : { tasks: [], clickCeiling: 3, findTimeCeilingSeconds: 30 };
const pathMap = new Map((pathsData.tasks ?? []).map((p) => [p.id, p]));
const clickCeiling = pathsData.clickCeiling ?? 3;
const findCeiling = pathsData.findTimeCeilingSeconds ?? 30;

if (tasks.length < 10) issues.push({ severity: "error", area: "top_tasks", message: `Need ≥10 top tasks, found ${tasks.length}` });

for (const t of tasks) {
  if (!t.path) issues.push({ severity: "error", area: t.id, message: "missing path" });
  if (typeof t.clicks !== "number" || t.clicks > clickCeiling) {
    issues.push({ severity: "error", area: t.id, message: `clicks=${t.clicks} exceeds ≤${clickCeiling} target` });
  }
  if (typeof t.find_target_seconds !== "number" || t.find_target_seconds > findCeiling) {
    issues.push({ severity: "error", area: t.id, message: `find_target_seconds=${t.find_target_seconds} exceeds ${findCeiling}s` });
  }
  // Cross-check pathfinding mate
  const p = pathMap.get(t.id);
  if (!p) {
    issues.push({ severity: "error", area: t.id, message: "missing in top-tasks-status.json (pathfinding mate)" });
  } else {
    if (!p.complete) issues.push({ severity: "error", area: t.id, message: "pathfinding marked incomplete" });
    if (p.expectedClicks > clickCeiling) issues.push({ severity: "error", area: t.id, message: `expectedClicks=${p.expectedClicks} exceeds ≤${clickCeiling}` });
    if (!Array.isArray(p.idealPath) || p.idealPath.length === 0) issues.push({ severity: "error", area: t.id, message: "idealPath empty" });
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({ gate: "admin-top-task-discoverability", ok, issues, extra: { taskCount: tasks.length, pathfindingTaskCount: pathsData.tasks?.length ?? 0, clickCeiling, findCeiling } });
console.log(`${ok ? "✅" : "❌"} admin-top-task-discoverability: ${tasks.length} tasks, pathfinding=${pathsData.tasks?.length ?? 0}, ${issues.length} issue(s) [BLOCK]`);
process.exit(ok ? 0 : 1);
