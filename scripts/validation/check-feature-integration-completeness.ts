#!/usr/bin/env node
// SITA OS — Feature Integration Completeness Check
import { ViolationCollector, readJsonSafe, loadCapabilityIndex, loadRouteManifest } from "../architecture/lib/utils";
const vc = new ViolationCollector();
const featureIndex = readJsonSafe<any>("generated/feature-integration-index.json");
const capIndex = loadCapabilityIndex();
if (!featureIndex) { console.error("❌ feature-integration-index.json not found"); process.exit(1); }
const features = featureIndex.features || featureIndex.entries || [];
let integrated = 0;
for (const feature of features) {
  const id = feature.id || feature.featureId || feature.name;
  const capabilities = feature.capabilities || [];
  const routes = feature.routes || [];
  if (capabilities.length === 0) {
    vc.add("feature-integration-index.json", "no-capabilities", `Feature "${id}" has no capabilities`, "warning");
  }
  if (routes.length === 0) {
    vc.add("feature-integration-index.json", "no-routes", `Feature "${id}" has no routes`, "warning");
  }
  if (capabilities.length > 0 && routes.length > 0) integrated++;
}
console.log(`  🔗 ${integrated}/${features.length} features fully integrated`);
vc.report("check-feature-integration-completeness");
vc.exitIfErrors();
