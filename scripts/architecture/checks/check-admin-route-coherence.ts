#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin Route Coherence Check
// Validates admin routes are consistent and non-overlapping
// ═══════════════════════════════════════════════════════════════

import { ViolationCollector, scanDir } from "../lib/utils";
import * as fs from "fs";

const vc = new ViolationCollector();

const routeFiles = scanDir("src/routes", [".tsx", ".ts"]);
const adminRoutes: string[] = [];

for (const file of routeFiles) {
  const content = fs.readFileSync(file, "utf-8");
  const pathMatches = content.match(/path:\s*["']([^"']+)["']/g) || [];
  for (const match of pathMatches) {
    const pathValue = match.match(/["']([^"']+)["']/)?.[1];
    if (pathValue?.includes("admin")) {
      adminRoutes.push(pathValue);
    }
  }
}

console.log(`  🛤️ ${adminRoutes.length} admin routes found`);

// Check for duplicates
const seen = new Set<string>();
for (const route of adminRoutes) {
  if (seen.has(route)) {
    vc.add("admin-routes", "duplicate-route", `Duplicate admin route: ${route}`);
  }
  seen.add(route);
}

vc.report("check-admin-route-coherence");
vc.exitIfErrors();
