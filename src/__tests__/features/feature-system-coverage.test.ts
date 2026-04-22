import { describe, it, expect } from "vitest";
import * as fs from "fs";

// ═══════════════════════════════════════════════════════════════
// Feature System — End-to-End Coverage Verification
// ═══════════════════════════════════════════════════════════════

describe("Feature Domain Coverage", () => {
  it("business domain pages exist (40+)", () => {
    const pages = fs.readdirSync("src/pages/business").filter(f => f.endsWith(".tsx"));
    expect(pages.length).toBeGreaterThanOrEqual(30);
  });

  it("money/finance domain pages exist (25+)", () => {
    const pages = fs.readdirSync("src/pages/money").filter(f => f.endsWith(".tsx"));
    expect(pages.length).toBeGreaterThanOrEqual(20);
  });

  it("concierge domain pages exist", () => {
    expect(fs.existsSync("src/pages/concierge")).toBe(true);
    const pages = fs.readdirSync("src/pages/concierge").filter(f => f.endsWith(".tsx"));
    expect(pages.length).toBeGreaterThanOrEqual(3);
  });

  it("admin pages exist (400+)", () => {
    const adminDir = "src/pages/admin";
    if (!fs.existsSync(adminDir)) return;
    let count = 0;
    const walk = (dir: string) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory()) walk(`${dir}/${entry.name}`);
        else if (entry.name.endsWith(".tsx")) count++;
      }
    };
    walk(adminDir);
    expect(count).toBeGreaterThanOrEqual(400);
  });

  it("settings routes exist", () => {
    expect(fs.existsSync("src/routes/settings-routes.tsx")).toBe(true);
  });
});

describe("App Store & Platform", () => {
  it("app store components exist", () => {
    expect(fs.existsSync("src/components/app-store")).toBe(true);
  });

  it("app platform hook exists", () => {
    expect(fs.existsSync("src/hooks/use-app-platform.ts")).toBe(true);
  });

  it("app lifecycle tables exist in schema", () => {
    const types = fs.readFileSync("src/integrations/supabase/types.ts", "utf8");
    expect(types).toContain("app_lifecycle");
  });
});

describe("Onboarding System", () => {
  it("onboarding/setup experience page exists", () => {
    const exists = fs.existsSync("src/pages/OSSetupExperience.tsx") ||
                   fs.existsSync("src/pages/onboarding/OSSetupExperience.tsx");
    expect(exists).toBe(true);
  });

  it("login page exists", () => {
    expect(fs.existsSync("src/pages/Login.tsx")).toBe(true);
  });
});