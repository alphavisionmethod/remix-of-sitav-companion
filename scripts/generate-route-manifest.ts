#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Route Manifest Generator
// Parses App.tsx to extract all <Route> definitions
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";

const appPath = path.join(process.cwd(), "src/App.tsx");
const content = fs.readFileSync(appPath, "utf-8");

interface RouteEntry { path: string; component: string; domain: string; owner: string }
const routes: RouteEntry[] = [];

// Owner derivation from route path prefix
function deriveOwner(routePath: string): string {
  const seg = routePath.split("/").filter(Boolean)[0] || "root";
  const ownerMap: Record<string, string> = {
    business: "business-os", money: "finance-os", finance: "finance-os",
    concierge: "concierge-os", admin: "platform-admin", operator: "platform-admin",
    intelligence: "brain-core", brain: "brain-core", ai: "brain-core",
    auth: "identity", login: "identity", signup: "identity",
    settings: "platform-admin", system: "platform-admin",
    boardroom: "business-os", workforce: "brain-core",
    advisor: "brain-core", connectors: "connector-control-plane",
    files: "document-engine", documents: "document-engine",
    grocery: "concierge-os", errands: "concierge-os", travel: "concierge-os",
    gifts: "concierge-os", school: "concierge-os", appointments: "concierge-os",
  };
  return ownerMap[seg] || seg;
}

const re = /<Route\s+path="([^"]+)"\s+element=\{<(\w+)\s/g;
let m: RegExpExecArray | null;
while ((m = re.exec(content)) !== null) {
  const routePath = m[1];
  const component = m[2];
  const domain = routePath.split("/")[1] || "root";
  routes.push({ path: routePath, component, domain, owner: deriveOwner(routePath) });
}

const manifest = {
  version: "2.2.0",
  generatedAt: new Date().toISOString(),
  totalRoutes: routes.length,
  ownerDistribution: routes.reduce((acc, r) => { acc[r.owner] = (acc[r.owner] || 0) + 1; return acc; }, {} as Record<string, number>),
  routes,
};

const outPath = path.join(process.cwd(), "generated/route-manifest.json");
fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2));
console.log(`✅ Generated route manifest: ${routes.length} routes → ${outPath}`);
