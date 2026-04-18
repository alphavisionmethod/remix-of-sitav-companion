#!/usr/bin/env node
/* eslint-disable no-console */
// Validates production-shape restore drill freshness + status.
import { existsSync, readFileSync } from "node:fs";

const REPORT = "generated/production-restore-status.json";
const MAX_AGE_DAYS = 35; // monthly cadence + grace

if (!existsSync(REPORT)) {
  console.error("❌ production-restore-status.json missing");
  process.exit(1);
}
const r = JSON.parse(readFileSync(REPORT, "utf-8"));
const ageDays = (Date.now() - new Date(r.finishedAt).getTime()) / (1000 * 60 * 60 * 24);
const fresh = ageDays <= MAX_AGE_DAYS;
const ok = r.status !== "fail" && fresh;
console.log(`${ok ? "✅" : "❌"} restore-drill: status=${r.status} match=${r.matchPercent}% age=${ageDays.toFixed(1)}d`);
if (!fresh) console.error(`  ⚠ stale: ${ageDays.toFixed(1)}d > ${MAX_AGE_DAYS}d`);
process.exit(ok ? 0 : 1);
