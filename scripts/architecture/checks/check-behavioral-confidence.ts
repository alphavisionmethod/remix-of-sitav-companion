#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Behavioral Confidence CI Gate
// Blocks merge when critical journey coverage drops below threshold
// ═══════════════════════════════════════════════════════════════

import { CRITICAL_PATH_MATRIX, getCoverageScore } from "../../../src/lib/testing/critical-path-matrix";

const MINIMUM_SCORE = 20; // will ratchet up as coverage improves
const score = getCoverageScore();
const uncoveredCritical = CRITICAL_PATH_MATRIX.filter(
  (p) => p.currentCoverage === "uncovered" && p.riskLevel === "critical"
);

console.log(`  🧪 Behavioral confidence score: ${score}%`);
console.log(`  🔴 Uncovered critical paths: ${uncoveredCritical.length}`);

if (score < MINIMUM_SCORE) {
  console.error(`❌ behavioral-confidence: score ${score}% below minimum ${MINIMUM_SCORE}%`);
  process.exit(1);
}

console.log(`✅ behavioral-confidence: ${score}% (minimum ${MINIMUM_SCORE}%)`);