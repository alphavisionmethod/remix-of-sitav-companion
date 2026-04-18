#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin Route Registry Conformance Check
//
// Every route mounted in src/routes/AdminRoutes.tsx MUST have a
// corresponding entry in src/platform/architecture/admin-route-registry.ts.
// New routes added without registry entries fail CI.
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import { ViolationCollector } from "../lib/utils";

const vc = new ViolationCollector();

const ROUTES_PATH = "src/routes/AdminRoutes.tsx";
const REGISTRY_PATH = "src/platform/architecture/admin-route-registry.ts";

if (!fs.existsSync(ROUTES_PATH)) {
  vc.add(ROUTES_PATH, "missing-routes", "AdminRoutes.tsx not found");
  vc.report("check-admin-route-registry-conformance");
  vc.exitIfErrors();
  process.exit(0);
}
if (!fs.existsSync(REGISTRY_PATH)) {
  vc.add(REGISTRY_PATH, "missing-registry", "admin-route-registry.ts not found");
  vc.report("check-admin-route-registry-conformance");
  vc.exitIfErrors();
  process.exit(0);
}

const routesSrc = fs.readFileSync(ROUTES_PATH, "utf-8");
const registrySrc = fs.readFileSync(REGISTRY_PATH, "utf-8");

const mountedPaths = new Set<string>();
const pathRe = /path="(\/admin[^"]*)"/g;
let m: RegExpExecArray | null;
while ((m = pathRe.exec(routesSrc)) !== null) {
  mountedPaths.add(m[1]);
}

const registryPaths = new Set<string>();
const regRe = /path:\s*"(\/admin[^"]*)"/g;
while ((m = regRe.exec(registrySrc)) !== null) {
  registryPaths.add(m[1]);
}
// Also include programmatically-constructed DOMAIN_HUB_PATHS values
// (the canonical 12-domain hub entries are spread into the registry
// at runtime via DOMAIN_HUB_ENTRIES, so they are invisible to regex).
const hubBlockMatch = registrySrc.match(/DOMAIN_HUB_PATHS[^=]*=\s*\{([^}]+)\}/s);
if (hubBlockMatch) {
  const hubRe = /"(\/admin\/[a-z-]+)"/g;
  let hm: RegExpExecArray | null;
  while ((hm = hubRe.exec(hubBlockMatch[1])) !== null) {
    registryPaths.add(hm[1]);
  }
}
// /admin → /admin/overview redirect is canonical and intentional.
registryPaths.add("/admin");

console.log(`  🛤️  ${mountedPaths.size} mounted admin routes, ${registryPaths.size} in registry`);

const missingFromRegistry: string[] = [];
for (const p of mountedPaths) {
  if (!registryPaths.has(p)) missingFromRegistry.push(p);
}
const orphanInRegistry: string[] = [];
for (const p of registryPaths) {
  // Domain hub paths are allowed to be in the registry without being mounted yet (Phase 2 mounts them).
  const isHub = /^\/admin\/[a-z-]+$/.test(p);
  if (!mountedPaths.has(p) && !isHub) orphanInRegistry.push(p);
}

for (const p of missingFromRegistry) {
  vc.add(ROUTES_PATH, "route-not-in-registry", `Mounted route not in admin-route-registry: ${p}`);
}
for (const p of orphanInRegistry) {
  vc.add(REGISTRY_PATH, "registry-orphan", `Registry entry has no mounted route (and is not a hub): ${p}`, "warning");
}

vc.report("check-admin-route-registry-conformance");
vc.exitIfErrors();
