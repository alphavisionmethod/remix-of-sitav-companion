#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Capability Family Completeness Check
// Validates capability family groupings are complete and consistent
// ═══════════════════════════════════════════════════════════════

import { ViolationCollector, readJsonSafe, loadCapabilityIndex, classifyServiceDomain } from "./lib/utils";

const vc = new ViolationCollector();
const capIndex = loadCapabilityIndex();
const familyIndex = readJsonSafe<any>("generated/capability-family-index.json");

if (!capIndex) {
  console.error("❌ generated/capability-index.json not found");
  process.exit(1);
}

const capabilities = capIndex.capabilities || capIndex.entries || [];
const VALID_FAMILIES = ["business-os", "finance-os", "concierge-os", "platform", "policy"];

// Check every capability has a classifiable family
const capIdsByFamily: Record<string, string[]> = {};
for (const cap of capabilities) {
  const id = cap.id || cap.name;
  const domain = cap.domain || cap.family || classifyServiceDomain(id);

  if (!VALID_FAMILIES.includes(domain) && !VALID_FAMILIES.some(f => domain.includes(f.replace("-os", "")))) {
    vc.add("capability-index.json", "unknown-family", `Capability "${id}" has unrecognized family: ${domain}`, "warning");
  }

  const normalized = VALID_FAMILIES.find(f => domain.includes(f.replace("-os", ""))) || "platform";
  if (!capIdsByFamily[normalized]) capIdsByFamily[normalized] = [];
  capIdsByFamily[normalized].push(id);
}

// Validate family index if it exists
if (familyIndex) {
  const families = familyIndex.families || [];
  const indexedCapIds = new Set<string>();

  for (const family of families) {
    const caps = family.capabilities || family.entries || [];
    for (const c of caps) {
      const cid = typeof c === "string" ? c : c.id || c.name;
      if (indexedCapIds.has(cid)) {
        vc.add("capability-family-index.json", "duplicate-entry", `Capability "${cid}" appears in multiple families`);
      }
      indexedCapIds.add(cid);
    }
  }

  // Every capability should appear in the family index
  for (const cap of capabilities) {
    const id = cap.id || cap.name;
    if (!indexedCapIds.has(id)) {
      vc.add("capability-family-index.json", "missing-capability", `Capability "${id}" not in family index`, "warning");
    }
  }
}

// Report family distribution
for (const [family, caps] of Object.entries(capIdsByFamily)) {
  console.log(`  📁 ${family}: ${caps.length} capabilities`);
}

vc.report("check-capability-families");
vc.exitIfErrors();
