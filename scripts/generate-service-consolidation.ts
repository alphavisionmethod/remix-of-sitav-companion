#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Service Consolidation Manifest Generator
// Reads service-tier-manifest and outputs merge/parent status
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";

// Import tier manifest data by reading and parsing
const tierSource = fs.readFileSync("src/lib/core-services/service-tier-manifest.ts", "utf-8");

// Extract service entries from the source
const servicePattern = /\{\s*id:\s*"([^"]+)",\s*name:\s*"([^"]+)",\s*tier:\s*"([^"]+)"(?:,\s*parent:\s*"([^"]+)")?\s*,\s*description:\s*"([^"]+)"/g;
const services: { id: string; name: string; tier: string; parent?: string; description: string }[] = [];

for (const match of tierSource.matchAll(servicePattern)) {
  services.push({
    id: match[1],
    name: match[2],
    tier: match[3],
    parent: match[4] || undefined,
    description: match[5],
  });
}

const consolidationEntries = services.map(svc => {
  const children = services.filter(s => s.parent === svc.id);
  return {
    serviceId: svc.id,
    serviceName: svc.name,
    tier: svc.tier,
    parent: svc.parent || null,
    childCount: children.length,
    children: children.map(c => c.id),
    consolidationStatus: svc.parent ? "merged-into-parent" : children.length > 0 ? "parent-service" : "standalone",
    canConsolidate: svc.tier === "tier-3" && !svc.parent,
  };
});

const out = {
  version: "1.0.0",
  generatedAt: new Date().toISOString(),
  totalServices: services.length,
  tier1: services.filter(s => s.tier === "tier-1").length,
  tier2: services.filter(s => s.tier === "tier-2").length,
  tier3: services.filter(s => s.tier === "tier-3").length,
  isolated: services.filter(s => s.tier === "isolated").length,
  parentServices: consolidationEntries.filter(e => e.consolidationStatus === "parent-service").length,
  entries: consolidationEntries,
};

fs.writeFileSync("generated/service-consolidation-manifest.json", JSON.stringify(out, null, 2));
console.log(`✅ Generated service consolidation: ${services.length} services across ${4} tiers`);
