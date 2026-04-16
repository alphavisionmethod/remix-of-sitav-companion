#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Owner Workflow Map Check
// Validates service ownership and workflow assignments
// ═══════════════════════════════════════════════════════════════

import { ViolationCollector, loadServiceManifest } from "../lib/utils";

const vc = new ViolationCollector();
const manifest = loadServiceManifest();

if (!manifest) {
  vc.add("generated/service-manifest.json", "missing", "Service manifest not found", "warning");
} else {
  const services = manifest.services || [];
  let withOwner = 0;
  for (const svc of services) {
    if (svc.owner || svc.team || svc.domain) {
      withOwner++;
    } else {
      vc.add("service-manifest.json", "no-owner", `Service "${svc.id || svc.name}" has no owner`, "warning");
    }
  }
  console.log(`  👤 ${withOwner}/${services.length} services have owners`);
}

vc.report("check-owner-workflow-map");
vc.exitIfErrors();
