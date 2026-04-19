#!/usr/bin/env node
/* eslint-disable no-console */
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const STATUS = "generated/frontend-polish-closure/frontend-completeness-status.json";
const issues: GateIssue[] = [];

if (!existsSync(STATUS)) {
  issues.push({ severity: "error", area: "artifact", message: `${STATUS} missing — run polish:closure:emit first` });
} else {
  const s = JSON.parse(readFileSync(STATUS, "utf-8"));
  const adopted = (s.boards ?? []).filter((b: any) => b.boardSectionAdopted).length;
  if (adopted < 1) {
    issues.push({
      severity: "error",
      area: "polish",
      message: `BoardSection helper not adopted on any board — at least 1 hardened board required`,
    });
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
console.log(`${ok ? "✅" : "❌"} admin-board-polish: ${issues.length} issue(s)`);
issues.slice(0, 20).forEach((i) => console.error(`   [${i.severity}] ${i.area}: ${i.message}`));
emitGateReport({ gate: "admin-board-polish", ok, issues });
process.exit(ok ? 0 : 1);
