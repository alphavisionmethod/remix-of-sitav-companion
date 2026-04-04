#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Shell Space Registry Generator
// Reads shell-space-routing ROUTE_MAP and outputs space→route→capability
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";

const routingSource = fs.readFileSync("src/lib/services/capability-router/shell-space-routing.service.ts", "utf-8");

// Parse ROUTE_MAP entries
const routePattern = /\{\s*capabilityId:\s*"([^"]+)",\s*section:\s*"([^"]+)",\s*path:\s*"([^"]+)",\s*panelType:\s*"([^"]+)",\s*deepLinkable:\s*(true|false)\s*\}/g;
const routes: { capabilityId: string; section: string; path: string; panelType: string; deepLinkable: boolean }[] = [];

for (const match of routingSource.matchAll(routePattern)) {
  routes.push({
    capabilityId: match[1],
    section: match[2],
    path: match[3],
    panelType: match[4],
    deepLinkable: match[5] === "true",
  });
}

// Group by section (shell space)
const spaces: Record<string, typeof routes> = {};
for (const r of routes) {
  if (!spaces[r.section]) spaces[r.section] = [];
  spaces[r.section].push(r);
}

const spaceEntries = Object.entries(spaces).map(([section, sectionRoutes]) => ({
  section,
  totalRoutes: sectionRoutes.length,
  deepLinkableCount: sectionRoutes.filter(r => r.deepLinkable).length,
  routes: sectionRoutes,
}));

const out = {
  version: "1.0.0",
  generatedAt: new Date().toISOString(),
  totalSpaces: spaceEntries.length,
  totalRoutes: routes.length,
  spaces: spaceEntries,
};

fs.writeFileSync("generated/shell-space-registry.json", JSON.stringify(out, null, 2));
console.log(`✅ Generated shell space registry: ${spaceEntries.length} spaces, ${routes.length} routes`);
