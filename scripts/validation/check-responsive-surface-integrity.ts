#!/usr/bin/env node
/* eslint-disable no-console */
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const STATUS = "generated/frontend-polish-closure/frontend-polish-verification.json";
const issues: GateIssue[] = [];

if (!existsSync(STATUS)) {
  issues.push({ severity: "error", area: "artifact", message: `${STATUS} missing — run polish:closure:emit first` });
} else {
  const s = JSON.parse(readFileSync(STATUS, "utf-8"));
  if ((s.responsive_violations ?? 0) > 0) {
    issues.push({
      severity: "warning",
      area: "responsive",
      message: `${s.responsive_violations} board(s) contain unwrapped <table> on narrow widths`,
    });
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
console.log(`${ok ? "✅" : "❌"} responsive-surface-integrity: ${issues.length} issue(s)`);
issues.slice(0, 20).forEach((i) => console.error(`   [${i.severity}] ${i.area}: ${i.message}`));
emitGateReport({ gate: "responsive-surface-integrity", ok, issues });
process.exit(ok ? 0 : 1);
