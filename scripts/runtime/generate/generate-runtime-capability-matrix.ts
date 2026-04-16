#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Generate Runtime Capability Matrix (Phase 2)
// Produces generated/runtime-capability-matrix.json with:
//   - hardware capability matrix (4 surfaces)
//   - 8-surface canonical projection
//   - feature-capability-registry summary by surface
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import { writeJsonOutput, readJsonSafe, envelope } from "../../architecture/lib/utils";

const matrixPath = "src/lib/runtime/runtime-capability-matrix.ts";
const featureRegPath = "src/lib/runtime/feature-capability-registry.ts";
const fallbackPath = "src/lib/runtime/capability-fallbacks.ts";

const canonicalSurfaces = ["web", "electron", "appliance", "ios", "android", "offline", "demo", "real"] as const;
const hardwareSurfaces = ["web", "desktop", "mobilePwa", "appliance"] as const;

// ── Hardware matrix extraction ───────────────────────────────
const matrixSrc = fs.existsSync(matrixPath) ? fs.readFileSync(matrixPath, "utf-8") : "";
const hardwareEntries = Array.from(
  matrixSrc.matchAll(/capabilityId:\s*"([a-z0-9-]+)",\s*name:\s*"([^"]+)",\s*web:\s*"(\w+)",\s*desktop:\s*"(\w+)",\s*mobilePwa:\s*"(\w+)",\s*appliance:\s*"(\w+)"/g)
).map((m) => ({
  capabilityId: m[1],
  name: m[2],
  hardware: { web: m[3], desktop: m[4], mobilePwa: m[5], appliance: m[6] },
  canonical: {
    web: m[3], electron: m[4], appliance: m[6],
    ios: m[5], android: m[5],
    offline: m[3], demo: m[3], real: m[3],
  },
}));

// ── Feature registry extraction (heuristic) ──────────────────
const featureSrc = fs.existsSync(featureRegPath) ? fs.readFileSync(featureRegPath, "utf-8") : "";
const featureIds = Array.from(featureSrc.matchAll(/featureId:\s*"([a-z0-9-]+)"/g)).map((m) => m[1]);
const featureContextLinks = Array.from(featureSrc.matchAll(
  /featureId:\s*"([a-z0-9-]+)",[\s\S]*?contextId:\s*"([a-z0-9-]+)"/g
)).map((m) => ({ featureId: m[1], contextId: m[2] }));

// ── Fallback summary ─────────────────────────────────────────
const fallbackSrc = fs.existsSync(fallbackPath) ? fs.readFileSync(fallbackPath, "utf-8") : "";
const fallbackCount = (fallbackSrc.match(/strategy:\s*"/g) || []).length;
const fallbackByStrategy: Record<string, number> = {};
for (const m of fallbackSrc.matchAll(/strategy:\s*"([a-z-]+)"/g)) {
  fallbackByStrategy[m[1]] = (fallbackByStrategy[m[1]] || 0) + 1;
}

// ── Per-surface state distribution from feature registry ─────
const stateDistribution: Record<string, Record<string, number>> = {};
for (const surface of canonicalSurfaces) {
  stateDistribution[surface] = {
    supported: 0, simulated: 0, degraded: 0, fallback: 0,
    prohibited: 0, roadmap: 0, unsupported: 0,
  };
}
// Heuristic count of state literals (registry-wide totals shown per surface)
const totalStateCounts: Record<string, number> = {};
for (const state of ["supported", "simulated", "degraded", "fallback", "prohibited", "roadmap", "unsupported"]) {
  totalStateCounts[state] = (featureSrc.match(new RegExp(`"${state}"`, "g")) || []).length;
}

writeJsonOutput("generated/runtime-capability-matrix.json", envelope("2.0.0", {
  phase: "phase-2-meta-architecture",
  surfaces: {
    hardware: [...hardwareSurfaces],
    canonical: [...canonicalSurfaces],
  },
  hardwareCapabilityMatrix: {
    count: hardwareEntries.length,
    entries: hardwareEntries,
  },
  featureCapabilityRegistry: {
    count: featureIds.length,
    features: featureIds,
    contextLinks: featureContextLinks,
    stateLiteralCounts: totalStateCounts,
  },
  fallbacks: {
    total: fallbackCount,
    byStrategy: fallbackByStrategy,
  },
}));

console.log(`✅ generate-runtime-capability-matrix:`);
console.log(`   • ${hardwareEntries.length} hardware capabilities × ${canonicalSurfaces.length} canonical surfaces`);
console.log(`   • ${featureIds.length} app features registered`);
console.log(`   • ${fallbackCount} fallback strategies declared`);
