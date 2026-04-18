// ═══════════════════════════════════════════════════════════════
// SITA OS — Golden Path Verification Map
// Maps each Golden Path to its verification artifacts (Playwright
// specs, runtime probes, receipt expectations, manifest evidence).
// CI uses this to assert every P0/P1 path has at least one
// automated verification.
// ═══════════════════════════════════════════════════════════════

import type {
  GoldenPathEntry,
  GoldenPathId,
  GoldenPathVerification,
  GoldenPathVerificationKind,
} from "./golden-path-types";
import { GOLDEN_PATH_REGISTRY } from "./golden-path-registry";

export interface GoldenPathVerificationSummary {
  readonly pathId: GoldenPathId;
  readonly criticality: GoldenPathEntry["criticality"];
  readonly verifications: readonly GoldenPathVerification[];
  readonly stepVerifications: readonly {
    readonly stepId: string;
    readonly kinds: readonly GoldenPathVerificationKind[];
  }[];
  readonly hasE2E: boolean;
  readonly hasProbe: boolean;
  readonly hasReceiptCheck: boolean;
}

export const GOLDEN_PATH_VERIFICATION_MAP: readonly GoldenPathVerificationSummary[] =
  GOLDEN_PATH_REGISTRY.map((p) => {
    const allKinds = new Set<GoldenPathVerificationKind>();
    for (const v of p.verifications) allKinds.add(v.kind);
    for (const s of p.steps) for (const k of s.verifications) allKinds.add(k);
    return {
      pathId: p.pathId,
      criticality: p.criticality,
      verifications: p.verifications,
      stepVerifications: p.steps.map((s) => ({
        stepId: s.stepId,
        kinds: s.verifications,
      })),
      hasE2E: allKinds.has("playwright-e2e"),
      hasProbe: allKinds.has("runtime-probe"),
      hasReceiptCheck: allKinds.has("receipt-emitted"),
    };
  });

export function getVerificationSummary(
  pathId: GoldenPathId
): GoldenPathVerificationSummary | undefined {
  return GOLDEN_PATH_VERIFICATION_MAP.find((v) => v.pathId === pathId);
}

export function getMissingVerifications(): readonly {
  pathId: GoldenPathId;
  reasons: readonly string[];
}[] {
  const missing: { pathId: GoldenPathId; reasons: string[] }[] = [];
  for (const v of GOLDEN_PATH_VERIFICATION_MAP) {
    const reasons: string[] = [];
    if ((v.criticality === "P0" || v.criticality === "P1") && !v.hasE2E) {
      reasons.push("missing-playwright-e2e");
    }
    if (v.criticality === "P0" && !v.hasReceiptCheck) {
      reasons.push("missing-receipt-check");
    }
    if (reasons.length > 0) missing.push({ pathId: v.pathId, reasons });
  }
  return missing;
}
