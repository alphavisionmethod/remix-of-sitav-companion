#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Service Sprawl Detector
// Warns when service count exceeds threshold or services are too small
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";
import { ViolationCollector, discoverServiceDirs, scanDir, loadServiceManifest, classifyServiceDomain } from "./lib/utils";

const vc = new ViolationCollector();
const SPRAWL_THRESHOLD = 80;
const MIN_SERVICE_FILES = 2;
const MAX_SERVICE_FILES = 50;

const serviceDirs = discoverServiceDirs();
const manifest = loadServiceManifest();

console.log(`  📦 ${serviceDirs.length} service directories discovered`);

if (serviceDirs.length > SPRAWL_THRESHOLD) {
  vc.add("src/lib/services", "sprawl-threshold", `${serviceDirs.length} services exceeds sprawl threshold of ${SPRAWL_THRESHOLD}`);
} else if (serviceDirs.length > SPRAWL_THRESHOLD * 0.8) {
  vc.add("src/lib/services", "sprawl-warning", `${serviceDirs.length} services approaching sprawl threshold of ${SPRAWL_THRESHOLD}`, "warning");
}

// Check for tiny services (potential merge candidates)
const tinyCandidates: string[] = [];
const largeCandidates: string[] = [];

for (const svc of serviceDirs) {
  const svcPath = path.join("src/lib/services", svc);
  const files = scanDir(svcPath, [".ts", ".tsx"]);

  if (files.length < MIN_SERVICE_FILES) {
    tinyCandidates.push(`${svc} (${files.length} files)`);
    vc.add(svcPath, "tiny-service", `Service "${svc}" has only ${files.length} file(s) — consider merging`, "warning");
  }
  if (files.length > MAX_SERVICE_FILES) {
    largeCandidates.push(`${svc} (${files.length} files)`);
    vc.add(svcPath, "large-service", `Service "${svc}" has ${files.length} files — consider splitting`, "warning");
  }
}

// Domain distribution
const domainDist: Record<string, number> = {};
for (const svc of serviceDirs) {
  const domain = classifyServiceDomain(svc);
  domainDist[domain] = (domainDist[domain] || 0) + 1;
}

for (const [domain, count] of Object.entries(domainDist)) {
  console.log(`  📁 ${domain}: ${count} services`);
}

if (tinyCandidates.length > 0) {
  console.log(`  ⚠️ ${tinyCandidates.length} tiny services (merge candidates)`);
}
if (largeCandidates.length > 0) {
  console.log(`  ⚠️ ${largeCandidates.length} large services (split candidates)`);
}

vc.report("check-service-sprawl");
vc.exitIfErrors();
