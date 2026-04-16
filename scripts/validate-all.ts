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
    "scripts/architecture/checks/boundary-check.ts",
    "scripts/architecture/checks/check-advisor-registry.ts",
    "scripts/architecture/checks/check-capability-families.ts",
    "scripts/architecture/checks/check-connector-catalog.ts",
    "scripts/architecture/checks/check-contract-family-completeness.ts",
    "scripts/architecture/checks/check-contract-registry.ts",
    "scripts/architecture/checks/check-event-catalog.ts",
    "scripts/architecture/checks/check-event-receipt-linkage.ts",
    "scripts/architecture/checks/check-module-count.ts",
    "scripts/architecture/checks/check-outbound-communication-policy.ts",
    "scripts/architecture/checks/check-policy-coverage.ts",
    "scripts/architecture/checks/check-proof-coverage.ts",
    "scripts/architecture/checks/check-sensitive-document-privacy.ts",
    "scripts/architecture/checks/check-service-sprawl.ts",
    "scripts/architecture/checks/check-status-truth-tags.ts",
    "scripts/architecture/checks/check-surface-ownership.ts",
    "scripts/architecture/checks/check-workflow-state-usage.ts",
    "scripts/architecture/checks/check-boot-chain.ts",
    "scripts/architecture/checks/check-plane-boundaries.ts",
    "scripts/architecture/checks/check-layer-boundaries.ts",
    "scripts/architecture/checks/check-action-envelope-boundary.ts",
    "scripts/architecture/checks/check-admin-ia.ts",
    "scripts/architecture/checks/check-admin-top-level-domain-count.ts",
    "scripts/architecture/checks/check-admin-route-coherence.ts",
    "scripts/architecture/checks/check-admin-shell-consistency.ts",
    "scripts/architecture/checks/check-owner-workflow-map.ts",
    "scripts/architecture/checks/check-service-consolidation-alignment.ts",
    "scripts/architecture/checks/check-platform-anti-patterns.ts",
    "scripts/architecture/checks/check-runtime-foundations.ts",
    "scripts/architecture/checks/check-integration-map.ts",
    "scripts/architecture/checks/check-platform-readiness.ts",
    "scripts/architecture/checks/check-error-boundaries.ts",
    "scripts/architecture/checks/check-no-backend-in-ui.ts",
    "scripts/architecture/checks/check-no-ui-in-backend.ts",
    "scripts/architecture/checks/check-no-runtime-in-shared.ts",
    "scripts/architecture/checks/check-no-hidden-executor.ts",
    "scripts/architecture/checks/check-orchestration-authority.ts",
    "scripts/architecture/checks/check-hook-purity.ts",
    "scripts/architecture/checks/check-policy-mapping.ts",
    "scripts/architecture/checks/check-protocol-purity.ts",
    "scripts/architecture/checks/check-receipt-coverage.ts",
    "scripts/architecture/checks/check-route-page-contract-layer-usage.ts",
    "scripts/architecture/checks/check-service-registry-sync.ts",
    "scripts/architecture/checks/check-services-structure-hygiene.ts",
    "scripts/architecture/checks/check-workflow-states.ts",
    "scripts/architecture/checks/check-feature-integration-completeness.ts",
    "scripts/architecture/checks/check-engine-no-io.ts",
    "scripts/architecture/checks/check-deployable-plane-isolation.ts",
    "scripts/architecture/checks/check-ia-coherence.ts",
    "scripts/architecture/checks/check-drift.ts",
    "scripts/architecture/checks/check-route-drift.ts",
    "scripts/architecture/checks/check-no-page-mocks.ts",
    "scripts/architecture/checks/check-inline-mocks.ts",
    "scripts/architecture/checks/check-feature-governance.ts",
    "scripts/architecture/checks/check-delegation-receipts.ts",
  ],

  // ── Contracts ──
  "contracts": [
    "scripts/contracts/checks/check-canonical-imports.ts",
    "scripts/contracts/checks/check-import-boundaries.ts",
    "scripts/contracts/checks/check-contract-completeness.ts",
    "scripts/contracts/checks/check-contract-integrity.ts",
    "scripts/contracts/checks/check-package-exports.ts",
    "scripts/contracts/checks/check-duplicate-exports.ts",
    "scripts/contracts/checks/validate-os-contracts.ts",
    "scripts/contracts/checks/check-contract-registry-blockers.ts",
    "scripts/contracts/checks/check-contracts-deprecated-imports.ts",
    "scripts/contracts/checks/check-contracts-generated-artifact-imports.ts",
    "scripts/contracts/checks/check-contracts-layer-purity.ts",
    "scripts/contracts/checks/check-contracts-no-duplicate-concepts.ts",
    "scripts/contracts/checks/check-contracts-public-import-surface.ts",
    "scripts/contracts/checks/check-contracts-read-model-purity.ts",
    "scripts/contracts/checks/check-capability-registration.ts",
    "scripts/contracts/checks/check-connector-governance.ts",
    "scripts/contracts/checks/check-capability-quality-metric.ts",
    "scripts/contracts/checks/check-contract-import-boundaries.ts",
    "scripts/contracts/checks/check-route-contract-drift.ts",
  ],

  // ── Runtime ──
  "runtime": [
    "scripts/runtime/checks/check-single-brain.ts",
    "scripts/runtime/checks/check-runtime-usage.ts",
    "scripts/runtime/checks/check-edge-function-health.ts",
    "scripts/runtime/checks/check-scoring-boundaries.ts",
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
    "scripts/db/checks/check-rls-coverage.ts",
    "scripts/db/checks/check-schema-registry.ts",
    "scripts/db/checks/check-table-ownership.ts",
    "scripts/db/checks/check-migration-ownership.ts",
    "scripts/db/checks/check-rls-policy-registry.ts",
    "scripts/db/checks/check-tenancy-boundary-map.ts",
    "scripts/db/checks/schema-compliance.ts",
    "scripts/db/checks/check-tenancy-firewall.ts",
    "scripts/db/checks/check-persistence-coverage.ts",
    "scripts/runtime/edge-functions/check-backend-registry-completeness.ts",
    "scripts/runtime/edge-functions/check-edge-function-ownership.ts",
  ],

  // ── Deployment ──
  "deployment": [
    "scripts/deployment/checks/check-deployment-unit-map.ts",
    "scripts/deployment/checks/check-build-output-map.ts",
    "scripts/deployment/checks/check-ingress-topology.ts",
    "scripts/deployment/checks/check-release-unit-map.ts",
    "scripts/deployment/checks/check-kubernetes-readiness.ts",
    "scripts/deployment/checks/check-terraform-vmware-readiness.ts",
    "scripts/deployment/checks/check-vmware-readiness.ts",
  ],

  // ── Manifests ──
  "manifests": [
    "scripts/manifests/validate/check-manifest-authority.ts",
    "scripts/manifests/validate/check-manifest-runtime-linkage.ts",
    "scripts/manifests/validate/check-manifest-source-truth.ts",
    "scripts/manifests/validate/check-manifest-ci-gates.ts",
    "scripts/manifests/validate/check-manifest-owner-coverage.ts",
    "scripts/manifests/validate/check-generated-truth.ts",
    "scripts/manifests/validate/check-master-dossier-conformance.ts",
    "scripts/manifests/validate/check-master-dossier-expansion-plan.ts",
    "scripts/manifests/validate/check-memory-governance.ts",
    "scripts/manifests/validate/check-final-delivery-conformance.ts",
    "scripts/manifests/validate/generated-truth.ts",
  ],

  // ── Support ──
  "support": [
    "scripts/support/coverage/check-runbook-coverage.ts",
    "scripts/support/coverage/check-alert-runbook-linkage.ts",
    "scripts/support/coverage/check-kill-switch-coverage.ts",
    "scripts/support/coverage/check-golden-path-coverage.ts",
    "scripts/support/coverage/check-supportability-requirements.ts",
    "scripts/db/backup/verify-backup-restore.ts",
  ],

  // ── Release ──
  "release": [
    "scripts/release/checks/check-release-readiness.ts",
    "scripts/release/checks/release-launch-truth-audit.ts",
  ],

  // ── Security ──
  "security": [
    "scripts/security/checks/security-check-role-leakage.ts",
    "scripts/security/checks/security-check-tenant-isolation.ts",
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
