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

// ── IA domain classification ────────────────────────────────────

function classifyIADomain(routePath: string): string {
  if (routePath.startsWith("/admin/ai-runtime")) return "admin-ai-runtime";
  if (routePath.startsWith("/admin/trust-security")) return "admin-trust-security";
  if (routePath.startsWith("/admin/integrations")) return "admin-integrations";
  if (routePath.startsWith("/admin/health")) return "admin-health";
  if (routePath.startsWith("/admin/releases")) return "admin-releases";
  if (routePath.startsWith("/admin/verification")) return "admin-verification";
  if (routePath.startsWith("/admin/config")) return "admin-config";
  if (routePath.startsWith("/admin/support")) return "admin-support";
  if (routePath.startsWith("/admin/users")) return "admin-users";
  if (routePath.startsWith("/admin")) return "admin-overview";
  if (routePath.startsWith("/business")) return "business";
  if (routePath.startsWith("/money")) return "money";
  if (routePath.startsWith("/concierge")) return "concierge";
  if (routePath.startsWith("/boardroom")) return "boardroom";
  if (routePath.startsWith("/files")) return "files";
  if (routePath.startsWith("/settings")) return "settings";
  if (routePath.startsWith("/investments") || routePath.startsWith("/investment-office")) return "investments";
  if (routePath.startsWith("/revenue-office")) return "revenue-office";
  if (routePath.startsWith("/digital-presence")) return "digital-presence";
  if (routePath.startsWith("/desktop") || routePath === "/") return "desktop";
  return "other";
}

const manifest = {
  version: "3.0.0",
  generatedAt: new Date().toISOString(),
  totalRoutes: routes.length,
  ownerDistribution: routes.reduce((acc, r) => { acc[r.owner] = (acc[r.owner] || 0) + 1; return acc; }, {} as Record<string, number>),
  iaDomainDistribution: routes.reduce((acc, r) => {
    const d = classifyIADomain(r.path);
    acc[d] = (acc[d] || 0) + 1;
    return acc;
  }, {} as Record<string, number>),
  routes: routes.map(r => ({ ...r, iaDomain: classifyIADomain(r.path) })),
};

const outPath = path.join(process.cwd(), "generated/route-manifest.json");
fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2));
console.log(`✅ Generated route manifest: ${routes.length} routes → ${outPath}`);
