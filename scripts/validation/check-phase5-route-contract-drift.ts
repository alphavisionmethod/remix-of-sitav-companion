#!/usr/bin/env node
// SITA OS — Route/Contract Drift Detection
import { ViolationCollector, readJsonSafe, loadRouteManifest } from "../architecture/lib/utils";
const vc = new ViolationCollector();
const routeManifest = loadRouteManifest();
const contractManifest = readJsonSafe<any>("generated/contract-manifest.json");
if (!routeManifest) { console.error("❌ route-manifest.json not found"); process.exit(1); }
const routes = routeManifest.routes || routeManifest.entries || [];
const contracts = contractManifest?.contracts || contractManifest?.entries || [];
const contractNames = new Set(contracts.map((c: any) => c.name || c.typeName));

// Check if routes reference contracts that exist
let withContract = 0;
for (const route of routes) {
  const routeContract = route.contract || route.contractType;
  if (routeContract) {
    if (contractNames.size > 0 && !contractNames.has(routeContract)) {
      vc.add("route-manifest.json", "contract-drift", `Route "${route.path}" references missing contract: ${routeContract}`, "warning");
    } else {
      withContract++;
    }
  }
}
console.log(`  🔗 ${withContract}/${routes.length} routes have valid contract references`);
vc.report("check-phase5-route-contract-drift");
vc.exitIfErrors();
