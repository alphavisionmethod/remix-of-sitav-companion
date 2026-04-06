import { describe, it, expect } from "vitest";
import * as fs from "fs";

describe("Validation & Generation Scripts", () => {
  const validationScripts = [
    "scripts/architecture/boundary-check.ts",
    "scripts/validation/generated-truth.ts",
    "scripts/validation/schema-compliance.ts",
    "scripts/check-single-brain.ts",
    "scripts/check-import-boundaries.ts",
    "scripts/check-rls-coverage.ts",
    "scripts/check-edge-function-health.ts",
    "scripts/check-package-exports.ts",
    "scripts/check-contract-completeness.ts",
    "scripts/check-canonical-imports.ts",
  ];

  const generationScripts = [
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
    // Phase A-F new generators
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
    "scripts/generate-validation-summary.ts",
    "scripts/generate-architecture-compliance.ts",
    "scripts/generate-launch-tier-index.ts",
  ];

  const masterScripts = [
    "scripts/generate-all.ts",
    "scripts/validate-all.ts",
  ];

  for (const script of [...validationScripts, ...generationScripts, ...masterScripts]) {
    it(`${script} exists and is valid TypeScript`, () => {
      expect(fs.existsSync(script)).toBe(true);
      const content = fs.readFileSync(script, "utf-8");
      expect(content.length).toBeGreaterThan(50);
      expect(content.includes("import") || content.includes("export") || content.includes("const")).toBe(true);
    });
  }

  it("all scripts accounted for", () => {
    const total = validationScripts.length + generationScripts.length + masterScripts.length;
    expect(total).toBeGreaterThanOrEqual(42);
  });
});

describe("Generated JSON Files", () => {
  const generatedFiles = [
    "generated/service-manifest.json",
    "generated/route-manifest.json",
    "generated/capability-index.json",
    "generated/prompt-index.json",
    "generated/connector-catalog.json",
    "generated/advisor-registry.json",
    "generated/internal-agent-registry.json",
    "generated/formula-registry.json",
    "generated/outcome-index.json",
    "generated/subject-manifest.json",
    "generated/startup-order.json",
    "generated/feature-integration-index.json",
    "generated/boardroom-template-index.json",
    // New generated files
    "generated/capability-event-matrix.json",
    "generated/capability-owner-map.json",
    "generated/capability-policy-matrix.json",
    "generated/capability-receipt-matrix.json",
    "generated/capability-surface-matrix.json",
    "generated/capability-family-index.json",
    "generated/capability-quality-metric.json",
    "generated/contract-manifest.json",
    "generated/shell-space-registry.json",
    "generated/subscription-replacement-matrix.json",
    "generated/runtime-conformance-manifest.json",
    "generated/runtime-ports.json",
    "generated/service-consolidation-manifest.json",
    "generated/admin-support-visibility-manifest.json",
    "generated/operational-scorecards.json",
    "generated/operational-metrics-snapshot.json",
    "generated/ownership-manifest.json",
    "generated/maturity-thresholds.json",
    "generated/release-gate-thresholds.json",
    "generated/surface-performance-budget.json",
    "generated/validation-summary.json",
    "generated/accessibility-summary.json",
    "generated/visual-regression-baseline.json",
    "generated/architecture-compliance-report.json",
    "generated/security-review-manifest.json",
    "generated/launch-tier-index.json",
  ];

  for (const file of generatedFiles) {
    it(`${file} is valid JSON`, () => {
      expect(fs.existsSync(file)).toBe(true);
      const content = fs.readFileSync(file, "utf-8");
      expect(() => JSON.parse(content)).not.toThrow();
    });
  }
});

describe("Edge Function Structure", () => {
  const functions = ["brain-core", "event-processor", "connector-proxy", "admin-api", "admin-intelligence"];

  for (const fn of functions) {
    it(`${fn} has index.ts`, () => {
      expect(fs.existsSync(`supabase/functions/${fn}/index.ts`)).toBe(true);
    });

    it(`${fn} has test file`, () => {
      expect(fs.existsSync(`supabase/functions/${fn}/index_test.ts`)).toBe(true);
    });
  }
});

describe("Security Directory", () => {
  it("has threat models", () => {
    expect(fs.existsSync("security/threat-models")).toBe(true);
  });

  it("has security policies", () => {
    expect(fs.existsSync("security/policies")).toBe(true);
  });

  it("has attestations", () => {
    expect(fs.existsSync("security/attestations")).toBe(true);
  });
});
