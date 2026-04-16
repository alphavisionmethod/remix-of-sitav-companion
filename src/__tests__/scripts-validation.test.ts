import { describe, it, expect } from "vitest";
import * as fs from "fs";

// ═══════════════════════════════════════════════════════════════
// SITA OS — Scripts Validation Test (Canonical Paths)
// Updated to reflect the domain-driven script architecture
// ═══════════════════════════════════════════════════════════════

const EXPECTED_GENERATORS = [
  "scripts/manifests/generate/generate-service-manifest.ts",
  "scripts/manifests/generate/generate-route-manifest.ts",
  "scripts/manifests/generate/generate-capability-index.ts",
  "scripts/manifests/generate/generate-prompt-index.ts",
  "scripts/manifests/generate/generate-connector-catalog.ts",
  "scripts/manifests/generate/generate-advisor-registry.ts",
  "scripts/manifests/generate/generate-internal-agent-registry.ts",
  "scripts/manifests/generate/generate-formula-registry.ts",
  "scripts/manifests/generate/generate-outcome-index.ts",
  "scripts/manifests/generate/generate-subject-manifest.ts",
  "scripts/manifests/generate/generate-startup-order.ts",
  "scripts/manifests/generate/generate-feature-integration-index.ts",
  "scripts/manifests/generate/generate-boardroom-template-index.ts",
  "scripts/manifests/generate/generate-capability-matrices.ts",
  "scripts/manifests/generate/generate-capability-family-index.ts",
  "scripts/manifests/generate/generate-capability-quality-metric.ts",
  "scripts/manifests/generate/generate-contract-manifest.ts",
  "scripts/manifests/generate/generate-shell-space-registry.ts",
  "scripts/manifests/generate/generate-subscription-replacement-matrix.ts",
  "scripts/manifests/generate/generate-service-consolidation.ts",
  "scripts/manifests/generate/generate-admin-support-visibility.ts",
  "scripts/manifests/generate/generate-operational-scorecards.ts",
  "scripts/manifests/generate/generate-ownership-manifest.ts",
  "scripts/manifests/generate/generate-maturity-thresholds.ts",
  "scripts/manifests/generate/generate-surface-performance-budget.ts",
  "scripts/manifests/generate/generate-architecture-compliance.ts",
  "scripts/manifests/generate/generate-launch-tier-index.ts",
  "scripts/manifests/generate/generate-validation-summary.ts",
  "scripts/runtime/generate/generate-runtime-conformance.ts",
  "scripts/runtime/generate/generate-runtime-ports.ts",
  "scripts/release/checks/generate-release-gate-thresholds.ts",
];

const EXPECTED_VALIDATORS = [
  // Architecture checks
  "scripts/architecture/checks/boundary-check.ts",
  "scripts/architecture/checks/check-module-count.ts",
  "scripts/architecture/checks/check-service-sprawl.ts",
  "scripts/architecture/checks/check-advisor-registry.ts",
  "scripts/architecture/checks/check-capability-families.ts",
  "scripts/architecture/checks/check-connector-catalog.ts",
  "scripts/architecture/checks/check-contract-family-completeness.ts",
  "scripts/architecture/checks/check-contract-registry.ts",
  "scripts/architecture/checks/check-event-catalog.ts",
  "scripts/architecture/checks/check-event-receipt-linkage.ts",
  "scripts/architecture/checks/check-outbound-communication-policy.ts",
  "scripts/architecture/checks/check-policy-coverage.ts",
  "scripts/architecture/checks/check-proof-coverage.ts",
  "scripts/architecture/checks/check-sensitive-document-privacy.ts",
  "scripts/architecture/checks/check-status-truth-tags.ts",
  "scripts/architecture/checks/check-surface-ownership.ts",
  "scripts/architecture/checks/check-workflow-state-usage.ts",
  // Contract checks
  "scripts/contracts/checks/check-canonical-imports.ts",
  "scripts/contracts/checks/check-import-boundaries.ts",
  "scripts/contracts/checks/check-package-exports.ts",
  "scripts/contracts/checks/check-contract-completeness.ts",
  "scripts/contracts/checks/check-contract-integrity.ts",
  "scripts/contracts/checks/check-duplicate-exports.ts",
  // Runtime checks
  "scripts/runtime/checks/check-single-brain.ts",
  "scripts/runtime/checks/check-edge-function-health.ts",
  "scripts/runtime/checks/check-runtime-usage.ts",
  "scripts/runtime/checks/check-scoring-boundaries.ts",
  // DB checks
  "scripts/db/checks/check-rls-coverage.ts",
  // Architecture — additional
  "scripts/architecture/checks/check-drift.ts",
  "scripts/architecture/checks/check-no-page-mocks.ts",
  "scripts/architecture/checks/check-inline-mocks.ts",
  "scripts/architecture/checks/check-feature-governance.ts",
  "scripts/architecture/checks/check-delegation-receipts.ts",
  "scripts/architecture/checks/check-ia-coherence.ts",
  "scripts/architecture/checks/check-route-page-contract-layer-usage.ts",
];

const EXPECTED_MASTER_SCRIPTS = [
  "scripts/validate-all.ts",
  "scripts/generate-all.ts",
  "scripts/architecture/reports/architecture-report.ts",
];

const EXPECTED_BOOTSTRAP = [
  "scripts/bootstrap/bootstrap-new-service.ts",
];

describe("Scripts inventory", () => {
  it.each(EXPECTED_GENERATORS)("generator exists: %s", (path) => {
    expect(fs.existsSync(path)).toBe(true);
  });

  it.each(EXPECTED_VALIDATORS)("validator exists: %s", (path) => {
    expect(fs.existsSync(path)).toBe(true);
  });

  it.each(EXPECTED_MASTER_SCRIPTS)("master script exists: %s", (path) => {
    expect(fs.existsSync(path)).toBe(true);
  });

  it.each(EXPECTED_BOOTSTRAP)("bootstrap script exists: %s", (path) => {
    expect(fs.existsSync(path)).toBe(true);
  });
});

describe("Master script completeness", () => {
  it("validate-all.ts references architecture checks", () => {
    const content = fs.readFileSync("scripts/validate-all.ts", "utf-8");
    const archChecks = EXPECTED_VALIDATORS.filter(v => v.startsWith("scripts/architecture/"));
    for (const check of archChecks) {
      expect(content).toContain(check);
    }
  });

  it("generate-all.ts references all generators", () => {
    const content = fs.readFileSync("scripts/generate-all.ts", "utf-8");
    for (const gen of EXPECTED_GENERATORS) {
      expect(content).toContain(gen);
    }
  });
});
