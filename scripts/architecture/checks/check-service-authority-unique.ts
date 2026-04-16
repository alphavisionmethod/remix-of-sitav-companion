#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Service Authority Uniqueness Check
// Asserts every service family in the authority map has exactly
// ONE canonical owner (canonical: true).
// ═══════════════════════════════════════════════════════════════

import { ViolationCollector } from "../lib/utils";
import { SERVICE_AUTHORITY_MAP } from "../../../src/lib/migration/service-authority-map";

const vc = new ViolationCollector();

const familyOwners = new Map<string, string[]>();
for (const entry of SERVICE_AUTHORITY_MAP) {
  if (!entry.canonical) continue;
  const list = familyOwners.get(entry.family) ?? [];
  list.push(`${entry.root}/${entry.id}`);
  familyOwners.set(entry.family, list);
}

let canonicalCount = 0;
for (const [family, owners] of familyOwners) {
  canonicalCount += 1;
  if (owners.length > 1) {
    vc.add(
      "src/lib/migration/service-authority-map.ts",
      "duplicate-canonical-owner",
      `Family "${family}" has ${owners.length} canonical owners: ${owners.join(", ")} — exactly one is required`,
      "error",
    );
  }
}

console.log(`  📊 ${canonicalCount} canonical families, ${SERVICE_AUTHORITY_MAP.length} total entries`);
vc.report("check-service-authority-unique");
vc.exitIfErrors();
