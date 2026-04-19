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
  if ((s.shell_only_violations ?? 0) > 0) {
    issues.push({
      severity: "error",
      area: "shell-only",
      message: `${s.shell_only_violations} board(s) contain no supabase calls (potential shell-only)`,
    });
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
console.log(`${ok ? "✅" : "❌"} no-shell-only-production-pages: ${issues.length} violation(s)`);
issues.slice(0, 20).forEach((i) => console.error(`   [${i.severity}] ${i.area}: ${i.message}`));
emitGateReport({ gate: "no-shell-only-production-pages", ok, issues });
process.exit(ok ? 0 : 1);
