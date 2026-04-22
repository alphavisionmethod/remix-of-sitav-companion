import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const PAGES_DIR = "src/pages";
const DESIGN_TOKENS = [
  "SitaPageHeader", "AppSurface", "HeroCard", "StatusCard", "SitaCard",
  "PageTruthBanner", "ExecutionBadge", "StatusBadge", "SitaEmptyState",
  "MobileShell", "PageSkeleton", "motion.div", "animate-fade-in",
  "bg-background", "bg-card", "text-foreground", "text-muted-foreground",
  "bg-primary", "text-primary", "border-border", "rounded-xl", "rounded-lg",
];

function getAllPages(dir: string): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...getAllPages(full));
    else if (entry.name.endsWith(".tsx") && !entry.name.includes(".test.")) results.push(full);
  }
  return results;
}

describe("Page Design System Coverage", () => {
  const pages = getAllPages(PAGES_DIR);

  it("should find pages", () => {
    expect(pages.length).toBeGreaterThan(100);
  });

  it("pages above 50 lines use at least one design system primitive", () => {
    const violations: string[] = [];
    for (const p of pages) {
      const code = fs.readFileSync(p, "utf8");
      const lines = code.split("\n").length;
      if (lines <= 50) continue;
      const usesToken = DESIGN_TOKENS.some(t => code.includes(t));
      if (!usesToken) violations.push(path.relative(PAGES_DIR, p));
    }
    // Allow up to 5% violation rate for specialized pages
    const rate = violations.length / pages.length;
    expect(rate).toBeLessThan(0.05);
  });
});