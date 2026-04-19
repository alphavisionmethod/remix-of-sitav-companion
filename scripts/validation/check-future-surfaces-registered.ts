#!/usr/bin/env node
/* eslint-disable no-console */
// Economic-Trust-Future Closure — future surfaces must be registered + excluded from launch scoring.
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "future-surfaces-registered";
const STATUS = "generated/economic-trust-and-future-closure/future-surface-status.json";
const issues: GateIssue[] = [];

if (!existsSync(STATUS)) {
  issues.push({ severity: "error", area: "evidence", message: `${STATUS} missing` });
} else {
  const s = JSON.parse(readFileSync(STATUS, "utf-8"));
  if (!s.evidence?.excludedFromLaunchScoring) {
    issues.push({ severity: "error", area: "scoring", message: "Future surfaces are not excluded from launch scoring" });
  }
  if (!s.evidence?.labeledArchivedOrFuture) {
    issues.push({ severity: "error", area: "labeling", message: "Future surfaces are not labeled ARCHIVED/FUTURE_VISION_ONLY" });
  }
  const cats = s.evidence?.categories ?? [];
  if (!Array.isArray(cats) || cats.length === 0) {
    issues.push({ severity: "error", area: "registry", message: "No future surface categories registered" });
  }
}

const ok = issues.filter(i => i.severity === "error").length === 0;
console.log(`${ok ? "✅" : "❌"} ${GATE}: ${issues.length} issue(s)`);
emitGateReport({ gate: GATE, ok, issues });
process.exit(ok ? 0 : 1);
