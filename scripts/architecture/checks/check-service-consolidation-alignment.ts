#!/usr/bin/env node
// SITA OS — Service Consolidation Alignment Check
import * as fs from "fs";
import { ViolationCollector, readJsonSafe, discoverServiceDirs } from "../architecture/lib/utils";
const vc = new ViolationCollector();
const consolidation = readJsonSafe<any>("generated/service-consolidation-manifest.json");
if (!consolidation) { console.log("⚠️ service-consolidation-manifest.json not found — skipping"); process.exit(0); }
const entries = consolidation.services || consolidation.entries || [];
const serviceDirs = new Set(discoverServiceDirs());
for (const entry of entries) {
  const id = entry.id || entry.serviceId;
  if (entry.mergedInto && serviceDirs.has(id)) {
    vc.add("service-consolidation-manifest.json", "pending-merge", `Service "${id}" marked for merge into "${entry.mergedInto}" but still exists`, "warning");
  }
  if (entry.status === "deprecated" && serviceDirs.has(id)) {
    vc.add("service-consolidation-manifest.json", "deprecated-exists", `Deprecated service "${id}" still has directory`, "warning");
  }
}
console.log(`  📊 ${entries.length} entries in consolidation manifest`);
vc.report("check-service-consolidation-alignment");
vc.exitIfErrors();
