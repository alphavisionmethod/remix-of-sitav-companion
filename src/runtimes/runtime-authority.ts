// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime Authority Facade
// Single authoritative entry point combining:
//   1. detectActiveRuntimeTier()  — from runtime-detection.ts
//   2. getCapabilitiesForSurface() — from runtime-capability-matrix.ts
//   3. isFeatureSupportedOn()     — from feature-runtime-tier-registry.ts
// Consumers should import from this file instead of the 3 sources.
// ═══════════════════════════════════════════════════════════════

import type { RuntimeTier, TierAvailability } from "./runtime-tier-model";
import type { RuntimeSurface, CapabilityAvailability } from "./runtime-capability-matrix";
import type { PlatformSurface } from "./surface-types";
import { detectActiveRuntimeTier, probeRuntimeTier, type RuntimeTierProbe } from "./runtime-detection";
import { getCapabilitiesForSurface, getCapabilityMatrix, type RuntimeCapabilityEntry } from "./runtime-capability-matrix";
import {
  resolveFeatureTierAvailability,
  isFeatureSupportedOn,
  isFeatureAvailableOn,
  listFeaturesForTier,
  listFeaturesNeedingDisclosure,
  enumerateFeatureCoverage,
  type FeatureRuntimeTierMapping,
  type FeatureCoverageRow,
} from "./feature-runtime-tier-registry";
import { getRuntimeTierForSurface } from "./surface-types";

// ── Unified Runtime Authority API ───────────────────────────────

export interface RuntimeAuthority {
  /** Current active tier detected at boot. */
  readonly activeTier: RuntimeTier;
  /** Full probe snapshot. */
  readonly probe: RuntimeTierProbe;
  /** Hardware capabilities for a given surface. */
  getCapabilities(surface: RuntimeSurface): Array<{ id: string; name: string; status: CapabilityAvailability }>;
  /** Feature availability on the active tier. */
  resolveFeature(featureId: string): TierAvailability;
  /** Whether a feature is natively supported on the active tier. */
  isSupported(featureId: string): boolean;
  /** Whether a feature is available (any positive status) on the active tier. */
  isAvailable(featureId: string): boolean;
  /** Resolve feature on a specific tier (cross-tier queries). */
  resolveFeatureOn(featureId: string, tier: RuntimeTier): TierAvailability;
  /** Resolve feature on a platform surface. */
  resolveFeatureForSurface(featureId: string, surface: PlatformSurface): TierAvailability;
  /** All features needing disclosure on the active tier. */
  disclosureFeatures(): readonly FeatureRuntimeTierMapping[];
  /** Full coverage matrix (all features × all tiers). */
  coverageMatrix(): readonly FeatureCoverageRow[];
  /** Features in a specific status on a tier. */
  featuresForTier(tier: RuntimeTier, status: "supported" | "simulated" | "fallback" | "roadmap"): FeatureRuntimeTierMapping[];
  /** Raw 17-entry hardware capability matrix. */
  rawCapabilityMatrix(): readonly RuntimeCapabilityEntry[];
}

/**
 * Create a RuntimeAuthority instance. Call once at boot.
 * The active tier is captured at construction time.
 */
export function createRuntimeAuthority(): RuntimeAuthority {
  const probe = probeRuntimeTier();
  const activeTier = probe.tier;

  return {
    activeTier,
    probe,
    getCapabilities: (surface) => getCapabilitiesForSurface(surface),
    resolveFeature: (featureId) => resolveFeatureTierAvailability(featureId, activeTier),
    isSupported: (featureId) => isFeatureSupportedOn(featureId, activeTier),
    isAvailable: (featureId) => isFeatureAvailableOn(featureId, activeTier),
    resolveFeatureOn: (featureId, tier) => resolveFeatureTierAvailability(featureId, tier),
    resolveFeatureForSurface: (featureId, surface) =>
      resolveFeatureTierAvailability(featureId, getRuntimeTierForSurface(surface)),
    disclosureFeatures: () => listFeaturesNeedingDisclosure(),
    coverageMatrix: () => enumerateFeatureCoverage(),
    featuresForTier: (tier, status) => listFeaturesForTier(tier, status),
    rawCapabilityMatrix: () => getCapabilityMatrix(),
  };
}

// ── Singleton for convenience ───────────────────────────────────
let _authority: RuntimeAuthority | null = null;

/** Get or create the singleton RuntimeAuthority. */
export function getRuntimeAuthority(): RuntimeAuthority {
  if (!_authority) _authority = createRuntimeAuthority();
  return _authority;
}

/** Reset singleton (for testing). */
export function resetRuntimeAuthority(): void {
  _authority = null;
}

// Re-export core types for single-import convenience
export type { RuntimeTier, TierAvailability } from "./runtime-tier-model";
export type { RuntimeSurface, CapabilityAvailability } from "./runtime-capability-matrix";
export type { PlatformSurface } from "./surface-types";