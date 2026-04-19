#!/usr/bin/env node
/* eslint-disable no-console */
// Economic-Trust-Future Closure — per-user AI ceiling enforcement gate.
// Verifies the per-user budget rpc + receipts pipeline is wired end-to-end.
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "per-user-ai-ceilings";
const issues: GateIssue[] = [];

const STATUS = "generated/economic-trust-and-future-closure/per-user-budget-status.json";
const GATEWAY = "supabase/functions/ai-gateway/index.ts";

if (!existsSync(STATUS)) {
  issues.push({ severity: "error", area: "evidence", message: `Missing ${STATUS}` });
} else {
  const s = JSON.parse(readFileSync(STATUS, "utf-8"));
  if (!s.evidence?.perUserCeilingActive) issues.push({ severity: "error", area: "ceiling", message: "perUserCeilingActive=false" });
  if (!s.evidence?.perUserHourlyCallCap) issues.push({ severity: "error", area: "hourly-cap", message: "perUserHourlyCallCap=false" });
  if (!s.evidence?.perUserDailyDollarCap) issues.push({ severity: "error", area: "daily-cap", message: "perUserDailyDollarCap=false" });
  if (!s.evidence?.failsClosed) issues.push({ severity: "error", area: "fail-closed", message: "Budget enforcement does not fail closed" });
  if (!s.evidence?.receiptEmittedOnDeny) issues.push({ severity: "error", area: "receipt", message: "No receipt on deny" });
}

if (!existsSync(GATEWAY)) {
  issues.push({ severity: "error", area: "gateway", message: `Missing ${GATEWAY}` });
} else {
  const src = readFileSync(GATEWAY, "utf-8");
  if (!/check_ai_budget_policies/.test(src)) {
    issues.push({ severity: "error", area: "wiring", message: "ai-gateway does not call check_ai_budget_policies" });
  }
}

const ok = issues.filter(i => i.severity === "error").length === 0;
console.log(`${ok ? "✅" : "❌"} ${GATE}: ${issues.length} issue(s)`);
emitGateReport({ gate: GATE, ok, issues });
process.exit(ok ? 0 : 1);
