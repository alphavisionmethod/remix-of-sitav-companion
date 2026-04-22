// ═══════════════════════════════════════════════════════════════
// SITA OS — Features Top-Level Barrel
// Canonical import: @/features
//
// Exports the feature registry, contracts, and boundary policy.
// Individual feature domains are imported via @/features/<domain>.
// ═══════════════════════════════════════════════════════════════

// Registry
export {
  FEATURE_REGISTRY,
  getFeatureSurface,
  getFeatureByRoute,
  getFeaturesByDomain,
  getFeaturesWithProofGaps,
  getFeaturesWithoutTrustIntegration,
} from "./feature-registry";

// Contracts
export type {
  FeatureSurfaceEntry,
  FeatureState,
  ProofDimension,
  ProofCoverage,
} from "./_contracts/feature-surface-contract";

export {
  FEATURE_STATE_GRAMMAR,
  PROOF_DIMENSIONS,
  isFeatureDeployed,
  hasProofGap,
  featureStateGap,
} from "./_contracts/feature-surface-contract";

// Boundary Policy
export {
  FEATURE_IMPORT_ALLOWED_SOURCES,
  FEATURE_IMPORT_PROHIBITED_SOURCES,
  PAGE_CANONICAL_DIRS,
} from "./_contracts/feature-boundary-policy";