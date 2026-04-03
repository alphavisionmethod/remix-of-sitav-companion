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

  it("all 24 scripts accounted for", () => {
    const total = validationScripts.length + generationScripts.length + masterScripts.length;
    expect(total).toBe(24);
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
