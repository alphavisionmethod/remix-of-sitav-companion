#!/usr/bin/env node
/* eslint-disable no-console */
// Phase Y — Evidence freshness gate: ensures critical generated artifacts
// are regenerated within their staleness window. Prevents shipping with
// silently outdated truth manifests.
import { readFileSync, existsSync, statSync, writeFileSync, mkdirSync } from "node:fs";

interface FreshnessTarget {
  path: string;
  maxAgeHours: number;
  category: "deployment-gap" | "release-readiness" | "baseline";
}

const TARGETS: FreshnessTarget[] = [
  { path: "generated/os-release-readiness-report.json", maxAgeHours: 168, category: "release-readiness" },
  { path: "generated/profile-and-runtime-hardening/baseline.sealed.json", maxAgeHours: 720, category: "baseline" },
  { path: "generated/warn-ratchet-report.json", maxAgeHours: 168, category: "release-readiness" },
  { path: "generated/per-bucket-warn-ratchet-report.json", maxAgeHours: 168, category: "release-readiness" },
  { path: "generated/deployment-gap-closure/frontend-backend-substrate-matrix.json", maxAgeHours: 336, category: "deployment-gap" },
  { path: "generated/deployment-gap-closure/db-truth-closure-map.json", maxAgeHours: 336, category: "deployment-gap" },
  { path: "generated/deployment-gap-closure/manifest-truth-closure-map.json", maxAgeHours: 336, category: "deployment-gap" },
  { path: "generated/deployment-gap-closure/app-install-truth-map.json", maxAgeHours: 336, category: "deployment-gap" },
  { path: "generated/deployment-gap-closure/supportability-coverage-map.json", maxAgeHours: 336, category: "deployment-gap" },
];

const now = Date.now();
const results: Array<{
  path: string;
  category: string;
  ageHours: number;
  maxAgeHours: number;
  fresh: boolean;
  exists: boolean;
}> = [];

let stale = 0;
let missing = 0;

for (const t of TARGETS) {
  if (!existsSync(t.path)) {
    results.push({ path: t.path, category: t.category, ageHours: -1, maxAgeHours: t.maxAgeHours, fresh: false, exists: false });
    missing++;
    continue;
  }
  const ageMs = now - statSync(t.path).mtimeMs;
  const ageHours = ageMs / 3_600_000;
  const fresh = ageHours <= t.maxAgeHours;
  results.push({ path: t.path, category: t.category, ageHours: Number(ageHours.toFixed(1)), maxAgeHours: t.maxAgeHours, fresh, exists: true });
  if (!fresh) stale++;
}

mkdirSync("generated", { recursive: true });
writeFileSync("generated/evidence-freshness-report.json", JSON.stringify({
  generatedAt: new Date().toISOString(),
  gate: "evidence-freshness",
  level: "warn",
  totalTargets: TARGETS.length,
  freshCount: results.filter(r => r.fresh).length,
  staleCount: stale,
  missingCount: missing,
  results,
  ok: stale === 0 && missing === 0,
}, null, 2));

for (const r of results) {
  if (!r.exists) console.log(`❌ MISSING: ${r.path}`);
  else if (!r.fresh) console.log(`⚠ STALE: ${r.path} (${r.ageHours}h > ${r.maxAgeHours}h)`);
  else console.log(`✅ ${r.path} (${r.ageHours}h ≤ ${r.maxAgeHours}h)`);
}
console.log(`Evidence freshness: ${results.filter(r => r.fresh).length}/${TARGETS.length} fresh [WARN]`);

// Warn-level: never block, just signal
process.exit(0);
