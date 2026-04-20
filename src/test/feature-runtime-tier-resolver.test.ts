// ═══════════════════════════════════════════════════════════════
// SITA OS — Feature Runtime-Tier Resolver: Exhaustive Matrix Test
//
// Asserts every (feature × tier) cell of the canonical registry
// resolves to exactly the status declared on its mapping. With
// 48 features × 4 tiers = 192 deterministic cases, no future
// registry edit can silently break a gate without flipping a
// red test here.
//
// Invariants enforced (per feature):
//  1. The four declared tier sets (supported / simulated /
//     fallback / roadmap) must be pairwise disjoint.
//  2. resolveFeatureTierAvailability() must return exactly the
//     matching status, in priority order: supported > simulated
//     > fallback > roadmap > prohibited.
//  3. Unknown / unregistered featureIds must always resolve to
//     "prohibited" on every tier.
//  4. enumerateFeatureCoverage() must agree with the resolver
//     for every cell (no drift between admin matrix + runtime).
// ═══════════════════════════════════════════════════════════════

import { describe, expect, it } from "vitest";
import {
  FEATURE_RUNTIME_TIER_MAPPING,
  enumerateFeatureCoverage,
  isFeatureAvailableOn,
  isFeatureSupportedOn,
  resolveFeatureTierAvailability,
  type FeatureRuntimeTierMapping,
} from "@/runtimes/feature-runtime-tier-registry";
import type { RuntimeTier, TierAvailability } from "@/runtimes/runtime-tier-model";

const ALL_TIERS: readonly RuntimeTier[] = [
  "WEB_APP",
  "DESKTOP_HOST",
  "APPLIANCE_RUNTIME",
  "SIMULATED_OS_EXPERIENCE",
];

/**
 * Recompute the expected status for (feature, tier) directly from the
 * declared tier sets, using the exact priority order the resolver
 * promises. This is intentionally a re-implementation of the rule —
 * the test's job is to fail loudly if the resolver and the declaration
 * ever disagree.
 */
function expectedStatus(
  feature: FeatureRuntimeTierMapping,
  tier: RuntimeTier,
): TierAvailability {
  if (feature.supportedTiers.includes(tier)) return "supported";
  if (feature.simulatedTiers.includes(tier)) return "simulated";
  if (feature.fallbackTiers.includes(tier)) return "fallback";
  if (feature.roadmapTiers.includes(tier)) return "roadmap";
  return "prohibited";
}

describe("feature-runtime-tier-registry — registry shape invariants", () => {
  it("registers a non-empty, unique-id feature set", () => {
    expect(FEATURE_RUNTIME_TIER_MAPPING.length).toBeGreaterThan(0);
    const ids = FEATURE_RUNTIME_TIER_MAPPING.map((f) => f.featureId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("locks the registered feature count so silent additions/removals are caught", () => {
    // Snapshot guard. If you intentionally add or remove a feature,
    // update this number AND audit the cross-tier matrix.
    expect(FEATURE_RUNTIME_TIER_MAPPING.length).toBe(48);
  });

  it.each(FEATURE_RUNTIME_TIER_MAPPING.map((f) => [f.featureId, f] as const))(
    "feature %s declares pairwise-disjoint tier sets",
    (_id, feature) => {
      const seen = new Map<RuntimeTier, string>();
      const buckets: Array<["supportedTiers" | "simulatedTiers" | "fallbackTiers" | "roadmapTiers" | "prohibitedTiers"]> =
        [["supportedTiers"], ["simulatedTiers"], ["fallbackTiers"], ["roadmapTiers"], ["prohibitedTiers"]];
      for (const [bucket] of buckets) {
        for (const tier of feature[bucket]) {
          const prior = seen.get(tier);
          if (prior) {
            throw new Error(
              `feature ${feature.featureId}: tier ${tier} appears in both ${prior} and ${bucket}`,
            );
          }
          seen.set(tier, bucket);
        }
      }
    },
  );
});

describe("resolveFeatureTierAvailability — full 48 × 4 = 192-case matrix", () => {
  const cases: Array<[string, FeatureRuntimeTierMapping, RuntimeTier, TierAvailability]> =
    FEATURE_RUNTIME_TIER_MAPPING.flatMap((feature) =>
      ALL_TIERS.map(
        (tier) =>
          [
            `${feature.featureId} on ${tier}`,
            feature,
            tier,
            expectedStatus(feature, tier),
          ] as const,
      ),
    ) as Array<[string, FeatureRuntimeTierMapping, RuntimeTier, TierAvailability]>;

  it(`enumerates exactly ${FEATURE_RUNTIME_TIER_MAPPING.length * ALL_TIERS.length} cases`, () => {
    expect(cases.length).toBe(FEATURE_RUNTIME_TIER_MAPPING.length * ALL_TIERS.length);
  });

  it.each(cases)("%s resolves to expected status", (_label, feature, tier, expected) => {
    expect(resolveFeatureTierAvailability(feature.featureId, tier)).toBe(expected);
  });

  it.each(cases)("%s — isFeatureSupportedOn matches expected", (_label, feature, tier, expected) => {
    expect(isFeatureSupportedOn(feature.featureId, tier)).toBe(expected === "supported");
  });

  it.each(cases)(
    "%s — isFeatureAvailableOn matches expected",
    (_label, feature, tier, expected) => {
      expect(isFeatureAvailableOn(feature.featureId, tier)).toBe(expected !== "prohibited");
    },
  );
});

describe("resolveFeatureTierAvailability — unknown features", () => {
  it.each(ALL_TIERS)("unknown featureId on %s resolves to prohibited", (tier) => {
    expect(resolveFeatureTierAvailability("__definitely_not_a_real_feature__", tier)).toBe(
      "prohibited",
    );
    expect(isFeatureAvailableOn("__definitely_not_a_real_feature__", tier)).toBe(false);
    expect(isFeatureSupportedOn("__definitely_not_a_real_feature__", tier)).toBe(false);
  });
});

describe("enumerateFeatureCoverage — cross-tier matrix parity", () => {
  const coverage = enumerateFeatureCoverage();

  it("produces one row per registered feature", () => {
    expect(coverage.length).toBe(FEATURE_RUNTIME_TIER_MAPPING.length);
    const rowIds = coverage.map((r) => r.featureId).sort();
    const regIds = FEATURE_RUNTIME_TIER_MAPPING.map((f) => f.featureId).sort();
    expect(rowIds).toEqual(regIds);
  });

  it("every byTier cell agrees with the resolver", () => {
    for (const row of coverage) {
      for (const tier of ALL_TIERS) {
        expect(row.byTier[tier]).toBe(resolveFeatureTierAvailability(row.featureId, tier));
      }
    }
  });
});
