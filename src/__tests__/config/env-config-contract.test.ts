import { describe, it, expect } from "vitest";
import * as fs from "fs";

describe("Environment & Config Contract", () => {
  describe(".env file", () => {
    it("exists", () => {
      expect(fs.existsSync(".env")).toBe(true);
    });

    it("contains required VITE_ variables", () => {
      const content = fs.readFileSync(".env", "utf8");
      const required = ["VITE_SUPABASE_URL", "VITE_SUPABASE_PUBLISHABLE_KEY", "VITE_SUPABASE_PROJECT_ID"];
      const missing = required.filter(v => !content.includes(v));
      expect(missing, `Missing env vars: ${missing.join(", ")}`).toHaveLength(0);
    });

    it("no empty VITE_ values", () => {
      const content = fs.readFileSync(".env", "utf8");
      const lines = content.split("\n").filter(l => l.startsWith("VITE_"));
      const empty = lines.filter(l => {
        const val = l.split("=")[1]?.replace(/["']/g, "").trim();
        return !val || val.length === 0;
      });
      expect(empty.length, `Empty VITE_ vars:\n${empty.join("\n")}`).toBe(0);
    });
  });

  describe("supabase config", () => {
    it("config.toml has valid project_id format", () => {
      const content = fs.readFileSync("supabase/config.toml", "utf8");
      const match = content.match(/project_id\s*=\s*"([^"]+)"/);
      expect(match).not.toBeNull();
      expect(match![1].length).toBeGreaterThan(10);
    });
  });

  describe("no hardcoded secrets in source", () => {
    it("no hardcoded supabase service role keys in src/", () => {
      const check = (dir: string): string[] => {
        const violations: string[] = [];
        if (!fs.existsSync(dir)) return violations;
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
          if (entry.name === "node_modules" || entry.name === ".git") continue;
          const full = `${dir}/${entry.name}`;
          if (entry.isDirectory()) {
            violations.push(...check(full));
          } else if (entry.name.match(/\.(ts|tsx)$/) && !entry.name.includes(".test.")) {
            const content = fs.readFileSync(full, "utf8");
            if (content.includes("service_role") && content.match(/eyJ[A-Za-z0-9_-]{20,}/)) {
              violations.push(full);
            }
          }
        }
        return violations;
      };
      const violations = check("src");
      expect(violations, `Hardcoded keys in: ${violations.join(", ")}`).toHaveLength(0);
    });
  });

  describe("TypeScript config completeness", () => {
    it("tsconfig.app.json has vitest/globals type", () => {
      const config = JSON.parse(fs.readFileSync("tsconfig.app.json", "utf8"));
      expect(config.compilerOptions?.types).toContain("vitest/globals");
    });

    it("tsconfig has skipLibCheck enabled", () => {
      const config = JSON.parse(fs.readFileSync("tsconfig.json", "utf8"));
      expect(config.compilerOptions?.skipLibCheck).toBe(true);
    });
  });
});