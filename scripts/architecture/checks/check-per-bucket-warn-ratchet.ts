#!/usr/bin/env node
/* eslint-disable no-console */
// Phase X — Per-bucket warn-ratchet (warn-level, will graduate).
// Locks in current per-category warning counts to detect regression
// in the three primary warning sources:
//   - lib-decomposition-readiness
//   - legacy-wrapper-usage
//   - lib-ownership-drift
//
// Each bucket has an env-overridable ceiling. If observed count exceeds
// the ceiling, the gate prints ❌ but exits 0 (warn-level). Gate
// graduates to BLOCK when ALL ceilings drop to ≤ tightenedThreshold.
import { readFileSync, existsSync, writeFileSync, mkdirSync } from "node:fs";

interface BucketDef {
  gate: string;
  reportFile: string;
  ceiling: number;
  envOverride: string;
  tightenedThreshold: number;
}

const BUCKETS: BucketDef[] = [
  {
    gate: "lib-decomposition-readiness",
    reportFile: "generated/lib-decomposition-readiness-report.json",
    ceiling: Number(process.env.LIB_DECOMP_CEILING ?? 1740), // Phase Y: 1750→1740 (current 1731, headroom 9)
    envOverride: "LIB_DECOMP_CEILING",
    tightenedThreshold: 500,
  },
  {
    gate: "legacy-wrapper-usage",
    reportFile: "generated/legacy-wrapper-usage-report.json",
    ceiling: Number(process.env.LEGACY_WRAPPER_CEILING ?? 1530), // Phase Y: 1550→1530 (current 1518, headroom 12)
    envOverride: "LEGACY_WRAPPER_CEILING",
    tightenedThreshold: 400,
  },
  {
    gate: "lib-ownership-drift",
    reportFile: "generated/lib-ownership-drift-report.json",
    ceiling: Number(process.env.LIB_OWNERSHIP_CEILING ?? 105), // Phase Y: 110→105 (current 99, headroom 6)
    envOverride: "LIB_OWNERSHIP_CEILING",
    tightenedThreshold: 30,
  },
];

const results: Array<{ gate: string; observed: number; ceiling: number; ok: boolean; headroom: number }> = [];
let anyExceeded = false;
let allTight = true;

for (const b of BUCKETS) {
  if (!existsSync(b.reportFile)) {
    console.warn(`⚠ ${b.gate}: report missing — skipping`);
    continue;
  }
  const data = JSON.parse(readFileSync(b.reportFile, "utf-8")) as { warningCount?: number };
  const observed = data.warningCount ?? 0;
  const ok = observed <= b.ceiling;
  results.push({ gate: b.gate, observed, ceiling: b.ceiling, ok, headroom: Math.max(0, b.ceiling - observed) });
  if (!ok) anyExceeded = true;
  if (b.ceiling > b.tightenedThreshold) allTight = false;
}

mkdirSync("generated", { recursive: true });
writeFileSync("generated/per-bucket-warn-ratchet-report.json", JSON.stringify({
  generatedAt: new Date().toISOString(),
  gate: "per-bucket-warn-ratchet",
  level: allTight ? "block" : "warn",
  buckets: results,
  anyExceeded,
  ok: !anyExceeded,
}, null, 2));

for (const r of results) {
  console.log(`${r.ok ? "✅" : "❌"} ${r.gate}: ${r.observed} ≤ ${r.ceiling} (headroom ${r.headroom})`);
}
console.log(`Per-bucket ratchet: ${anyExceeded ? "REGRESSED" : "OK"} [${allTight ? "BLOCK" : "WARN"}]`);

// Warn-level until all buckets shrink past tightened threshold
process.exit(allTight && anyExceeded ? 1 : 0);
