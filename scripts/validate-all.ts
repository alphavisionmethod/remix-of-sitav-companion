#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Run All Validators
// Registry-driven master script that runs all validation scripts
// ═══════════════════════════════════════════════════════════════

import { execSync } from "child_process";

// ── Validator registry by domain ─────────────────────────────
const validators: Record<string, string[]> = {
  // ── Architecture ──
  "architecture": [
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
    "scripts/architecture/check-plane-boundaries.ts",
    "scripts/architecture/check-layer-boundaries.ts",
    "scripts/architecture/check-action-envelope-boundary.ts",
    // Admin governance
    "scripts/architecture/checks/check-admin-ia.ts",
    "scripts/architecture/checks/check-admin-top-level-domain-count.ts",
    "scripts/architecture/checks/check-admin-route-coherence.ts",
    "scripts/architecture/checks/check-admin-shell-consistency.ts",
    "scripts/architecture/checks/check-owner-workflow-map.ts",
  ],

  // ── Contracts ──
  "contracts": [
    "scripts/check-canonical-imports.ts",
    "scripts/check-import-boundaries.ts",
    "scripts/check-contract-completeness.ts",
    "scripts/check-contract-integrity.ts",
    "scripts/check-package-exports.ts",
    "scripts/check-duplicate-exports.ts",
  ],

  // ── Runtime ──
  "runtime": [
    "scripts/check-single-brain.ts",
    "scripts/check-runtime-usage.ts",
    "scripts/check-edge-function-health.ts",
    "scripts/check-scoring-boundaries.ts",
    "scripts/runtime/checks/check-runtime-capability-matrix.ts",
    "scripts/runtime/checks/check-runtime-tier-coverage.ts",
    "scripts/runtime/checks/check-reality-classification-coverage.ts",
    "scripts/runtime/checks/check-desktop-runtime-contract.ts",
    "scripts/runtime/checks/check-mobile-runtime-contract.ts",
    "scripts/runtime/checks/check-appliance-runtime-contract.ts",
    "scripts/runtime/edge-functions/check-edge-function-topology.ts",
    "scripts/runtime/edge-functions/check-edge-function-category-coverage.ts",
    "scripts/runtime/edge-functions/check-edge-function-auth-map.ts",
  ],

  // ── DB ──
  "db": [
    "scripts/check-rls-coverage.ts",
    "scripts/db/checks/check-schema-registry.ts",
    "scripts/db/checks/check-table-ownership.ts",
    "scripts/db/checks/check-migration-ownership.ts",
    "scripts/db/checks/check-rls-policy-registry.ts",
    "scripts/db/checks/check-tenancy-boundary-map.ts",
  ],

  // ── Deployment ──
  "deployment": [
    "scripts/deployment/checks/check-deployment-unit-map.ts",
    "scripts/deployment/checks/check-build-output-map.ts",
    "scripts/deployment/checks/check-ingress-topology.ts",
    "scripts/deployment/checks/check-release-unit-map.ts",
  ],

  // ── Manifests ──
  "manifests": [
    "scripts/manifests/validate/check-manifest-authority.ts",
    "scripts/manifests/validate/check-manifest-runtime-linkage.ts",
    "scripts/manifests/validate/check-manifest-source-truth.ts",
    "scripts/manifests/validate/check-manifest-ci-gates.ts",
    "scripts/manifests/validate/check-manifest-owner-coverage.ts",
  ],

  // ── Support ──
  "support": [
    "scripts/support/coverage/check-runbook-coverage.ts",
    "scripts/support/coverage/check-alert-runbook-linkage.ts",
    "scripts/support/coverage/check-kill-switch-coverage.ts",
    "scripts/support/coverage/check-golden-path-coverage.ts",
    "scripts/db/backup/verify-backup-restore.ts",
  ],

  // ── Feature & drift ──
  "feature-governance": [
    "scripts/check-no-page-mocks.ts",
    "scripts/check-inline-mocks.ts",
    "scripts/check-route-drift.ts",
    "scripts/check-drift.ts",
    "scripts/check-feature-governance.ts",
    "scripts/check-delegation-receipts.ts",
    "scripts/check-ia-coherence.ts",
  ],

  // ── Validation subdirectory (permanent checks) ──
  "validation": [
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
    "scripts/validation/check-deployable-plane-isolation.ts",
    "scripts/validation/check-engine-no-io.ts",
    "scripts/validation/check-error-boundaries.ts",
    "scripts/validation/check-hook-purity.ts",
    "scripts/validation/check-no-backend-in-ui.ts",
    "scripts/validation/check-no-hidden-executor.ts",
    "scripts/validation/check-no-runtime-in-shared.ts",
    "scripts/validation/check-no-ui-in-backend.ts",
    "scripts/validation/check-orchestration-authority.ts",
    "scripts/validation/check-protocol-purity.ts",
  ],

  // ── Conformance generators (also act as validators) ──
  "conformance": [
    "scripts/generate-runtime-conformance.ts",
    "scripts/generate-architecture-compliance.ts",
  ],
};

// Parse CLI args for domain filtering
const targetDomain = process.argv[2];
const domains = targetDomain
  ? Object.entries(validators).filter(([k]) => k === targetDomain || k.startsWith(targetDomain))
  : Object.entries(validators);

const allScripts = domains.flatMap(([, scripts]) => scripts);
console.log(`\n🔍 Running ${allScripts.length} validators across ${domains.length} domains...\n`);

let failed = 0;
let passed = 0;
const failures: string[] = [];

for (const [domain, scripts] of domains) {
  console.log(`\n── ${domain} ──`);
  for (const v of scripts) {
    const label = v.replace("scripts/", "").replace(".ts", "");
    try {
      execSync(`npx tsx ${v}`, { stdio: "pipe", timeout: 60000 });
      passed++;
    } catch {
      failed++;
      failures.push(label);
    }
  }
}

console.log(`\n${failed === 0 ? "✅" : "⚠️"} ${passed}/${allScripts.length} validators passed\n`);
if (failures.length > 0) {
  console.log("Failed:");
  for (const f of failures) console.log(`  ❌ ${f}`);
}
if (failed > 0) process.exit(1);
