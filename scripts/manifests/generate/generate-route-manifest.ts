#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Route Manifest Generator (v3.0.0)
// Walks src/App.tsx + every src/routes/*.tsx shell to extract a
// flat, externally-consumable list of <Route> definitions.
// Emits BOTH:
//   - generated/route-manifest.json     (legacy shape, backward-compat)
//   - generated/routes.json             (flat truth file)
//   - public/generated/routes.json      (external mirror for probes)
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";

interface FlatRoute {
  path: string;
  component: string;
  plane: string;
  runtimeTier: string;
  owner: string;
  source: string; // file the <Route> was parsed from
}

const SRC_APP = path.join(process.cwd(), "src/App.tsx");
const SRC_ROUTES_DIR = path.join(process.cwd(), "src/routes");

// ─── Owner derivation (preserved from v2.2) ──────────────────
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
    owner: "owner-mode", "owner-mode": "owner-mode",
    mobile: "mobile-shell", apps: "app-platform",
    investments: "finance-os", investment: "finance-os",
    communications: "comms-hub", comms: "comms-hub",
    pulse: "brain-core", "first-win": "onboarding", onboarding: "onboarding",
    "learn-later": "onboarding",
  };
  return ownerMap[seg] || seg;
}

// ─── Plane derivation (heuristic; mirrors route-tier-manifest tiers) ──
function derivePlane(routePath: string): string {
  if (routePath === "/" || /^\/(login|signup|forgot-password|reset-password)/.test(routePath)) {
    return "user"; // public surface, but still user-plane product
  }
  if (/^\/admin/.test(routePath) || /^\/operator/.test(routePath) || /^\/system/.test(routePath)) {
    return "admin";
  }
  if (/^\/owner/.test(routePath)) return "admin";
  if (/^\/mobile/.test(routePath)) return "shell-runtime";
  if (/^\/(onboarding|auth|first-win|learn-later)/.test(routePath)) return "user";
  return "user";
}

function deriveRuntimeTier(routePath: string): string {
  if (routePath === "/" || /^\/(login|signup|forgot-password|reset-password)/.test(routePath)) {
    return "tier1_public";
  }
  if (/^\/(onboarding|auth|first-win|learn-later)/.test(routePath)) {
    return "tier2_authenticated_no_shell";
  }
  if (/^\/admin/.test(routePath)) return "tier4_admin";
  return "tier3_authenticated_with_shell";
}

// ─── Route extraction ────────────────────────────────────────
// Matches <Route ... path="/x" ... element={<Component .../>} ... />
// Tolerant to JSX whitespace, key attrs, gated() wrappers, Navigate elements.
const ROUTE_RE = /<Route[^>]*?\bpath\s*=\s*"([^"]+)"[^>]*?\belement\s*=\s*\{(?:<(\w+)|gated\([^,]+,\s*<(\w+)|[\s\S]*?<(\w+))/g;

function extractRoutesFromFile(filePath: string): Array<{ path: string; component: string }> {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, "utf-8");
  const routes: Array<{ path: string; component: string }> = [];
  let m: RegExpExecArray | null;
  while ((m = ROUTE_RE.exec(content)) !== null) {
    const routePath = m[1];
    const component = m[2] || m[3] || m[4] || "Unknown";
    routes.push({ path: routePath, component });
  }
  return routes;
}

// ─── Walk all sources ────────────────────────────────────────
const allRoutes: FlatRoute[] = [];

// 1) App.tsx (top-level)
for (const r of extractRoutesFromFile(SRC_APP)) {
  allRoutes.push({
    path: r.path,
    component: r.component,
    plane: derivePlane(r.path),
    runtimeTier: deriveRuntimeTier(r.path),
    owner: deriveOwner(r.path),
    source: "src/App.tsx",
  });
}

// 2) Every shell file in src/routes/
if (fs.existsSync(SRC_ROUTES_DIR)) {
  const shellFiles = fs.readdirSync(SRC_ROUTES_DIR)
    .filter((f) => f.endsWith(".tsx"))
    .map((f) => path.join(SRC_ROUTES_DIR, f));
  for (const shellPath of shellFiles) {
    for (const r of extractRoutesFromFile(shellPath)) {
      allRoutes.push({
        path: r.path,
        component: r.component,
        plane: derivePlane(r.path),
        runtimeTier: deriveRuntimeTier(r.path),
        owner: deriveOwner(r.path),
        source: path.relative(process.cwd(), shellPath),
      });
    }
  }
}

// ─── Deduplicate by path (first occurrence wins) ─────────────
const seen = new Set<string>();
const flatRoutes: FlatRoute[] = [];
for (const r of allRoutes) {
  if (seen.has(r.path)) continue;
  seen.add(r.path);
  flatRoutes.push(r);
}

// ─── Aggregate summaries ────────────────────────────────────
const byPlane = flatRoutes.reduce((acc, r) => { acc[r.plane] = (acc[r.plane] || 0) + 1; return acc; }, {} as Record<string, number>);
const byOwner = flatRoutes.reduce((acc, r) => { acc[r.owner] = (acc[r.owner] || 0) + 1; return acc; }, {} as Record<string, number>);
const byRuntimeTier = flatRoutes.reduce((acc, r) => { acc[r.runtimeTier] = (acc[r.runtimeTier] || 0) + 1; return acc; }, {} as Record<string, number>);
const bySource = flatRoutes.reduce((acc, r) => { acc[r.source] = (acc[r.source] || 0) + 1; return acc; }, {} as Record<string, number>);

const generatedAt = new Date().toISOString();

const flatManifest = {
  version: "3.0.0",
  generatedAt,
  totalRoutes: flatRoutes.length,
  byPlane,
  byOwner,
  byRuntimeTier,
  bySource,
  routes: flatRoutes,
};

// ─── Backward-compatible legacy shape ────────────────────────
const legacyManifest = {
  version: "3.0.0",
  generatedAt,
  totalRoutes: flatRoutes.length,
  ownerDistribution: byOwner,
  routes: flatRoutes.map((r) => ({
    path: r.path,
    component: r.component,
    domain: r.path.split("/")[1] || "root",
    owner: r.owner,
  })),
};

// ─── Write all outputs ───────────────────────────────────────
const internalDir = path.join(process.cwd(), "generated");
const externalDir = path.join(process.cwd(), "public/generated");
fs.mkdirSync(internalDir, { recursive: true });
fs.mkdirSync(externalDir, { recursive: true });

const legacyPath = path.join(internalDir, "route-manifest.json");
const flatInternalPath = path.join(internalDir, "routes.json");
const flatExternalPath = path.join(externalDir, "routes.json");

fs.writeFileSync(legacyPath, JSON.stringify(legacyManifest, null, 2));
const flatJson = JSON.stringify(flatManifest, null, 2);
fs.writeFileSync(flatInternalPath, flatJson);
fs.writeFileSync(flatExternalPath, flatJson);

console.log(`✅ Route manifest v3.0.0 generated`);
console.log(`   Total routes: ${flatRoutes.length}`);
console.log(`   Sources walked: ${Object.keys(bySource).length}`);
console.log(`   By plane: ${JSON.stringify(byPlane)}`);
console.log(`   → ${path.relative(process.cwd(), legacyPath)}`);
console.log(`   → ${path.relative(process.cwd(), flatInternalPath)}`);
console.log(`   → ${path.relative(process.cwd(), flatExternalPath)}`);
