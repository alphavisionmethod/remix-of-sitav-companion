#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Generate Golden Path Registry artifact + Reality Report
// Produces:
//   • generated/golden-path-registry.json
//   • generated/golden-path-reality-report.json (Phase 29)
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";
import { writeJsonOutput, envelope } from "../../architecture/lib/utils";
import { GOLDEN_PATH_REGISTRY } from "../../../src/lib/operations/golden-path-registry";
import { GOLDEN_PATH_OWNERSHIP } from "../../../src/lib/operations/golden-path-ownership";
import { GOLDEN_PATH_VERIFICATION_MAP } from "../../../src/lib/operations/golden-path-verification-map";

const repoRoot = process.cwd();

const entries = GOLDEN_PATH_REGISTRY.map((p) => ({
  pathId: p.pathId,
  title: p.title,
  persona: p.persona,
  criticality: p.criticality,
  primaryContextId: p.primaryContextId,
  contextIds: p.contextIds,
  ownerTeam: p.ownerTeam,
  surfaces: p.surfaces,
  steps: p.steps.length,
  blockingKillSwitches: p.blockingKillSwitches,
  recoveryRunbookRefs: p.recoveryRunbookRefs,
  completionReceipts: p.completionReceipts,
  slaLatencyMsP95: p.slaLatencyMsP95,
  requiredCoveragePct: p.requiredCoveragePct,
  runtimeProbeRequired: p.runtimeProbeRequired,
  releaseGateRefs: p.releaseGateRefs,
  supportFallbackUrl: p.supportFallbackUrl,
}));

const byCriticality = entries.reduce<Record<string, number>>((acc, e) => {
  acc[e.criticality] = (acc[e.criticality] ?? 0) + 1;
  return acc;
}, {});

writeJsonOutput(
  "generated/golden-path-registry.json",
  envelope("2.1.0", {
    totalPaths: entries.length,
    byCriticality,
    entries,
    ownership: GOLDEN_PATH_OWNERSHIP,
    verifications: GOLDEN_PATH_VERIFICATION_MAP.map((v) => ({
      pathId: v.pathId,
      criticality: v.criticality,
      hasE2E: v.hasE2E,
      hasProbe: v.hasProbe,
      hasReceiptCheck: v.hasReceiptCheck,
    })),
  })
);

// ── Phase 29: Reality Report ─────────────────────────────────
const DIMENSIONS = [
  "screenComponentRef",
  "routePattern",
  "edgeFunctionRefs",
  "serviceRefs",
  "tableRefs",
  "policyRefs",
  "expectedReceipts",
  "verifications",
  "recoveryRunbookRefs",
  "releaseGateRefs",
  "supportFallbackUrl",
] as const;

const phantomArtifacts: string[] = [];
const dimensionsCovered: Record<string, number> = {};

for (const p of GOLDEN_PATH_REGISTRY) {
  let dims = 0;
  // Path-level: releaseGateRefs, supportFallbackUrl, recovery, completion
  if (p.releaseGateRefs.length > 0) dims++;
  if (p.supportFallbackUrl) dims++;
  if (p.recoveryRunbookRefs.length > 0) dims++;

  // Aggregate from steps
  const stepDims = {
    screen: false, route: false, edge: false, service: false,
    table: false, policy: false, receipt: false, verification: false,
  };
  for (const s of p.steps) {
    if (s.screenComponentRef) stepDims.screen = true;
    if (s.routePattern) stepDims.route = true;
    if (s.edgeFunctionRefs.length > 0) stepDims.edge = true;
    if (s.serviceRefs.length > 0) stepDims.service = true;
    if (s.tableRefs.length > 0) stepDims.table = true;
    if (s.policyRefs.length > 0) stepDims.policy = true;
    if (s.expectedReceipts.length > 0) stepDims.receipt = true;
    if (s.verifications.length > 0) stepDims.verification = true;

    if (s.screenComponentRef && !fs.existsSync(path.resolve(repoRoot, s.screenComponentRef))) {
      phantomArtifacts.push(s.screenComponentRef);
    }
  }
  dims += Object.values(stepDims).filter(Boolean).length;

  for (const v of p.verifications) {
    if (!fs.existsSync(path.resolve(repoRoot, v.artifactRef))) phantomArtifacts.push(v.artifactRef);
  }

  dimensionsCovered[p.pathId] = dims;
}

const allCovered = Object.values(dimensionsCovered).every((d) => d >= 11);
const ok = phantomArtifacts.length === 0 && allCovered;

writeJsonOutput(
  "generated/golden-path-reality-report.json",
  envelope("1.0.0", {
    ok,
    totalPaths: GOLDEN_PATH_REGISTRY.length,
    dimensionsRequired: 11,
    dimensions: DIMENSIONS,
    dimensionsCovered,
    phantomArtifacts: Array.from(new Set(phantomArtifacts)),
    fullyCoveredCount: Object.values(dimensionsCovered).filter((d) => d >= 11).length,
  })
);

console.log(
  `✅ generate-golden-path-registry: ${entries.length} Golden Paths indexed ` +
    `(P0=${byCriticality.P0 ?? 0}, P1=${byCriticality.P1 ?? 0}, P2=${byCriticality.P2 ?? 0}) · ` +
    `reality report ok=${ok} · phantoms=${phantomArtifacts.length}`
);
