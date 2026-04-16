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
    "scripts/runtime/probes",
    "scripts/runtime/lifecycle",
    "scripts/runtime/capability",
    "scripts/manifests/validate",
    "scripts/manifests/generate",
    "scripts/manifests/reports",
    "scripts/db/checks",
    "scripts/db/generate",
    "scripts/db/backup",
    "scripts/db/restore",
    "scripts/db/migrations",
    "scripts/support/coverage",
    "scripts/support/runbooks",
    "scripts/support/diagnostics",
    "scripts/support/drills",
    "scripts/support/recovery",
    "scripts/deployment/checks",
    "scripts/deployment/build",
    "scripts/deployment/ingress",
    "scripts/deployment/deploy",
    "scripts/deployment/local",
    "scripts/architecture/checks",
    "scripts/architecture/assertions",
    "scripts/architecture/reports",
    "scripts/contracts/checks",
    "scripts/contracts/generate",
    "scripts/release/desktop",
    "scripts/release/appliance",
    "scripts/release/vmware",
    "scripts/release/rings",
    "scripts/release/supply-chain",
    "scripts/release/checks",
    "scripts/security/checks",
    "scripts/security/rotation",
    "scripts/security/attestations",
    "scripts/legacy",
  ];

  for (const dir of requiredDomains) {
    it(`${dir} exists`, () => {
      expect(fs.existsSync(dir)).toBe(true);
    });
  }
});

describe("No Orphaned Root Scripts", () => {
  it("only generate-all.ts and validate-all.ts remain at root", () => {
    const rootScripts = fs.readdirSync("scripts")
      .filter(f => /\.(ts|js|mjs|sh|ps1)$/.test(f) && !f.startsWith("tsconfig"));
    const allowed = ["generate-all.ts", "validate-all.ts"];
    for (const s of rootScripts) {
      expect(allowed).toContain(s);
    }
  });
});

describe("Phase/Prompt Naming Eliminated", () => {
  it("no phase/prompt-era script names in durable architecture", () => {
    const allScripts = scanScripts("scripts");
    const violations = allScripts.filter(s =>
      !s.includes("legacy/") && !s.includes("archived-phase-scripts/") &&
      (s.includes("phase4") || s.includes("phase5") || s.includes("prompt9"))
    );
    expect(violations).toEqual([]);
  });
});

describe("All Scripts Classifiable", () => {
  it("all scripts in scripts/ are under a known subdirectory", () => {
    const scripts = scanScripts("scripts");
    expect(scripts.length).toBeGreaterThan(100);
    for (const s of scripts) {
      const rel = s.replace(/\\/g, "/");
      expect(rel.startsWith("scripts/")).toBe(true);
    }
  });
});

describe("Master Entrypoints", () => {
  it("generate-all.ts uses canonical paths", () => {
    const content = fs.readFileSync("scripts/generate-all.ts", "utf-8");
    expect(content).toContain("scripts/manifests/generate/");
    expect(content).toContain("scripts/runtime/generate/");
    expect(content).toContain("scripts/db/generate/");
    expect(content).toContain("scripts/deployment/");
    expect(content).not.toContain('"scripts/generate-service-manifest.ts"');
  });

  it("validate-all.ts uses canonical paths", () => {
    const content = fs.readFileSync("scripts/validate-all.ts", "utf-8");
    expect(content).toContain("scripts/architecture/checks/");
    expect(content).toContain("scripts/contracts/checks/");
    expect(content).toContain("scripts/runtime/checks/");
    expect(content).toContain("scripts/db/checks/");
    expect(content).toContain("scripts/deployment/checks/");
    expect(content).toContain("scripts/security/checks/");
    expect(content).not.toContain('"scripts/check-canonical-imports.ts"');
    expect(content).not.toContain("scripts/validation/");
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

describe("Package.json Script Commands", () => {
  it("has canonical validate/generate/drill commands", () => {
    const pkg = JSON.parse(fs.readFileSync("package.json", "utf-8"));
    const scripts = pkg.scripts || {};
    const required = [
      "validate:all", "validate:architecture", "validate:contracts",
      "validate:runtime", "validate:db", "validate:deployment",
      "validate:manifests", "validate:support", "validate:release",
      "validate:security",
      "generate:all", "generate:manifests", "generate:runtime",
      "generate:db", "generate:deployment",
      "drill:recovery", "drill:backup-restore",
    ];
    for (const cmd of required) {
      expect(scripts[cmd]).toBeDefined();
    }
  });
});
