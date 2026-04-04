#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Run All Validators
// Master script that runs all validation/check scripts
// ═══════════════════════════════════════════════════════════════

import { execSync } from "child_process";

const validators = [
  // ── Architecture checks ──────────────────────────────────────
  "scripts/architecture/boundary-check.ts",
  "scripts/architecture/check-advisor-registry.ts",
  "scripts/architecture/check-capability-families.ts",
  "scripts/architecture/check-connector-catalog.ts",
  "scripts/architecture/check-contract-family-completeness.ts",
  "scripts/architecture/check-contract-registry.ts",
  "scripts/architecture/check-event-catalog.ts",
  "scripts/architecture/check-event-receipt-linkage.ts",
  "scripts/architecture/check-module-count.ts",
  "scripts/architecture/check-outbound-communication-policy.ts",
  "scripts/architecture/check-policy-coverage.ts",
  "scripts/architecture/check-proof-coverage.ts",
  "scripts/architecture/check-sensitive-document-privacy.ts",
  "scripts/architecture/check-service-sprawl.ts",
  "scripts/architecture/check-status-truth-tags.ts",
  "scripts/architecture/check-surface-ownership.ts",
  "scripts/architecture/check-workflow-state-usage.ts",
  "scripts/architecture/check-boot-chain.ts",

  // ── Root-level checks ────────────────────────────────────────
  "scripts/check-single-brain.ts",
  "scripts/check-import-boundaries.ts",
  "scripts/check-edge-function-health.ts",
  "scripts/check-package-exports.ts",
  "scripts/check-contract-completeness.ts",
  "scripts/check-contract-integrity.ts",
  "scripts/check-no-page-mocks.ts",
  "scripts/check-runtime-usage.ts",
  "scripts/check-duplicate-exports.ts",
  "scripts/check-inline-mocks.ts",
  "scripts/check-route-drift.ts",
  "scripts/check-scoring-boundaries.ts",
  "scripts/check-delegation-receipts.ts",
  "scripts/check-canonical-imports.ts",
  "scripts/check-drift.ts",
  "scripts/check-feature-governance.ts",
  "scripts/check-rls-coverage.ts",

  // ── Validation subdirectory checks ───────────────────────────
  "scripts/validation/generated-truth.ts",
  "scripts/validation/schema-compliance.ts",
  "scripts/validation/check-capability-quality-metric.ts",
  "scripts/validation/check-capability-registration.ts",
  "scripts/validation/check-connector-governance.ts",
  "scripts/validation/check-contract-registry-blockers.ts",
  "scripts/validation/check-contracts-deprecated-imports.ts",
  "scripts/validation/check-contracts-generated-artifact-imports.ts",
  "scripts/validation/check-contracts-layer-purity.ts",
  "scripts/validation/check-contracts-no-duplicate-concepts.ts",
  "scripts/validation/check-contracts-public-import-surface.ts",
  "scripts/validation/check-contracts-read-model-purity.ts",
  "scripts/validation/check-feature-integration-completeness.ts",
  "scripts/validation/check-final-delivery-conformance.ts",
  "scripts/validation/check-generated-truth.ts",
  "scripts/validation/check-kubernetes-readiness.ts",
  "scripts/validation/check-master-dossier-conformance.ts",
  "scripts/validation/check-master-dossier-expansion-plan.ts",
  "scripts/validation/check-memory-governance.ts",
  "scripts/validation/check-phase4-foundations.ts",
  "scripts/validation/check-phase5-anti-patterns.ts",
  "scripts/validation/check-phase5-import-boundaries.ts",
  "scripts/validation/check-phase5-integration-map.ts",
  "scripts/validation/check-phase5-readiness.ts",
  "scripts/validation/check-phase5-route-contract-drift.ts",
  "scripts/validation/check-policy-mapping.ts",
  "scripts/validation/check-prompt9-readiness.ts",
  "scripts/validation/check-receipt-coverage.ts",
  "scripts/validation/check-route-page-contract-layer-usage.ts",
  "scripts/validation/check-service-consolidation-alignment.ts",
  "scripts/validation/check-service-registry-sync.ts",
  "scripts/validation/check-services-structure-hygiene.ts",
  "scripts/validation/check-supportability-requirements.ts",
  "scripts/validation/check-tenancy-firewall.ts",
  "scripts/validation/check-terraform-vmware-readiness.ts",
  "scripts/validation/check-vmware-readiness.ts",
  "scripts/validation/check-workflow-states.ts",

  // ── Conformance generators (also act as validators) ──────────
  "scripts/generate-runtime-conformance.ts",
  "scripts/generate-architecture-compliance.ts",
];

console.log(`\n🔍 Running ${validators.length} validators...\n`);

let failed = 0;
let passed = 0;
const failures: string[] = [];

for (const v of validators) {
  const label = v.replace("scripts/", "").replace(".ts", "");
  try {
    execSync(`npx tsx ${v}`, { stdio: "pipe", timeout: 60000 });
    passed++;
  } catch (e: any) {
    failed++;
    failures.push(label);
  }
}

console.log(`\n${failed === 0 ? "✅" : "⚠️"} ${passed}/${validators.length} validators passed\n`);
if (failures.length > 0) {
  console.log("Failed:");
  for (const f of failures) console.log(`  ❌ ${f}`);
}
if (failed > 0) process.exit(1);
