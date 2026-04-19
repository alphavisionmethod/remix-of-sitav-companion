#!/usr/bin/env node
/* eslint-disable no-console */
// Economic-Trust-Future Closure — meta-validator aggregating the 6 sibling gates.
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "economic-trust-future-closure";
const SIBLINGS = [
  "generated/per-user-ai-ceilings-report.json",
  "generated/ai-budget-hard-stop-report.json",
  "generated/calm-mode-default-posture-report.json",
  "generated/agency-wording-lockdown-report.json",
  "generated/future-surfaces-registered-report.json",
  "generated/negative-receipts-emitted-report.json",
];

const issues: GateIssue[] = [];
let okCount = 0;
for (const f of SIBLINGS) {
  if (!existsSync(f)) {
    issues.push({ severity: "error", area: "missing-sibling", message: `${f} not produced — run sibling gate first` });
    continue;
  }
  try {
    const r = JSON.parse(readFileSync(f, "utf-8"));
    if (r.ok) okCount++;
    else issues.push({ severity: "error", area: "sibling-fail", message: `${f} not OK (${r.errorCount ?? 0} errors)` });
  } catch (e: any) {
    issues.push({ severity: "error", area: "parse", message: `${f}: ${e.message}` });
  }
}

const ok = issues.filter(i => i.severity === "error").length === 0;
console.log(`${ok ? "✅" : "❌"} ${GATE}: ${okCount}/${SIBLINGS.length} sibling gates OK`);
emitGateReport({ gate: GATE, ok, issues, extra: { okCount, total: SIBLINGS.length } });
process.exit(ok ? 0 : 1);
