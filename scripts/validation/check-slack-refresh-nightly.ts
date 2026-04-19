#!/usr/bin/env node
/* eslint-disable no-console */
// Validates the Slack nightly refresh proof exists in the last 24h.
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "slack-refresh-nightly";
const STATUS = "generated/connector-truth-closure/connector-provider-status.json";
const issues: GateIssue[] = [];

if (!existsSync(STATUS)) {
  issues.push({ severity: "error", area: "artifact", message: `${STATUS} missing — run npm run connector:truth:emit` });
} else {
  const s = JSON.parse(readFileSync(STATUS, "utf-8"));
  const sl = s.providers?.slack;
  if (!sl) issues.push({ severity: "error", area: "slack", message: "slack entry missing" });
  else if ((sl.successCount24h ?? 0) < 1)
    issues.push({
      severity: "error",
      area: "slack",
      message: `slack has 0 successful refresh probes in last 24h (failures=${sl.failureCount24h ?? 0})`,
    });
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues });
console.log(`${ok ? "✅" : "❌"} ${GATE}`);
process.exit(ok ? 0 : 1);
