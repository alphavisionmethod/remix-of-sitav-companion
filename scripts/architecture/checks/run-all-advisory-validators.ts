#!/usr/bin/env node
/* eslint-disable no-console */
// Spawns every advisory-classified validator so its generated/<gateId>-report.json
// exists for the readiness aggregator's advisory ingestion loop.
// Failures NEVER block the suite — advisory checks are status surfaces, not gates.

import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const MAP_FILE = join("generated", "validator-gate-map.json");
if (!existsSync(MAP_FILE)) {
  console.error(`❌ ${MAP_FILE} missing. Run \`npm run generate:validator-gate-map\` first.`);
  process.exit(1);
}

const map = JSON.parse(readFileSync(MAP_FILE, "utf8")) as {
  entries: Array<{ validator: string; classification: string }>;
};

const advisory = map.entries.filter((e) => e.classification === "advisory");
let pass = 0;
let fail = 0;

for (const entry of advisory) {
  const script = `scripts/architecture/checks/${entry.validator}.ts`;
  const r = spawnSync("npx", ["tsx", script], { stdio: "inherit" });
  if (r.status === 0) pass++;
  else fail++;
}

console.log(
  `\n📋 Advisory validators: ${advisory.length} executed (${pass} ok, ${fail} surfaced issues — non-blocking).`,
);
// Always exit 0 — advisory failures are surfaced via the aggregator, not by this runner.
process.exit(0);
