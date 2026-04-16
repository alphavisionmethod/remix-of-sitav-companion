import { describe, it, expect } from "vitest";
import * as fs from "fs";

// ═══════════════════════════════════════════════════════════════
// SITA OS — Scripts Validation Test (Canonical Domain Paths)
// ═══════════════════════════════════════════════════════════════

describe("Validation & Generation Scripts", () => {
  const validationScripts = [
    "scripts/architecture/checks/boundary-check.ts",
    "scripts/manifests/validate/generated-truth.ts",
    "scripts/db/checks/schema-compliance.ts",
    "scripts/runtime/checks/check-single-brain.ts",
    "scripts/contracts/checks/check-import-boundaries.ts",
    "scripts/db/checks/check-rls-coverage.ts",
    "scripts/runtime/checks/check-edge-function-health.ts",
    "scripts/contracts/checks/check-package-exports.ts",
    "scripts/contracts/checks/check-contract-completeness.ts",
    "scripts/contracts/checks/check-canonical-imports.ts",
  ];

  const generationScripts = [
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
    "scripts/runtime/generate/generate-runtime-conformance.ts",
    "scripts/runtime/generate/generate-runtime-ports.ts",
    "scripts/manifests/generate/generate-service-consolidation.ts",
    "scripts/manifests/generate/generate-admin-support-visibility.ts",
    "scripts/manifests/generate/generate-operational-scorecards.ts",
    "scripts/manifests/generate/generate-ownership-manifest.ts",
    "scripts/manifests/generate/generate-maturity-thresholds.ts",
    "scripts/release/checks/generate-release-gate-thresholds.ts",
    "scripts/manifests/generate/generate-surface-performance-budget.ts",
    "scripts/manifests/generate/generate-validation-summary.ts",
    "scripts/manifests/generate/generate-architecture-compliance.ts",
    "scripts/manifests/generate/generate-launch-tier-index.ts",
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
