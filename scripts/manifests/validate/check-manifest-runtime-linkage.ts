#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Manifest Runtime Linkage Check
// Validates manifests reference valid runtime constructs
// ═══════════════════════════════════════════════════════════════

import { ViolationCollector, readJsonSafe, loadServiceManifest, loadRouteManifest } from "../../architecture/lib/utils";

const vc = new ViolationCollector();
const serviceManifest = loadServiceManifest();
const routeManifest = loadRouteManifest();

if (!serviceManifest) {
  vc.add("generated/service-manifest.json", "missing", "Service manifest not found", "warning");
} else {
  const services = serviceManifest.services || [];
  console.log(`  🔗 ${services.length} services in manifest`);
}

if (!routeManifest) {
  vc.add("generated/route-manifest.json", "missing", "Route manifest not found", "warning");
} else {
  const routes = routeManifest.routes || routeManifest.entries || [];
  console.log(`  🛤️ ${routes.length} routes in manifest`);

  // Check routes reference valid services
  if (serviceManifest) {
    const serviceIds = new Set((serviceManifest.services || []).map((s: any) => s.id || s.name));
    let linked = 0;
    for (const route of routes) {
      const owner = route.owner || route.service || route.ownerService;
      if (owner && serviceIds.has(owner)) linked++;
    }
    console.log(`  🔗 ${linked}/${routes.length} routes linked to valid services`);
  }
}

vc.report("check-manifest-runtime-linkage");
vc.exitIfErrors();
