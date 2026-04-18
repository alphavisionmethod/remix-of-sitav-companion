#!/usr/bin/env node
/* eslint-disable no-console */
// Phase O — Run all 12 deployment-gap-closure guardrail gates.
import { spawnSync } from "node:child_process";

const GATES = [
  "check-app-store-install-flow",
  "check-file-picker-adoption",
  "check-autosave-adoption",
  "check-window-snap-integration",
  "check-mobile-offline-persistence",
  "check-search-source-coverage",
  "check-ai-cost-metering",
  "check-connector-oauth-hardening",
  "check-frontend-backend-substrate-map",
  "check-db-truth-completeness",
  "check-manifest-truth-completeness",
  "check-supportability-coverage",
  "check-warn-ratchet",
  "check-per-bucket-warn-ratchet",
  "check-evidence-freshness",
];

let pass = 0, fail = 0;
for (const g of GATES) {
  const r = spawnSync("npx", ["tsx", `scripts/architecture/checks/${g}.ts`], { stdio: "inherit" });
  if (r.status === 0) pass++; else fail++;
}
console.log(`\n📊 Deployment-gap gates: ${pass}/${GATES.length} pass, ${fail} fail`);
process.exit(fail === 0 ? 0 : 1);
