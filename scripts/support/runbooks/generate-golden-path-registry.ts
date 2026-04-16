#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Generate Golden Path Registry artifact
// Produces generated/golden-path-registry.json from the typed
// registry at src/lib/operations/golden-path-registry.ts.
// ═══════════════════════════════════════════════════════════════

import { writeJsonOutput, envelope } from "../../architecture/lib/utils";
import { GOLDEN_PATH_REGISTRY } from "../../../src/lib/operations/golden-path-registry";
import { GOLDEN_PATH_OWNERSHIP } from "../../../src/lib/operations/golden-path-ownership";
import { GOLDEN_PATH_VERIFICATION_MAP } from "../../../src/lib/operations/golden-path-verification-map";

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
}));

const byCriticality = entries.reduce<Record<string, number>>((acc, e) => {
  acc[e.criticality] = (acc[e.criticality] ?? 0) + 1;
  return acc;
}, {});

writeJsonOutput(
  "generated/golden-path-registry.json",
  envelope("2.0.0", {
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

console.log(
  `✅ generate-golden-path-registry: ${entries.length} Golden Paths indexed ` +
    `(P0=${byCriticality.P0 ?? 0}, P1=${byCriticality.P1 ?? 0}, P2=${byCriticality.P2 ?? 0})`
);
