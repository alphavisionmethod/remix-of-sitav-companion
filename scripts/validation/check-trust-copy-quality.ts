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
  if ((s.trust_copy_violations ?? 0) > 0) {
    issues.push({
      severity: "error",
      area: "trust-copy",
      message: `${s.trust_copy_violations} forbidden phrase(s) detected (TODO/FIXME/lorem/alert/console.log)`,
    });
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
console.log(`${ok ? "✅" : "❌"} trust-copy-quality: ${issues.length} issue(s)`);
issues.slice(0, 20).forEach((i) => console.error(`   [${i.severity}] ${i.area}: ${i.message}`));
emitGateReport({ gate: "trust-copy-quality", ok, issues });
process.exit(ok ? 0 : 1);
