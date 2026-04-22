import { describe, it, expect } from "vitest";
import * as fs from "fs";

// ═══════════════════════════════════════════════════════════════
// Deploy / CI / Release — Integrity Verification
// ═══════════════════════════════════════════════════════════════

describe("CI Pipeline Integrity", () => {
  it("package.json has verify script", () => {
    const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
    expect(pkg.scripts["verify"]).toBeDefined();
  });

  it("verify script runs typecheck, test, and build", () => {
    const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
    const cmd = pkg.scripts["verify"] || "";
    expect(cmd).toContain("typecheck");
    expect(cmd).toContain("test");
    expect(cmd).toContain("build");
  });

  it("deployment readiness gate test exists", () => {
    expect(fs.existsSync("src/__tests__/deployment/deployment-readiness-gate.test.ts")).toBe(true);
  });

  it("vite config exists", () => {
    expect(fs.existsSync("vite.config.ts")).toBe(true);
  });

  it("tsconfig exists", () => {
    expect(fs.existsSync("tsconfig.json") || fs.existsSync("tsconfig.app.json")).toBe(true);
  });

  it("vitest config exists", () => {
    expect(fs.existsSync("vitest.config.ts")).toBe(true);
  });
});

describe("Validator Scripts", () => {
  const validatorDir = "scripts/validators";

  it("validator directory has 5+ scripts", () => {
    const scripts = fs.readdirSync(validatorDir).filter(f => f.endsWith(".sh"));
    expect(scripts.length).toBeGreaterThanOrEqual(5);
  });

  it("all validator scripts are executable shell scripts", () => {
    const scripts = fs.readdirSync(validatorDir).filter(f => f.endsWith(".sh"));
    for (const s of scripts) {
      const content = fs.readFileSync(`${validatorDir}/${s}`, "utf8");
      expect(content.startsWith("#!/"), `${s} missing shebang`).toBe(true);
    }
  });

  it("critical validators exist", () => {
    const required = [
      "check-page-completeness.sh",
      "check-no-as-any-pages.sh",
      "check-orphan-pages.sh",
    ];
    for (const v of required) {
      expect(fs.existsSync(`${validatorDir}/${v}`), `Missing: ${v}`).toBe(true);
    }
  });
});