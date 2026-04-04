#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Run All Generators
// Master script that runs all generation scripts
// ═══════════════════════════════════════════════════════════════

import { execSync } from "child_process";

const generators = [
  // ── Core generators (no dependencies) ────────────────────────
  "scripts/generate-service-manifest.ts",
  "scripts/generate-route-manifest.ts",
  "scripts/generate-capability-index.ts",
  "scripts/generate-prompt-index.ts",
  "scripts/generate-connector-catalog.ts",
  "scripts/generate-advisor-registry.ts",
  "scripts/generate-internal-agent-registry.ts",
  "scripts/generate-formula-registry.ts",
  "scripts/generate-outcome-index.ts",
  "scripts/generate-subject-manifest.ts",
  "scripts/generate-startup-order.ts",
  "scripts/generate-feature-integration-index.ts",
  "scripts/generate-boardroom-template-index.ts",

  // ── Phase A: Capability matrices (depends on capability-index, service-manifest, route-manifest) ──
  "scripts/generate-capability-matrices.ts",

  // ── Phase B: Registries & indexes (depends on capability-index) ──
  "scripts/generate-capability-family-index.ts",
  "scripts/generate-capability-quality-metric.ts",
  "scripts/generate-contract-manifest.ts",
  "scripts/generate-shell-space-registry.ts",
  "scripts/generate-subscription-replacement-matrix.ts",

  // ── Phase C: Operational (depends on service-manifest) ────────
  "scripts/generate-runtime-conformance.ts",
  "scripts/generate-runtime-ports.ts",
  "scripts/generate-service-consolidation.ts",
  "scripts/generate-admin-support-visibility.ts",
  "scripts/generate-operational-scorecards.ts",
  "scripts/generate-ownership-manifest.ts",

  // ── Phase D: Thresholds (depends on service-manifest, route-manifest) ──
  "scripts/generate-maturity-thresholds.ts",
  "scripts/generate-release-gate-thresholds.ts",
  "scripts/generate-surface-performance-budget.ts",

  // ── Phase E: Compliance (depends on service-manifest) ─────────
  "scripts/generate-architecture-compliance.ts",

  // ── Phase F: Launch tier (depends on service-manifest) ────────
  "scripts/generate-launch-tier-index.ts",

  // ── Phase G: Validation summary (runs last, checks all above) ─
  "scripts/generate-validation-summary.ts",
];

console.log(`\n🔄 Running ${generators.length} generators...\n`);

let failed = 0;
for (const g of generators) {
  try {
    execSync(`npx tsx ${g}`, { stdio: "inherit" });
  } catch {
    failed++;
  }
}

console.log(`\n${failed === 0 ? "✅" : "⚠️"} ${generators.length - failed}/${generators.length} generators succeeded\n`);
if (failed > 0) process.exit(1);
