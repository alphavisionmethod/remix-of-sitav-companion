/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// CI Gate — Feature Reality Coverage (Phase 9)
// Asserts every feature in FEATURE_REALITY_REGISTRY classifies all
// 7 surfaces, and emits the reality report.
// ═══════════════════════════════════════════════════════════════

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import {
  FEATURE_REALITY_REGISTRY,
  ALL_SURFACES,
  realityCoverageStats,
} from "../../../src/lib/reality/feature-reality-registry";
import type { FeatureRealityCoverageReport } from "../../../src/lib/reality/feature-reality-types";
import { BOUNDED_CONTEXT_REGISTRY } from "../../../src/platform/architecture/bounded-context-registry";

const issues: { featureId: string; reason: string }[] = [];
const validContexts = new Set(BOUNDED_CONTEXT_REGISTRY.map((c) => c.contextId));

const FEATURE_FLOOR = 50;
if (FEATURE_REALITY_REGISTRY.length < FEATURE_FLOOR) {
  issues.push({
    featureId: "__registry__",
    reason: `Feature registry has only ${FEATURE_REALITY_REGISTRY.length} entries; floor is ${FEATURE_FLOOR}.`,
  });
}

for (const feature of FEATURE_REALITY_REGISTRY) {
  if (!validContexts.has(feature.contextId)) {
    issues.push({ featureId: feature.featureId, reason: `Unknown contextId: ${feature.contextId}` });
  }
  for (const surface of ALL_SURFACES) {
    const state = feature.perSurface[surface];
    if (!state) {
      issues.push({ featureId: feature.featureId, reason: `Missing classification for surface: ${surface}` });
    }
  }
  if (feature.evidence.length === 0) {
    issues.push({ featureId: feature.featureId, reason: "No evidence paths declared" });
  }
}

const stats = realityCoverageStats();

const report: FeatureRealityCoverageReport = {
  checkedAt: new Date().toISOString(),
  featureCount: FEATURE_REALITY_REGISTRY.length,
  realPct: stats.realPct,
  simulatedPct: stats.simulatedPct,
  issues,
  ok: issues.length === 0,
};

const out = "generated/feature-reality-report.json";
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(report, null, 2), "utf-8");

console.log(`Feature reality coverage: ${FEATURE_REALITY_REGISTRY.length} features, ${issues.length} issues`);
console.log(`  real: ${stats.realPct.toFixed(1)}%  simulated: ${stats.simulatedPct.toFixed(1)}%  degraded: ${stats.degradedPct.toFixed(1)}%`);
console.log(`  → ${out}`);

if (!report.ok) {
  console.error("❌ Issues:");
  for (const i of issues) console.error(`   - ${i.featureId}: ${i.reason}`);
  process.exit(1);
}
console.log("✅ Pass");
