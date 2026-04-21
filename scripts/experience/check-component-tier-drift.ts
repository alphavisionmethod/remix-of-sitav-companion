#!/usr/bin/env node
/* eslint-disable no-console */
import { emitGateReport, type GateIssue } from "../validation/_lib/emit-gate-report";
import { COMPONENT_TIER_MAP, COMPONENT_TIER_MAP_COUNT } from "../../src/platform/experience/component-tier-map";
import { COMPONENT_TAXONOMY } from "../../src/lib/frontend/component-family-taxonomy";

const issues: GateIssue[] = [];

// Every taxonomy family should have a tier mapping
const mappedFamilies = new Set(COMPONENT_TIER_MAP.map(c => c.familyId));
for (const entry of COMPONENT_TAXONOMY) {
  if (!mappedFamilies.has(entry.familyId)) {
    issues.push({ severity: "warning", area: "unmapped-family", message: `Component family "${entry.familyId}" has no tier mapping` });
  }
}

// Every tier mapping should reference a valid taxonomy family
const taxonomyFamilies = new Set(COMPONENT_TAXONOMY.map(t => t.familyId));
for (const entry of COMPONENT_TIER_MAP) {
  if (!taxonomyFamilies.has(entry.familyId)) {
    issues.push({ severity: "error", area: "invalid-family", message: `Tier mapping references unknown family "${entry.familyId}"` });
  }
  if (entry.tiers.length === 0) {
    issues.push({ severity: "error", area: "no-tiers", message: `Family "${entry.familyId}" has no tier assignments` });
  }
}

const errorCount = issues.filter(i => i.severity === "error").length;
const file = emitGateReport({ gate: "component-tier-drift", ok: errorCount === 0, issues, extra: {
  taxonomyFamilies: COMPONENT_TAXONOMY.length,
  tierMappedFamilies: COMPONENT_TIER_MAP_COUNT,
}});
console.log(`Component tier drift: ${COMPONENT_TIER_MAP_COUNT} mapped / ${COMPONENT_TAXONOMY.length} taxonomy families → ${file}`);