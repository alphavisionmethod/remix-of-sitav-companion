#!/usr/bin/env node
// SITA OS — Phase 5 Integration Map Completeness
import { ViolationCollector, readJsonSafe } from "../architecture/lib/utils";
const vc = new ViolationCollector();
const featureIndex = readJsonSafe<any>("generated/feature-integration-index.json");
if (!featureIndex) { console.error("❌ feature-integration-index.json not found"); process.exit(1); }
const features = featureIndex.features || featureIndex.entries || [];
let complete = 0, partial = 0, empty = 0;
for (const f of features) {
  const caps = f.capabilities?.length || 0;
  const routes = f.routes?.length || 0;
  const services = f.services?.length || 0;
  if (caps > 0 && routes > 0 && services > 0) complete++;
  else if (caps > 0 || routes > 0) partial++;
  else empty++;
}
console.log(`  🔗 Integration: ${complete} complete, ${partial} partial, ${empty} empty`);
if (empty > features.length * 0.3) {
  vc.add("feature-integration-index.json", "low-integration", `${empty}/${features.length} features have no integration points`, "warning");
}
vc.report("check-phase5-integration-map");
vc.exitIfErrors();
