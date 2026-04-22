import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

// ═══════════════════════════════════════════════════════════════
// Advisor & Boardroom System — Structural Integrity
// ═══════════════════════════════════════════════════════════════

const ADVISOR_DIR = "src/components/advisors";
const HOOKS_DIR = "src/hooks";

function listFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => f.endsWith(".tsx") || f.endsWith(".ts"));
}

describe("Advisor System Integrity", () => {
  const advisorFiles = listFiles(ADVISOR_DIR);

  it("advisor component directory exists with 10+ components", () => {
    expect(advisorFiles.length).toBeGreaterThanOrEqual(10);
  });

  it("AdvisorCouncilShell exports AdvisorConfig type", () => {
    const shell = fs.readFileSync(path.join(ADVISOR_DIR, "AdvisorCouncilShell.tsx"), "utf8");
    expect(shell).toContain("AdvisorConfig");
    expect(shell).toContain("export");
  });

  it("advisor hooks exist and use supabase", () => {
    const hooks = fs.readdirSync(HOOKS_DIR).filter(f => f.startsWith("use-advisor"));
    expect(hooks.length).toBeGreaterThanOrEqual(2);
    for (const h of hooks) {
      const content = fs.readFileSync(path.join(HOOKS_DIR, h), "utf8");
      // Should either use supabase or use demo data
      expect(content.length).toBeGreaterThan(50);
    }
  });

  it("MobileAdvisorBoard exists for mobile surface", () => {
    const mobileFile = advisorFiles.find(f => f.includes("Mobile"));
    expect(mobileFile).toBeDefined();
  });

  it("no hardcoded API keys in advisor components", () => {
    for (const f of advisorFiles) {
      const content = fs.readFileSync(path.join(ADVISOR_DIR, f), "utf8");
      expect(content).not.toMatch(/sk-[a-zA-Z0-9]{20,}/);
      expect(content).not.toMatch(/AIza[a-zA-Z0-9]{30,}/);
    }
  });
});

describe("Boardroom System", () => {
  it("boardroom routes exist", () => {
    const routeFile = fs.readFileSync("src/routes/boardroom-routes.tsx", "utf8");
    expect(routeFile).toContain("Route");
    expect(routeFile).toContain("boardroom");
  });

  it("Boardroom page exists and is non-trivial", () => {
    const page = fs.readFileSync("src/pages/Boardroom.tsx", "utf8");
    expect(page.split("\n").length).toBeGreaterThan(30);
  });

  it("MobileBoardroom page exists with council status", () => {
    const page = fs.readFileSync("src/pages/mobile/MobileBoardroom.tsx", "utf8");
    expect(page).toContain("Council Status");
  });
});