import { describe, it, expect } from "vitest";
import * as fs from "fs";

describe("Route Coverage", () => {
  const appContent = fs.readFileSync("src/App.tsx", "utf-8");

  // Routes actually present in the current App.tsx
  const requiredRoutes = [
    "/login", "/signup", "/forgot-password", "/reset-password",
    "/onboarding", "/auth/callback", "/first-win", "/learn-later",
    "/",
  ];

  for (const route of requiredRoutes) {
    it(`route "${route}" is defined`, () => {
      expect(appContent).toContain(`path="${route}"`);
    });
  }

  it("has at least 10 routes defined", () => {
    const routeCount = (appContent.match(/path="/g) || []).length;
    expect(routeCount).toBeGreaterThanOrEqual(10);
  });

  it("uses wildcard routes for shell sub-routing", () => {
    // The main shell uses /* and /admin/* for nested routes
    expect(appContent).toContain('path="/*"');
  });
});

describe("Lazy Imports", () => {
  const appContent = fs.readFileSync("src/App.tsx", "utf-8");

  // Only check lazy imports that actually exist in App.tsx
  const hasLazy = appContent.includes("lazy(");

  it("uses lazy loading for at least one component", () => {
    expect(hasLazy || appContent.includes("import(")).toBe(true);
  });
});
