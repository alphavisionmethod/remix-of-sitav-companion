#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Run All Generators
// Registry-driven master script that runs all generation scripts
// ═══════════════════════════════════════════════════════════════

import { execSync } from "child_process";

// ── Generator registry by domain ─────────────────────────────
const generators: Record<string, string[]> = {
  // ── Core manifests (no dependencies) ──
  "manifests:core": [
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
  ],

  // ── Capability matrices (depends on core) ──
  "manifests:capabilities": [
    "scripts/generate-capability-matrices.ts",
    "scripts/generate-capability-family-index.ts",
    "scripts/generate-capability-quality-metric.ts",
  ],

  // ── Contracts ──
  "contracts": [
    "scripts/generate-contract-manifest.ts",
    "scripts/generate-shell-space-registry.ts",
    "scripts/generate-subscription-replacement-matrix.ts",
  ],

  // ── Runtime ──
  "runtime": [
    "scripts/generate-runtime-conformance.ts",
    "scripts/generate-runtime-ports.ts",
    "scripts/runtime/generate/generate-runtime-capability-matrix.ts",
    "scripts/runtime/generate/generate-runtime-reality-map.ts",
    "scripts/runtime/edge-functions/generate-edge-function-registry.ts",
  ],

  // ── Operational ──
  "manifests:operational": [
    "scripts/generate-service-consolidation.ts",
    "scripts/generate-admin-support-visibility.ts",
    "scripts/generate-operational-scorecards.ts",
    "scripts/generate-ownership-manifest.ts",
  ],

  // ── Thresholds ──
  "manifests:thresholds": [
    "scripts/generate-maturity-thresholds.ts",
    "scripts/generate-release-gate-thresholds.ts",
    "scripts/generate-surface-performance-budget.ts",
  ],

  // ── Compliance & launch ──
  "architecture": [
    "scripts/generate-architecture-compliance.ts",
    "scripts/generate-launch-tier-index.ts",
  ],

  // ── DB truth ──
  "db": [
    "scripts/db/generate/generate-schema-registry.ts",
    "scripts/db/generate/generate-table-ownership-map.ts",
    "scripts/db/generate/generate-rls-policy-registry.ts",
    "scripts/db/generate/generate-migration-registry.ts",
  ],

  // ── Deployment ──
  "deployment": [
    "scripts/deployment/build/generate-build-output-map.ts",
    "scripts/deployment/ingress/generate-ingress-topology.ts",
  ],

  // ── Manifest truth ──
  "manifests:truth": [
    "scripts/manifests/generate/generate-manifest-registry.ts",
    "scripts/manifests/generate/generate-manifest-truth-dashboard.ts",
    "scripts/manifests/reports/generate-manifest-drift-report.ts",
  ],

  // ── Support ──
  "support": [
    "scripts/support/runbooks/generate-runbook-index.ts",
    "scripts/support/runbooks/generate-golden-path-registry.ts",
  ],

  // ── Registry (runs last) ──
  "registry": [
    "scripts/registry/script-registry.ts",
    "scripts/registry/script-classification-report.ts",
  ],

  // ── Validation summary (runs last, checks all above) ──
  "validation-summary": [
    "scripts/generate-validation-summary.ts",
  ],
};

// Parse CLI args for domain filtering
const targetDomain = process.argv[2];
const domains = targetDomain
  ? Object.entries(generators).filter(([k]) => k === targetDomain || k.startsWith(targetDomain))
  : Object.entries(generators);

const allScripts = domains.flatMap(([, scripts]) => scripts);
console.log(`\n🔄 Running ${allScripts.length} generators across ${domains.length} domains...\n`);

let failed = 0;
let succeeded = 0;

for (const [domain, scripts] of domains) {
  console.log(`\n── ${domain} ──`);
  for (const g of scripts) {
    try {
      execSync(`npx tsx ${g}`, { stdio: "inherit" });
      succeeded++;
    } catch {
      failed++;
      console.error(`  ❌ ${g}`);
    }
  }
}

console.log(`\n${failed === 0 ? "✅" : "⚠️"} ${succeeded}/${allScripts.length} generators succeeded\n`);
if (failed > 0) process.exit(1);
