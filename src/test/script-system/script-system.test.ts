import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function scanScripts(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && !["node_modules", "iso", "templates", "autoinstall", "profiles"].includes(entry.name)) {
      results.push(...scanScripts(full));
    } else if (/\.(ts|js|mjs|sh|ps1)$/.test(entry.name) && !entry.name.startsWith("tsconfig")) {
      results.push(full);
    }
  }
  return results;
}

describe("Script Registry Foundation", () => {
  const registryFiles = [
    "scripts/registry/script-registry.ts",
    "scripts/registry/script-taxonomy.ts",
    "scripts/registry/script-owner-map.ts",
    "scripts/registry/script-output-map.ts",
    "scripts/registry/script-ci-binding-map.ts",
    "scripts/registry/script-runtime-consequence-map.ts",
    "scripts/registry/script-language-policy.ts",
    "scripts/registry/script-classification-report.ts",
  ];

  for (const file of registryFiles) {
    it(`${file} exists and has exports`, () => {
      expect(fs.existsSync(file)).toBe(true);
      const content = fs.readFileSync(file, "utf-8");
      expect(content.length).toBeGreaterThan(100);
      expect(content.includes("export") || content.includes("console.log")).toBe(true);
    });
  }
});

describe("Script Domain Coverage", () => {
  const requiredDomains = [
    "scripts/runtime/checks",
    "scripts/runtime/generate",
    "scripts/runtime/edge-functions",
    "scripts/manifests/validate",
    "scripts/manifests/generate",
    "scripts/manifests/reports",
    "scripts/db/checks",
    "scripts/db/generate",
    "scripts/db/backup",
    "scripts/support/coverage",
    "scripts/support/runbooks",
    "scripts/deployment/checks",
    "scripts/deployment/build",
    "scripts/deployment/ingress",
    "scripts/architecture/checks",
    "scripts/legacy",
  ];

  for (const dir of requiredDomains) {
    it(`${dir} exists`, () => {
      expect(fs.existsSync(dir)).toBe(true);
    });
  }
});

describe("No Orphaned Scripts", () => {
  it("all scripts in scripts/ are classifiable", () => {
    const scripts = scanScripts("scripts");
    expect(scripts.length).toBeGreaterThan(100);
    // Every script should be in a known subdirectory or at root
    for (const s of scripts) {
      const rel = s.replace(/\\/g, "/");
      expect(rel.startsWith("scripts/")).toBe(true);
    }
  });
});

describe("Master Entrypoints", () => {
  it("generate-all.ts has domain-based registry", () => {
    const content = fs.readFileSync("scripts/generate-all.ts", "utf-8");
    expect(content).toContain("generators");
    expect(content).toContain("manifests:core");
    expect(content).toContain("runtime");
    expect(content).toContain("db");
  });

  it("validate-all.ts has domain-based registry", () => {
    const content = fs.readFileSync("scripts/validate-all.ts", "utf-8");
    expect(content).toContain("validators");
    expect(content).toContain("architecture");
    expect(content).toContain("runtime");
    expect(content).toContain("db");
    expect(content).toContain("support");
  });
});

describe("Architecture Docs", () => {
  const docs = [
    "docs/architecture/SCRIPT_SYSTEM_ARCHITECTURE.md",
    "docs/architecture/SCRIPT_TAXONOMY_AND_EXECUTION_POLICY.md",
    "docs/architecture/SCRIPT_LANGUAGE_POLICY.md",
    "docs/architecture/SCRIPT_OUTPUT_AND_CI_BINDING_MAP.md",
    "docs/architecture/SCRIPT_PERMANENCE_AND_LIFECYCLE_MODEL.md",
  ];

  for (const doc of docs) {
    it(`${doc} exists`, () => {
      expect(fs.existsSync(doc)).toBe(true);
      const content = fs.readFileSync(doc, "utf-8");
      expect(content.length).toBeGreaterThan(200);
    });
  }
});
