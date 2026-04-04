#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Status Truth Tags Validator
// Validates status tags in service-manifest are canonical
// ═══════════════════════════════════════════════════════════════

import { ViolationCollector, loadServiceManifest } from "./lib/utils";

const vc = new ViolationCollector();
const manifest = loadServiceManifest();

if (!manifest) {
  console.error("❌ generated/service-manifest.json not found");
  process.exit(1);
}

const VALID_STATUSES = ["scaffold", "alpha", "beta", "ga", "deprecated", "retired"];
const services = manifest.services || [];

for (const svc of services) {
  const id = svc.id || svc.name;
  const status = (svc.status || "").toLowerCase().trim();

  if (!status) {
    vc.add("service-manifest.json", "missing-status", `Service "${id}" has no status tag`);
  } else if (!VALID_STATUSES.includes(status)) {
    vc.add("service-manifest.json", "invalid-status", `Service "${id}" has invalid status: "${svc.status}" (valid: ${VALID_STATUSES.join(", ")})`);
  }
}

const statusDist: Record<string, number> = {};
for (const svc of services) {
  const status = (svc.status || "unknown").toLowerCase().trim();
  statusDist[status] = (statusDist[status] || 0) + 1;
}

for (const [status, count] of Object.entries(statusDist)) {
  console.log(`  🏷️ ${status}: ${count} services`);
}

vc.report("check-status-truth-tags");
vc.exitIfErrors();
