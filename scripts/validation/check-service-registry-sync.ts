#!/usr/bin/env node
// SITA OS — Service Registry Sync Check
import { ViolationCollector, loadServiceManifest, discoverServiceDirs } from "../architecture/lib/utils";
const vc = new ViolationCollector();
const manifest = loadServiceManifest();
const diskServices = new Set(discoverServiceDirs());
if (!manifest) { console.error("❌ service-manifest.json not found"); process.exit(1); }
const manifestIds = new Set((manifest.services || []).map((s: any) => s.id || s.name));
// Services on disk but not in manifest
for (const svc of diskServices) {
  if (!manifestIds.has(svc)) {
    vc.add("service-manifest.json", "unregistered-service", `Service "${svc}" exists on disk but not in manifest`, "warning");
  }
}
// Services in manifest but not on disk
for (const id of manifestIds) {
  if (!diskServices.has(id as string)) {
    vc.add("service-manifest.json", "phantom-service", `Service "${id}" in manifest but not on disk`, "warning");
  }
}
console.log(`  📊 ${diskServices.size} on disk, ${manifestIds.size} in manifest`);
vc.report("check-service-registry-sync");
vc.exitIfErrors();
