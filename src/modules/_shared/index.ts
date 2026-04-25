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

// ── Phase 1: module registry + workspace context ───────────────
export {
  useModuleRegistry,
  useRouteOwnership,
  findOwningModule,
  groupModulesByParent,
  MODULE_REGISTRY_QUERY_KEY,
  ROUTE_OWNERSHIP_QUERY_KEY,
  type ModuleRegistryRow,
  type RouteOwnershipRow,
  type ModulePillar,
  type ModuleLifecycle,
  type AuthorityLevel,
  type ModuleHealth,
} from "./registry/module-registry";

export {
  ActiveWorkspaceProvider,
  useActiveWorkspaceId,
  useMyWorkspaces,
  useActiveWorkspace,
  WorkspaceBoundary,
  type WorkspaceContextRow,
  type WorkspaceSummary,
  type WorkspacePillar,
  type MemoryScope,
  type WorkspaceVisibility,
} from "./workspace/workspace-context";