import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

describe("Deployment Readiness Gate", () => {
  describe("required config files", () => {
    const required = [
      "package.json", "tsconfig.json", "tsconfig.app.json",
      "vite.config.ts", "vitest.config.ts", "supabase/config.toml",
      "tailwind.config.ts", "index.html",
    ];
    for (const f of required) {
      it(`${f} exists`, () => {
        expect(fs.existsSync(f), `Missing: ${f}`).toBe(true);
      });
    }
  });

  describe("package.json CI scripts", () => {
    const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
    const required = ["build", "test", "typecheck", "lint", "ci", "pre-deploy"];
    for (const s of required) {
      it(`has "${s}" script`, () => {
        expect(pkg.scripts?.[s], `Missing script: ${s}`).toBeDefined();
      });
    }
  });

  describe("TypeScript config integrity", () => {
    it("tsconfig.json parses correctly", () => {
      const content = fs.readFileSync("tsconfig.json", "utf8");
      expect(() => JSON.parse(content)).not.toThrow();
    });

    it("tsconfig.app.json parses correctly", () => {
      const content = fs.readFileSync("tsconfig.app.json", "utf8");
      expect(() => JSON.parse(content)).not.toThrow();
    });

    it("tsconfig has path aliases", () => {
      const tsconfig = JSON.parse(fs.readFileSync("tsconfig.json", "utf8"));
      expect(tsconfig.compilerOptions?.paths?.["@/*"]).toBeDefined();
    });
  });

  describe("supabase/config.toml integrity", () => {
    it("exists and has project_id", () => {
      const content = fs.readFileSync("supabase/config.toml", "utf8");
      expect(content).toContain("project_id");
    });
  });

  describe("generated artifacts", () => {
    it("generated/ directory exists", () => {
      expect(fs.existsSync("generated"), "generated/ directory missing").toBe(true);
    });

    it("generated artifacts are valid JSON where present", () => {
      if (!fs.existsSync("generated")) return;
      const jsonFiles = fs.readdirSync("generated", { recursive: true })
        .filter(f => String(f).endsWith(".json"));
      const broken: string[] = [];
      for (const f of jsonFiles) {
        try {
          JSON.parse(fs.readFileSync(path.join("generated", String(f)), "utf8"));
        } catch {
          broken.push(String(f));
        }
      }
      expect(broken.length, `Broken JSON: ${broken.join(", ")}`).toBe(0);
    });
  });

  describe("build system integrity", () => {
    it("vite.config.ts exists and references react", () => {
      const content = fs.readFileSync("vite.config.ts", "utf8");
      expect(content).toContain("react");
    });

    it("index.html exists and has root div", () => {
      const content = fs.readFileSync("index.html", "utf8");
      expect(content).toContain("root");
    });
  });
});