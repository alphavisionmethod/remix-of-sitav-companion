#!/usr/bin/env node
/* eslint-disable no-console */
// Aggregator for the 5 evidence-persistence Phase 0–4 closure validators.
// Wired into the master release readiness check.
import { spawnSync } from "node:child_process";

const GATES = [
  "check-canonical-paths",
  "check-5-plane-boundaries",
  "check-evidence-graph-completeness",
  "check-cron-execution-evidence",
  "check-release-decision-persistence",
];

let pass = 0;
let fail = 0;
const results: Array<{ gate: string; status: "pass" | "fail" }> = [];

for (const g of GATES) {
  const r = spawnSync("npx", ["tsx", `scripts/architecture/checks/${g}.ts`], {
    stdio: "inherit",
  });
  if (r.status === 0) {
    pass++;
    results.push({ gate: g, status: "pass" });
  } else {
    fail++;
    results.push({ gate: g, status: "fail" });
  }
}

console.log(`\n📊 Evidence persistence gates: ${pass}/${GATES.length} pass, ${fail} fail`);
process.exit(fail === 0 ? 0 : 1);
