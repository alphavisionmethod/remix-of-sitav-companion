#!/usr/bin/env node
/* eslint-disable no-console */
// Validates the Microsoft nightly refresh proof exists in the last 24h.
// Accepts honest credentials_unavailable classification as warning (build sandbox).
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "microsoft-refresh-nightly";
const STATUS = "generated/connector-truth-closure/connector-provider-status.json";
const issues: GateIssue[] = [];

if (!existsSync(STATUS)) {
  issues.push({ severity: "error", area: "artifact", message: `${STATUS} missing — run npm run connector:truth:emit` });
} else {
  const s = JSON.parse(readFileSync(STATUS, "utf-8"));
  if (s.classification === "credentials_unavailable") {
    issues.push({
      severity: "warning",
      area: "credentials",
      message: "credentials_unavailable in this environment — production CI cron emits live evidence.",
    });
  } else {
    const m = s.providers?.microsoft;
    if (!m) issues.push({ severity: "error", area: "microsoft", message: "microsoft entry missing" });
    else if (m.classification === "credentials_unavailable") {
      issues.push({
        severity: "warning",
        area: "credentials",
        message: "microsoft entry is credentials_unavailable — production CI emits live evidence.",
      });
    } else if ((m.successCount24h ?? 0) < 1)
      issues.push({
        severity: "error",
        area: "microsoft",
        message: `microsoft has 0 successful refresh probes in last 24h (failures=${m.failureCount24h ?? 0})`,
      });
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues });
console.log(`${ok ? "✅" : "❌"} ${GATE}`);
process.exit(ok ? 0 : 1);
