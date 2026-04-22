import { describe, it, expect } from "vitest";
import * as fs from "fs";

// ═══════════════════════════════════════════════════════════════
// Route Families — Completeness & Structural Verification
// ═══════════════════════════════════════════════════════════════

const ROUTE_DIR = "src/routes";

describe("Route Family Completeness", () => {
  const routeFiles = fs.readdirSync(ROUTE_DIR).filter(f => f.endsWith(".tsx"));

  it("has 14+ route family files", () => {
    expect(routeFiles.length).toBeGreaterThanOrEqual(14);
  });

  it("all critical route families exist", () => {
    const required = [
      "AdminRoutes", "MobileRoutes", "OwnerRoutes",
      "business-routes", "money-routes", "concierge-routes",
      "boardroom-routes", "advisor-routes", "apps-routes",
      "settings-routes", "files-routes",
    ];
    for (const name of required) {
      expect(routeFiles.some(f => f.includes(name)), `Missing route family: ${name}`).toBe(true);
    }
  });

  it("every route file imports Route from react-router-dom", () => {
    const broken: string[] = [];
    for (const f of routeFiles) {
      const content = fs.readFileSync(`${ROUTE_DIR}/${f}`, "utf8");
      if (!content.includes("Route") || !content.includes("react-router")) {
        broken.push(f);
      }
    }
    expect(broken, `Route files without react-router: ${broken.join(", ")}`).toEqual([]);
  });

  it("AdminRoutes uses permission gating", () => {
    const content = fs.readFileSync(`${ROUTE_DIR}/AdminRoutes.tsx`, "utf8");
    expect(content.toLowerCase()).toMatch(/gated|permission|protected/);
  });

  it("no route file contains hardcoded credentials", () => {
    for (const f of routeFiles) {
      const content = fs.readFileSync(`${ROUTE_DIR}/${f}`, "utf8");
      expect(content).not.toMatch(/password\s*[:=]\s*["'][^"']+["']/i);
    }
  });
});