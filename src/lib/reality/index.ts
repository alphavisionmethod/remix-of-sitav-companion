// ═══════════════════════════════════════════════════════════════
// SITA OS — Reality Layer Barrel
// Canonical import: @/lib/reality
// ═══════════════════════════════════════════════════════════════

export type {
  RealityState,
  SurfaceId,
  FeatureRealityEntry,
  FeatureRealityCoverageReport,
} from "./feature-reality-types";

export {
  FEATURE_REALITY_REGISTRY,
  ALL_SURFACES,
  getRealityForFeature,
  getRealityState,
  listFeaturesByState,
  realityCoverageStats,
} from "./feature-reality-registry";

export {
  SURFACE_CLAIM_MAP,
  getClaimsForSurface,
  isClaimAllowed,
} from "./surface-claim-map";

export type { SurfaceClaimSet } from "./surface-claim-map";

export {
  PAGE_STATE_REGISTRY,
  getPageStateContract,
  pageStateCoverageStats,
} from "./page-state-registry";

export type { PageStateContract, PageStateRequirement } from "./page-state-contract";
