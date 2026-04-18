#!/usr/bin/env node
/* eslint-disable no-console */
// Validates drill cadence registry is registered and has all canonical drills.
import { existsSync, readFileSync } from "node:fs";

const STATUS = "generated/final-hardening/drill-cadence-status.json";
const REQUIRED_DRILLS = [
  "restore-drill-production-shape",
  "oauth-refresh-probe-google",
  "oauth-refresh-probe-microsoft",
  "oauth-refresh-probe-slack",
  "release-artifact-verification",
  "baseline-seal-verification",
  "notification-calmness-review",
  "admin-golden-path-drill",
  "boardroom-followthrough-runbook-drill",
];

if (!existsSync(STATUS)) {
  console.error("❌ drill-cadence-status.json missing");
  process.exit(1);
}
const s = JSON.parse(readFileSync(STATUS, "utf-8"));
const present = new Set<string>(s.registeredDrills ?? []);
const missing = REQUIRED_DRILLS.filter(d => !present.has(d));
const ok = missing.length === 0 && s.dbBacked === true;
console.log(`${ok ? "✅" : "❌"} drill-cadence: ${present.size}/${REQUIRED_DRILLS.length} drills registered, db-backed=${s.dbBacked}`);
if (missing.length > 0) console.error(`  missing: ${missing.join(", ")}`);
process.exit(ok ? 0 : 1);
