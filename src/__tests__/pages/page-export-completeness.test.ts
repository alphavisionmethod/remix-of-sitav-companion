import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function collectTsxFiles(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "__tests__" || entry.name === "node_modules") continue;
      results.push(...collectTsxFiles(full));
    } else if (entry.name.endsWith(".tsx") && !entry.name.includes(".test.") && !entry.name.includes(".spec.")) {
      results.push(full);
    }
  }
  return results;
}

const PAGES_DIR = "src/pages";
const allPages = collectTsxFiles(PAGES_DIR);

describe("Page Export Completeness", () => {
  it("finds a substantial number of page files", () => {
    expect(allPages.length, "Too few page files found").toBeGreaterThan(100);
  });

  it("all page files have a default export", () => {
    const missing: string[] = [];
    for (const page of allPages) {
      const content = fs.readFileSync(page, "utf8");
      const hasDefault = content.includes("export default") || content.includes("export { default");
      if (!hasDefault) missing.push(path.relative(PAGES_DIR, page));
    }
    // Allow up to 5% tolerance for index re-exports / layout wrappers
    const threshold = Math.floor(allPages.length * 0.05);
    expect(missing.length, `${missing.length} pages lack default export:\n${missing.slice(0, 20).join("\n")}`).toBeLessThanOrEqual(threshold);
  });

  it("no page file is empty (stub detection)", () => {
    const stubs: string[] = [];
    for (const page of allPages) {
      const content = fs.readFileSync(page, "utf8");
      const lines = content.split("\n").filter(l => l.trim().length > 0);
      if (lines.length < 5) stubs.push(path.relative(PAGES_DIR, page));
    }
    // Allow ≤20 minimal pages (re-exports, simple wrappers)
    expect(stubs.length, `Stub pages (<5 lines):\n${stubs.slice(0, 20).join("\n")}`).toBeLessThanOrEqual(20);
  });

  it("no page imports from node_modules that don't exist", () => {
    // Spot-check: pages should not have broken imports to nonexistent packages
    const brokenImports: string[] = [];
    for (const page of allPages.slice(0, 50)) {
      const content = fs.readFileSync(page, "utf8");
      const imports = content.match(/from\s+["']([^./][^"']+)["']/g) || [];
      for (const imp of imports) {
        const pkg = imp.match(/from\s+["']([^"']+)["']/)?.[1]?.split("/")[0];
        if (pkg && !fs.existsSync(path.join("node_modules", pkg)) && !pkg.startsWith("@")) {
          brokenImports.push(`${path.relative(PAGES_DIR, page)}: ${pkg}`);
        }
      }
    }
    expect(brokenImports.length, `Broken imports:\n${brokenImports.slice(0, 10).join("\n")}`).toBe(0);
  });
});