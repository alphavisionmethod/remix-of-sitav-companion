import { describe, it, expect } from "vitest";
import * as fs from "fs";

// All scripts that must exist in the project
const EXPECTED_GENERATORS = [
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
  "scripts/generate-capability-matrices.ts",
  "scripts/generate-capability-family-index.ts",
  "scripts/generate-capability-quality-metric.ts",
  "scripts/generate-contract-manifest.ts",
  "scripts/generate-shell-space-registry.ts",
  "scripts/generate-subscription-replacement-matrix.ts",
  "scripts/generate-runtime-conformance.ts",
  "scripts/generate-runtime-ports.ts",
  "scripts/generate-service-consolidation.ts",
  "scripts/generate-admin-support-visibility.ts",
  "scripts/generate-operational-scorecards.ts",
  "scripts/generate-ownership-manifest.ts",
  "scripts/generate-maturity-thresholds.ts",
  "scripts/generate-release-gate-thresholds.ts",
  "scripts/generate-surface-performance-budget.ts",
  "scripts/generate-architecture-compliance.ts",
  "scripts/generate-launch-tier-index.ts",
  "scripts/generate-validation-summary.ts",
];

const EXPECTED_VALIDATORS = [
  "scripts/architecture/boundary-check.ts",
  "scripts/architecture/check-module-count.ts",
  "scripts/architecture/check-service-sprawl.ts",
  "scripts/architecture/check-advisor-registry.ts",
  "scripts/architecture/check-capability-families.ts",
  "scripts/architecture/check-connector-catalog.ts",
  "scripts/architecture/check-contract-family-completeness.ts",
  "scripts/architecture/check-contract-registry.ts",
  "scripts/architecture/check-event-catalog.ts",
  "scripts/architecture/check-event-receipt-linkage.ts",
  "scripts/architecture/check-outbound-communication-policy.ts",
  "scripts/architecture/check-policy-coverage.ts",
  "scripts/architecture/check-proof-coverage.ts",
  "scripts/architecture/check-sensitive-document-privacy.ts",
  "scripts/architecture/check-status-truth-tags.ts",
  "scripts/architecture/check-surface-ownership.ts",
  "scripts/architecture/check-workflow-state-usage.ts",
  "scripts/check-single-brain.ts",
  "scripts/check-import-boundaries.ts",
  "scripts/check-edge-function-health.ts",
  "scripts/check-package-exports.ts",
  "scripts/check-contract-completeness.ts",
  "scripts/check-contract-integrity.ts",
  "scripts/check-drift.ts",
  "scripts/check-feature-governance.ts",
  "scripts/check-rls-coverage.ts",
  "scripts/check-no-page-mocks.ts",
  "scripts/check-runtime-usage.ts",
  "scripts/check-duplicate-exports.ts",
  "scripts/check-inline-mocks.ts",
  "scripts/check-route-drift.ts",
  "scripts/check-scoring-boundaries.ts",
  "scripts/check-delegation-receipts.ts",
  "scripts/check-canonical-imports.ts",
];

const EXPECTED_MASTER_SCRIPTS = [
  "scripts/validate-all.ts",
  "scripts/generate-all.ts",
  "scripts/architecture/architecture-report.ts",
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
  it("validate-all.ts references all root-level check scripts", () => {
    const content = fs.readFileSync("scripts/validate-all.ts", "utf-8");
    const rootChecks = EXPECTED_VALIDATORS.filter(v => v.startsWith("scripts/check-"));
    for (const check of rootChecks) {
      expect(content).toContain(check);
    }
  });

  it("generate-all.ts references all generators", () => {
    const content = fs.readFileSync("scripts/generate-all.ts", "utf-8");
    for (const gen of EXPECTED_GENERATORS) {
      expect(content).toContain(gen);
    }
  });

  it("validate-all.ts references all architecture checks", () => {
    const content = fs.readFileSync("scripts/validate-all.ts", "utf-8");
    const archChecks = EXPECTED_VALIDATORS.filter(v => v.startsWith("scripts/architecture/"));
    for (const check of archChecks) {
      expect(content).toContain(check);
    }
  });
});
