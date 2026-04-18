// ═══════════════════════════════════════════════════════════════
// Feature Runtime Tier Registry Collector
//
// Reads the static feature tier registry and emits a live evidence
// record of how many features declare each (tier, availability)
// combination. Combined with the registry's own validator
// (`check-feature-tier-classification.ts`), this gives the manifest
// truth dashboard a runtime-anchored proof that the registry was
// loaded successfully in the active runtime.
// ═══════════════════════════════════════════════════════════════

import { makeRecord, safeGet } from "./_helpers";
import type { RuntimeEvidenceRecord } from "../runtime-evidence-types";

interface FeatureTierEntryShape {
  featureId: string;
  classifications?: Record<string, string>;
}

function readRegistry(): FeatureTierEntryShape[] {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require("@/runtimes/feature-runtime-tier-registry") as {
      FEATURE_RUNTIME_TIER_REGISTRY?: FeatureTierEntryShape[];
      listFeatureRuntimeTierEntries?: () => FeatureTierEntryShape[];
    };
    if (Array.isArray(mod.FEATURE_RUNTIME_TIER_REGISTRY)) {
      return mod.FEATURE_RUNTIME_TIER_REGISTRY;
    }
    return safeGet(() => mod.listFeatureRuntimeTierEntries?.() ?? [], []);
  } catch {
    return [];
  }
}

export function collectFeatureRuntimeTierEvidence(): RuntimeEvidenceRecord {
  const entries = readRegistry();
  const warnings: string[] = [];
  if (entries.length === 0) {
    warnings.push("Feature runtime tier registry is empty in this runtime");
  }
  const byTier: Record<string, number> = {};
  for (const e of entries) {
    const cls = e.classifications ?? {};
    for (const tier of Object.keys(cls)) {
      byTier[tier] = (byTier[tier] ?? 0) + 1;
    }
  }
  return makeRecord(
    "collector.feature-runtime-tier",
    "manifest-feature-runtime-tier-registry",
    { totalFeatures: entries.length, byTier },
    { itemCount: entries.length, warnings },
  );
}
