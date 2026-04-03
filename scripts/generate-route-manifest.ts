#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Route Manifest Generator
// Parses App.tsx to extract all <Route> definitions
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";

const appPath = path.join(process.cwd(), "src/App.tsx");
const content = fs.readFileSync(appPath, "utf-8");

interface RouteEntry { path: string; component: string; domain: string }
const routes: RouteEntry[] = [];

const re = /<Route\s+path="([^"]+)"\s+element=\{<(\w+)\s/g;
let m: RegExpExecArray | null;
while ((m = re.exec(content)) !== null) {
  const routePath = m[1];
  const component = m[2];
  const domain = routePath.split("/")[1] || "root";
  routes.push({ path: routePath, component, domain });
}

const manifest = {
  version: "2.1.0",
  generatedAt: new Date().toISOString(),
  totalRoutes: routes.length,
  routes,
};

const outPath = path.join(process.cwd(), "generated/route-manifest.json");
fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2));
console.log(`✅ Generated route manifest: ${routes.length} routes → ${outPath}`);
