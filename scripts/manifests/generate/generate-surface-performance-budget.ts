#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Surface Performance Budget Generator
// LCP/FCP/bundle size budgets per route
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";

const routeManifest = JSON.parse(fs.readFileSync("generated/route-manifest.json", "utf-8"));
const routes: { path: string; component: string; section?: string }[] = routeManifest.routes || [];

// Assign performance budgets by route criticality
function getBudget(routePath: string): { lcpMs: number; fcpMs: number; bundleKb: number; ttiMs: number } {
  if (routePath === "/" || routePath === "/login" || routePath === "/signup") {
    return { lcpMs: 1500, fcpMs: 800, bundleKb: 150, ttiMs: 2000 };
  }
  if (routePath.includes("/setup") || routePath.includes("/onboarding")) {
    return { lcpMs: 2000, fcpMs: 1000, bundleKb: 200, ttiMs: 2500 };
  }
  if (routePath.includes("/admin") || routePath.includes("/diagnostics")) {
    return { lcpMs: 3000, fcpMs: 1500, bundleKb: 400, ttiMs: 4000 };
  }
  if (routePath.includes("/boardroom")) {
    return { lcpMs: 2500, fcpMs: 1200, bundleKb: 350, ttiMs: 3500 };
  }
  return { lcpMs: 2000, fcpMs: 1000, bundleKb: 250, ttiMs: 3000 };
}

const budgets = routes.map(route => ({
  path: route.path,
  component: route.component,
  section: route.section || "unknown",
  budget: getBudget(route.path),
  priority: route.path === "/" || route.path === "/login" ? "critical" : route.path.includes("/admin") ? "low" : "standard",
}));

const out = {
  version: "1.0.0",
  generatedAt: new Date().toISOString(),
  totalRoutes: budgets.length,
  budgets,
};

fs.writeFileSync("generated/surface-performance-budget.json", JSON.stringify(out, null, 2));
console.log(`✅ Generated surface performance budgets: ${budgets.length} routes`);
