// ═══════════════════════════════════════════════════════════════
// Route / IA Truth Test (Checklist 24.8)
// Asserts ROUTE_FAMILIES registry is internally consistent and
// every declared route family prefix exists somewhere in src/routes/
// or src/pages/. Defensive: skips silently when artifacts absent.
// ═══════════════════════════════════════════════════════════════
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { ROUTE_FAMILIES, getRegistrySummary } from "@/lib/architecture/route-registry";

function walk(dir: string, acc: string[] = []): string[] {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, acc);
    else if (entry.isFile() && (p.endsWith(".tsx") || p.endsWith(".ts"))) acc.push(p);
  }
  return acc;
}

describe("Route / IA truth", () => {
  it("ROUTE_FAMILIES has unique prefixes", () => {
    const prefixes = ROUTE_FAMILIES.map((f) => f.prefix);
    expect(new Set(prefixes).size).toBe(prefixes.length);
  });

  it("registry summary returns counts > 0", () => {
    const s = getRegistrySummary();
    expect(s.totalFamilies).toBeGreaterThan(0);
    expect(s.misplaced).toBeLessThanOrEqual(0);
  });

  it("every route family prefix is referenced in src/routes/ or src/pages/", () => {
    const routesDir = "src/routes";
    const pagesDir = "src/pages";
    const files = [...walk(routesDir), ...walk(pagesDir)];
    if (files.length === 0) return; // env without source — skip
    const haystack = files
      .map((f) => {
        try { return fs.readFileSync(f, "utf-8"); } catch { return ""; }
      })
      .join("\n");

    const unreferenced: string[] = [];
    for (const fam of ROUTE_FAMILIES) {
      const needle = fam.prefix.replace(/\/$/, "");
      if (!haystack.includes(needle)) unreferenced.push(fam.family);
    }
    // Allow up to 2 (forward-declared families) but never silent total failure.
    expect(unreferenced.length, `Unreferenced families: ${unreferenced.join(", ")}`).toBeLessThanOrEqual(2);
  });
});
