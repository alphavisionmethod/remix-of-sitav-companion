#!/usr/bin/env node
/* eslint-disable no-console */
// Aggregator for Phase 5–9 closure pack validators.
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";

const GATES = [
  "check-ai-receipt-completeness",
  "check-connector-reauth-telemetry",
  "check-security-fabric-probes",
  "check-app-sdk-extension-registry",
];

let pass = 0;
let fail = 0;
const results: Array<{ gate: string; status: "pass" | "fail" }> = [];

for (const g of GATES) {
  const r = spawnSync("npx", ["tsx", `scripts/architecture/checks/${g}.ts`], { stdio: "inherit" });
  if (r.status === 0) {
    pass++;
    results.push({ gate: g, status: "pass" });
  } else {
    fail++;
    results.push({ gate: g, status: "fail" });
  }
}

mkdirSync("generated", { recursive: true });
writeFileSync(
  "generated/phase-5-9-closure-gates-report.json",
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      gate: "phase-5-9-closure-gates",
      ok: fail === 0,
      pass,
      fail,
      results,
    },
    null,
    2,
  ),
);
console.log(`\n📊 Phase 5–9 closure gates: ${pass}/${GATES.length} pass, ${fail} fail`);
process.exit(fail === 0 ? 0 : 1);
