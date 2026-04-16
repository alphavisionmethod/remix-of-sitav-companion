/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// CI Gate — Deployability Coverage (Phase 9)
// Asserts every claimed surface scores ≥ 80% on build/sign/distribute/
// update/recover, and emits the deployability report.
// ═══════════════════════════════════════════════════════════════

import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname } from "node:path";
import {
  DEPLOYABILITY_REGISTRY,
  allDeployabilityScores,
  deployabilityHealth,
} from "../../../src/lib/deploy/deployability-registry";

const MIN_SCORE = 80;
const issues: string[] = [];

// 1. Validate every artifact path exists
for (const entry of DEPLOYABILITY_REGISTRY) {
  for (const stage of entry.stages) {
    if (!existsSync(stage.artifact)) {
      issues.push(`${entry.surface}/${stage.stage} artifact missing: ${stage.artifact}`);
    }
  }
}

// 2. Score thresholds
const scores = allDeployabilityScores();
for (const s of scores) {
  if (s.score < MIN_SCORE) {
    issues.push(`${s.surface} below threshold (${s.score}/100). Blockers: ${s.blockers.join(", ")}`);
  }
}

const health = deployabilityHealth();

const report = {
  generatedAt: new Date().toISOString(),
  minThreshold: MIN_SCORE,
  health,
  scores,
  registry: DEPLOYABILITY_REGISTRY,
  issues,
  ok: issues.length === 0,
};

const out = "generated/deployability-report.json";
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(report, null, 2), "utf-8");

console.log(`Deployability: ${health.surfaces} surfaces, avg ${health.averageScore}/100, ${health.blockedSurfaces} below threshold`);
console.log(`  → ${out}`);

if (!report.ok) {
  console.error("❌ Issues:");
  for (const i of issues) console.error(`   - ${i}`);
  process.exit(1);
}
console.log("✅ Pass");
