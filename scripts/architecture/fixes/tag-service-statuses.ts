#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Wave 5.3: Tag service statuses in service-manifest
// ═══════════════════════════════════════════════════════════════
// Defaults every untagged service to status: "active".
// Domain-based overrides apply for known retired/experimental services.
//
// Usage: npx tsx scripts/architecture/fixes/tag-service-statuses.ts

import * as fs from "fs";
import * as path from "path";

const MANIFEST_PATH = path.resolve("generated/service-manifest.json");

// Heuristic overrides — domains/paths that imply non-active status.
// Conservative: when in doubt, keep `active`.
const OVERRIDES: Array<{ matcher: RegExp; status: string; reason: string }> = [
  { matcher: /\.test$/, status: "active", reason: "test harness" },
  { matcher: /__tests__/, status: "active", reason: "test harness" },
  // Mobile pipeline is intentionally retired to FUTURE_VISION (per WAVE plan).
  { matcher: /(^|\/)mobile-(pipeline|shell|companion)/i, status: "deprecated", reason: "mobile retired to FUTURE_VISION" },
  { matcher: /\/legacy\//, status: "deprecated", reason: "legacy directory" },
  { matcher: /scaffold/i, status: "experimental", reason: "scaffold service" },
];

function classify(svc: { name?: string; domain?: string; path?: string }): { status: string; reason: string } {
  const fields = [svc.name ?? "", svc.domain ?? "", svc.path ?? ""].join(" | ");
  for (const o of OVERRIDES) {
    if (o.matcher.test(fields)) return { status: o.status, reason: o.reason };
  }
  return { status: "active", reason: "default — service is shipped in current build" };
}

function main() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error(`❌ ${MANIFEST_PATH} not found`);
    process.exit(1);
  }
  const raw = fs.readFileSync(MANIFEST_PATH, "utf-8");
  const manifest = JSON.parse(raw);
  const services = manifest.services || manifest.entries || [];

  let tagged = 0;
  let alreadyTagged = 0;
  const dist: Record<string, number> = {};

  for (const svc of services) {
    if (svc.status && typeof svc.status === "string" && svc.status.trim()) {
      alreadyTagged++;
      dist[svc.status] = (dist[svc.status] || 0) + 1;
      continue;
    }
    const { status, reason } = classify(svc);
    svc.status = status;
    svc.statusSource = "wave5-auto-tagger";
    svc.statusReason = reason;
    tagged++;
    dist[status] = (dist[status] || 0) + 1;
  }

  manifest.statusTaggedAt = new Date().toISOString();
  manifest.statusTaggerVersion = "wave5.3";

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n", "utf-8");

  console.log(`✅ Status-tagged ${tagged} services (already tagged: ${alreadyTagged})`);
  console.log(`📊 Distribution:`);
  for (const [k, v] of Object.entries(dist).sort((a, b) => b[1] - a[1])) {
    console.log(`   ${k}: ${v}`);
  }
}

main();
