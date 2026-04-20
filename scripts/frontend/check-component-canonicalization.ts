#!/usr/bin/env node
/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Component Canonicalization Validator (BLOCK gate)
// Validates canonical map, flags deprecated imports, detects undeclared families.
// ═══════════════════════════════════════════════════════════════
import { existsSync } from "node:fs";
import { emitGateReport, type GateIssue } from "../validation/_lib/emit-gate-report";
import { COMPONENT_CANONICAL_MAP, CANONICAL_FAMILY_COUNT, getAllDeprecatedPaths } from "../../src/lib/frontend/component-canonical-map";
import { COMPONENT_TAXONOMY } from "../../src/lib/frontend/component-family-taxonomy";
import { DEPRECATION_REGISTRY, DEPRECATED_COUNT } from "../../src/lib/frontend/primitive-deprecation-registry";

const issues: GateIssue[] = [];

// 1. Verify canonical map exists and has families
if (CANONICAL_FAMILY_COUNT < 20) {
  issues.push({ severity: "error", area: "canonical-map", message: `Canonical map has only ${CANONICAL_FAMILY_COUNT} families; expected ≥20` });
}

// 2. Verify taxonomy covers all canonical families
const taxonomyIds = new Set(COMPONENT_TAXONOMY.map(t => t.familyId));
for (const family of COMPONENT_CANONICAL_MAP) {
  if (!taxonomyIds.has(family.familyId)) {
    issues.push({ severity: "warning", area: "taxonomy-gap", message: `Family "${family.familyId}" not in taxonomy` });
  }
}

// 3. Verify canonical paths exist on disk
for (const family of COMPONENT_CANONICAL_MAP) {
  for (const p of family.canonicalPaths) {
    if (!existsSync(p)) {
      issues.push({ severity: "error", area: "missing-canonical", message: `Canonical path missing: ${p} (family: ${family.familyId})` });
    }
  }
}

// 4. Verify deprecation registry is populated
if (DEPRECATED_COUNT < 7) {
  issues.push({ severity: "warning", area: "deprecation", message: `Deprecation registry has only ${DEPRECATED_COUNT} entries; expected ≥7` });
}

// 5. Verify deprecated paths still exist (they should until migration completes)
for (const dep of DEPRECATION_REGISTRY) {
  if (!existsSync(dep.canonicalReplacement)) {
    issues.push({ severity: "error", area: "broken-replacement", message: `Canonical replacement missing for ${dep.deprecatedPath}: ${dep.canonicalReplacement}` });
  }
}

const errorCount = issues.filter(i => i.severity === "error").length;
const file = emitGateReport({
  gate: "component-canonicalization",
  ok: errorCount === 0,
  issues,
  extra: {
    canonicalFamilies: CANONICAL_FAMILY_COUNT,
    taxonomyEntries: COMPONENT_TAXONOMY.length,
    deprecatedEntries: DEPRECATED_COUNT,
    deprecatedPaths: getAllDeprecatedPaths(),
  },
});

console.log(`Component canonicalization: ${errorCount === 0 ? "✅" : "❌"} (${CANONICAL_FAMILY_COUNT} families, ${DEPRECATED_COUNT} deprecated) → ${file}`);
if (errorCount > 0) process.exit(1);