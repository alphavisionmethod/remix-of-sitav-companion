#!/usr/bin/env node
/* eslint-disable no-console */
// Validates connector refresh streak health (green/yellow/red/building).
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "connector-refresh-streak";
const STATUS = "generated/connector-truth-closure/connector-refresh-streak-status.json";
const issues: GateIssue[] = [];

if (!existsSync(STATUS)) {
  issues.push({ severity: "error", area: "artifact", message: `${STATUS} missing` });
} else {
  const s = JSON.parse(readFileSync(STATUS, "utf-8"));
  if (s.classification === "red") {
    issues.push({
      severity: "error",
      area: "streak",
      message: `Streak classification is RED — unack reauth required tokens=${s.reauth_required_count_24h ?? "?"}`,
    });
  }
  if (s.classification === "yellow" || s.classification === "building") {
    issues.push({
      severity: "warning",
      area: "streak",
      message: `Streak still building: classification=${s.classification}, min_streak_days=${s.min_streak_days ?? 0}`,
    });
  }
}

// only error-severity blocks
const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues });
console.log(`${ok ? "✅" : "❌"} ${GATE}`);
process.exit(ok ? 0 : 1);
