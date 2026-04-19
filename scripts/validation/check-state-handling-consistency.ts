#!/usr/bin/env node
/* eslint-disable no-console */
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const STATUS = "generated/frontend-polish-closure/state-handling-status.json";
const issues: GateIssue[] = [];

if (!existsSync(STATUS)) {
  issues.push({ severity: "error", area: "artifact", message: `${STATUS} missing — run polish:closure:emit first` });
} else {
  const s = JSON.parse(readFileSync(STATUS, "utf-8"));
  for (const o of s.offenders ?? []) {
    if (o.missing_error) {
      issues.push({
        severity: "warning",
        area: "state-handling",
        message: `${o.file} has no error/catch handling`,
      });
    }
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
console.log(`${ok ? "✅" : "❌"} state-handling-consistency: ${issues.length} issue(s)`);
issues.slice(0, 20).forEach((i) => console.error(`   [${i.severity}] ${i.area}: ${i.message}`));
emitGateReport({ gate: "state-handling-consistency", ok, issues });
process.exit(ok ? 0 : 1);
