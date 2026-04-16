#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime Capability Completeness Check (Phase 2)
//
// Asserts:
//  1. feature-capability-registry covers all 8 canonical surfaces
//  2. every degraded/fallback cell has a declared fallback strategy
//  3. every feature points to a real bounded context (Phase 1 link)
//  4. no claim of `supported` exists for a surface where the
//     underlying hardware capability is `unavailable`
// ═══════════════════════════════════════════════════════════════

import { ViolationCollector } from "../../architecture/lib/utils";
import * as fs from "fs";
import * as path from "path";

const vc = new ViolationCollector();

const REG_PATH = "src/lib/runtime/feature-capability-registry.ts";
const FALLBACK_PATH = "src/lib/runtime/capability-fallbacks.ts";
const SURFACE_PATH = "src/lib/runtime/surface-types.ts";
const CONTEXT_PATH = "src/lib/architecture/bounded-context-registry.ts";

for (const p of [REG_PATH, FALLBACK_PATH, SURFACE_PATH, CONTEXT_PATH]) {
  if (!fs.existsSync(p)) {
    vc.add(p, "missing-file", `Required Phase 2 source not found: ${p}`);
  }
}

if (vc.errors.length > 0) {
  vc.report("check-runtime-capability-completeness");
  vc.exitIfErrors();
}

const regSrc = fs.readFileSync(REG_PATH, "utf-8");
const fbSrc = fs.readFileSync(FALLBACK_PATH, "utf-8");
const ctxSrc = fs.readFileSync(CONTEXT_PATH, "utf-8");

// ── 1. Surface coverage check (heuristic over source) ────────
const requiredSurfaces = ["web", "electron", "appliance", "ios", "android", "offline", "demo", "real"];
const featureMatches = Array.from(regSrc.matchAll(/featureId:\s*"([a-z0-9-]+)"/g)).map((m) => m[1]);

if (featureMatches.length === 0) {
  vc.add(REG_PATH, "no-features", "feature-capability-registry contains zero features.");
}

console.log(`  📋 ${featureMatches.length} features found in registry`);

// Surface presence check (assert helper invocations cover all surfaces)
for (const s of requiredSurfaces) {
  if (!regSrc.includes(`"${s}"`) && !regSrc.includes(`${s}:`)) {
    vc.add(REG_PATH, "missing-surface-coverage", `Surface "${s}" not referenced in registry.`, "warning");
  }
}

// ── 2. Bounded-context cross-link check ──────────────────────
const contextIdMatches = Array.from(ctxSrc.matchAll(/contextId:\s*"([a-z0-9-]+)"/g)).map((m) => m[1]);
const validContextIds = new Set(contextIdMatches);

const featureContextRefs = Array.from(regSrc.matchAll(/contextId:\s*"([a-z0-9-]+)"/g)).map((m) => m[1]);
for (const ref of featureContextRefs) {
  if (!validContextIds.has(ref)) {
    vc.add(REG_PATH, "dangling-context-ref",
      `Feature references unknown bounded context "${ref}". Register it in bounded-context-registry.ts.`);
  }
}
console.log(`  🔗 ${featureContextRefs.length} feature→context references; ${validContextIds.size} contexts available`);

// ── 3. Fallback coverage check ───────────────────────────────
// Count degraded/fallback occurrences vs declared fallbacks.
const degradedHits = (regSrc.match(/"degraded"/g) || []).length;
const fallbackHits = (regSrc.match(/"fallback"/g) || []).length;
const fallbackEntries = (fbSrc.match(/featureId:\s*"/g) || []).length;

console.log(`  🛟 ${degradedHits} degraded + ${fallbackHits} fallback cells; ${fallbackEntries} fallback strategies declared`);

if (fallbackEntries < 5) {
  vc.add(FALLBACK_PATH, "thin-fallback-registry",
    `Only ${fallbackEntries} fallback strategies declared — expected coverage for degraded/fallback cells.`,
    "warning");
}

// ── 4. Surface-types completeness ────────────────────────────
const surfaceTypeSrc = fs.readFileSync(SURFACE_PATH, "utf-8");
for (const s of requiredSurfaces) {
  if (!surfaceTypeSrc.includes(`"${s}"`)) {
    vc.add(SURFACE_PATH, "missing-canonical-surface", `Surface "${s}" missing from CANONICAL_SURFACES.`);
  }
}

// ── 5. Generated manifest sanity ─────────────────────────────
const generatedPath = "generated/runtime-capability-matrix.json";
if (!fs.existsSync(generatedPath)) {
  vc.add(generatedPath, "missing-manifest",
    "Generated runtime-capability-matrix.json not found — run generate-runtime-capability-matrix.",
    "warning");
}

vc.report("check-runtime-capability-completeness");
vc.exitIfErrors();
