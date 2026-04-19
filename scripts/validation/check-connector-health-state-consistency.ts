#!/usr/bin/env node
/* eslint-disable no-console */
// Validates no token surfaces as 'connected' while its latest probe is failing/reauth_required.
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "connector-health-state-consistency";
const STATUS = "generated/connector-truth-closure/connector-truth-verification.json";
const issues: GateIssue[] = [];

if (!existsSync(STATUS)) {
  issues.push({ severity: "error", area: "artifact", message: `${STATUS} missing` });
} else {
  const s = JSON.parse(readFileSync(STATUS, "utf-8"));
  const sc = s.lastRun?.stateConsistency;
  if (!sc) issues.push({ severity: "error", area: "data", message: "no state-consistency evidence in last run" });
  else if (!sc.passed)
    issues.push({
      severity: "error",
      area: "drift",
      message: `state-consistency drift detected: ${sc.driftCount} tokens render 'connected' while probe is failing/reauth_required`,
    });
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues });
console.log(`${ok ? "✅" : "❌"} ${GATE}`);
process.exit(ok ? 0 : 1);
