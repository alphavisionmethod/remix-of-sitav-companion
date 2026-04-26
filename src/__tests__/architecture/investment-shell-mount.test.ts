// ═══════════════════════════════════════════════════════════════
// Architecture Test — Investment Office Shell-Mount (Phase 6)
//
// Locks in the App-in-OS pattern: both `getInvestmentRoutes()`
// and `getInvestmentOfficeRoutes()` must render as children of a
// single `<Route element={<InvestmentShellPage />}>` parent so
// every `/investment/*` path gets the shared workspace chrome.
// Asserts via static source inspection (matches the convention
// in src/__tests__/routes/route-family-completeness.test.ts).
// ═══════════════════════════════════════════════════════════════
import { describe, it, expect } from "vitest";
import * as fs from "node:fs";

const APP_PATH = "src/App.tsx";
const SHELL_PATH = "src/modules/finance/pages/investment-office/InvestmentShellPage.tsx";

describe("Investment Office shell-mount", () => {
  it("App.tsx and shell file exist", () => {
    expect(fs.existsSync(APP_PATH)).toBe(true);
    // Either the canonical module path OR its compatibility shim must resolve.
    const shimPath = "src/pages/investment-office/InvestmentShellPage.tsx";
    expect(fs.existsSync(SHELL_PATH) || fs.existsSync(shimPath)).toBe(true);
  });

  it("App.tsx imports InvestmentShellPage", () => {
    const src = fs.readFileSync(APP_PATH, "utf8");
    expect(src).toMatch(/import\s+InvestmentShellPage\s+from\s+["'][^"']*InvestmentShellPage["']/);
  });

  it("App.tsx wraps both investment route families under a single shell parent <Route>", () => {
    const src = fs.readFileSync(APP_PATH, "utf8");

    // Locate the parent <Route element={<InvestmentShellPage ... />}> opening tag.
    const parentOpenRx = /<Route\s+element=\{<InvestmentShellPage\s*\/?>\}\s*>/;
    const openMatch = src.match(parentOpenRx);
    expect(openMatch, "expected <Route element={<InvestmentShellPage />}> parent in App.tsx").not.toBeNull();

    const openIdx = openMatch!.index!;
    // Find the matching closing </Route> after the opening tag.
    const closeIdx = src.indexOf("</Route>", openIdx);
    expect(closeIdx, "expected closing </Route> for the InvestmentShellPage parent").toBeGreaterThan(openIdx);

    const inner = src.slice(openIdx, closeIdx);
    expect(inner).toContain("getInvestmentRoutes()");
    expect(inner).toContain("getInvestmentOfficeRoutes()");
  });

  it("InvestmentShellPage renders an <Outlet /> for child routes", () => {
    // Resolve whichever path actually carries the implementation.
    const candidatePaths = [
      SHELL_PATH,
      "src/pages/investment-office/InvestmentShellPage.tsx",
    ];
    let resolved: string | undefined;
    let body = "";
    for (const p of candidatePaths) {
      if (!fs.existsSync(p)) continue;
      const content = fs.readFileSync(p, "utf8");
      // A 3-line re-export shim is fine — follow it to the canonical module.
      const reExport = content.match(/export\s+\{\s*default\s*\}\s+from\s+["']([^"']+)["']/);
      if (reExport) {
        // Resolve `@/modules/...` shorthand against src/.
        const target = reExport[1].replace(/^@\//, "src/") + ".tsx";
        if (fs.existsSync(target)) {
          resolved = target;
          body = fs.readFileSync(target, "utf8");
          break;
        }
      }
      resolved = p;
      body = content;
      break;
    }
    expect(resolved, "could not resolve InvestmentShellPage source").toBeDefined();
    expect(body).toMatch(/<Outlet\s*\/?>/);
  });
});
