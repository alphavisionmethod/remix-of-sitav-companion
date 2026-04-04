#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Surface Ownership Validator
// Validates every route has an owning service
// ═══════════════════════════════════════════════════════════════

import { ViolationCollector, readJsonSafe, loadRouteManifest, loadServiceManifest } from "./lib/utils";

const vc = new ViolationCollector();
const routeManifest = loadRouteManifest();
const serviceManifest = loadServiceManifest();

if (!routeManifest) {
  console.error("❌ generated/route-manifest.json not found");
  process.exit(1);
}

const routes = routeManifest.routes || routeManifest.entries || [];
const serviceIds = new Set((serviceManifest?.services || []).map((s: any) => s.id || s.name));

let owned = 0;
let unowned = 0;

for (const route of routes) {
  const routePath = route.path || route.route;
  const owner = route.owner || route.service || route.ownerService;

  if (!owner) {
    vc.add("route-manifest.json", "unowned-route", `Route "${routePath}" has no owner service`, "warning");
    unowned++;
  } else {
    owned++;
    if (serviceIds.size > 0 && !serviceIds.has(owner)) {
      vc.add("route-manifest.json", "invalid-owner", `Route "${routePath}" owned by unknown service: ${owner}`, "warning");
    }
  }
}

console.log(`  🗺️ ${owned}/${routes.length} routes have owners (${unowned} unowned)`);
vc.report("check-surface-ownership");
vc.exitIfErrors();
