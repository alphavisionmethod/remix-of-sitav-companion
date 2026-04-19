#!/usr/bin/env node
/* eslint-disable no-console */
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const STATUS = "generated/frontend-polish-closure/cta-integrity-status.json";
const issues: GateIssue[] = [];

if (!existsSync(STATUS)) {
  issues.push({ severity: "error", area: "artifact", message: `${STATUS} missing — run polish:closure:emit first` });
} else {
  const s = JSON.parse(readFileSync(STATUS, "utf-8"));
  if ((s.violations ?? 0) > 0) {
    for (const o of s.offenders ?? []) {
      issues.push({
        severity: "error",
        area: "cta",
        message: `${o.file} contains ${o.dead_cta_count} dead CTA(s) (empty onClick / href="#")`,
      });
    }
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
console.log(`${ok ? "✅" : "❌"} cta-integrity: ${issues.length} violation(s)`);
issues.slice(0, 20).forEach((i) => console.error(`   [${i.severity}] ${i.area}: ${i.message}`));
emitGateReport({ gate: "cta-integrity", ok, issues });
process.exit(ok ? 0 : 1);
