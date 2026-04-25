// ════════════════════════════════════════════════════════════
// Shared Platform — Cross-module utilities (leaf-only)
// ════════════════════════════════════════════════════════════

export const SHARED_LAYER = {
  id: "shared",
  label: "Shared Platform",
  description: "Shell · Identity · AI runtime · Voice · Memory · Notifications · Files · Connectors",
} as const;

export type SharedLayer = typeof SHARED_LAYER;

// Re-export pillar contract types so pillar manifests stay coherent.
export type {
  PillarCapability,
  PillarManifest,
  CapabilityMaturity,
  TrustTier,
} from "./pillar-contract";

// Decision-queue resolutions for ambiguous legacy surfaces.
export {
  DECISION_QUEUE,
  getDecisionFor,
  type DecisionEntry,
  type SurfaceOwner,
} from "./decision-queue";