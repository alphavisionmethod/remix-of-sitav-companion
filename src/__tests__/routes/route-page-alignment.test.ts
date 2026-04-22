import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROUTES_DIR = "src/routes";
const PAGES_DIR = "src/pages";

function extractLazyImports(code: string): string[] {
  const matches = code.match(/lazy\(\s*\(\)\s*=>\s*import\(["']([^"']+)["']\)/g) || [];
  return matches.map(m => {
    const match = m.match(/import\(["']([^"']+)["']\)/);
    return match ? match[1] : "";
  }).filter(Boolean);
}

describe("Route-Page Alignment", () => {
  const routeFiles = fs.readdirSync(ROUTES_DIR)
    .filter(f => f.endsWith(".tsx") || f.endsWith(".ts"))
    .map(f => path.join(ROUTES_DIR, f));

  it("route files exist", () => {
    expect(routeFiles.length).toBeGreaterThan(5);
  });

  it("all lazy imports resolve to existing page files", () => {
    const broken: string[] = [];
    for (const rf of routeFiles) {
      const code = fs.readFileSync(rf, "utf8");
      const imports = extractLazyImports(code);
      for (const imp of imports) {
        // Resolve @/pages/... or ../pages/...
        const resolved = imp.replace("@/", "src/");
        const candidates = [resolved + ".tsx", resolved + ".ts", resolved + "/index.tsx", resolved + "/index.ts"];
        const exists = candidates.some(c => fs.existsSync(c));
        if (!exists) broken.push(`${path.basename(rf)}: ${imp}`);
      }
    }
    expect(broken.length, `Broken lazy imports:\n${broken.slice(0, 20).join("\n")}`).toBe(0);
  });

  it("route files have path definitions", () => {
    const noRoutes: string[] = [];
    for (const rf of routeFiles) {
      const code = fs.readFileSync(rf, "utf8");
      if (!code.includes("path:") && !code.includes("path=") && !code.includes("<Route")) {
        noRoutes.push(path.basename(rf));
      }
    }
    expect(noRoutes.length, `Route files without path defs: ${noRoutes.join(", ")}`).toBe(0);
  });
});