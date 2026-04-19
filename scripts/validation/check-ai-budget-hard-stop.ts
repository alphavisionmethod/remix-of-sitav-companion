#!/usr/bin/env node
/* eslint-disable no-console */
// Economic-Trust-Future Closure — AI budget hard-stop under sustained load.
// Reads receipt files from generated/economic-trust-and-future-closure/budget-load-runs/.
// WARN-tier until the first real load-test run lands.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "ai-budget-hard-stop";
const RUNS_DIR = "generated/economic-trust-and-future-closure/budget-load-runs";
const issues: GateIssue[] = [];

const runs = existsSync(RUNS_DIR)
  ? readdirSync(RUNS_DIR).filter(f => f.endsWith(".json"))
  : [];

let ceilingViolations = 0;
let validRuns = 0;
for (const f of runs) {
  try {
    const r = JSON.parse(readFileSync(`${RUNS_DIR}/${f}`, "utf-8"));
    if (typeof r.ceilingHonored !== "boolean") continue;
    validRuns++;
    if (!r.ceilingHonored) {
      ceilingViolations++;
      issues.push({ severity: "error", area: "ceiling-violation", message: `Run ${f} did not honor per-user ceiling` });
    }
  } catch {
    issues.push({ severity: "warning", area: "parse", message: `Could not parse ${f}` });
  }
}

if (validRuns === 0) {
  issues.push({
    severity: "warning",
    area: "no-load-runs",
    message: "WARN-tier: hard-stop logic is wired and emits receipts, but no real load-test run has been recorded yet. Run scripts/load-test/budget-load-test.sh against a deployed env.",
  });
}

const ok = issues.filter(i => i.severity === "error").length === 0;
console.log(`${ok ? "✅" : "❌"} ${GATE}: ${validRuns} load run(s), ${ceilingViolations} violation(s)`);
emitGateReport({ gate: GATE, ok, issues, extra: { validRuns, ceilingViolations } });
process.exit(ok ? 0 : 1);
