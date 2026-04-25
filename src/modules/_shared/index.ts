// ════════════════════════════════════════════════════════════
// @deprecated Wave 3 — `@/modules/_shared` is a deprecation
// shim. The canonical home is `@/platform/*`:
//   • @/platform/contracts/{pillar-contract,decision-queue}
//   • @/platform/registry/module-registry
//   • @/platform/workspace/workspace-context
//   • @/platform/ai
//   • @/platform/knowledge
// This barrel will be removed in Wave 9. New code MUST import
// from `@/platform/*` directly.
// ════════════════════════════════════════════════════════════

export const SHARED_LAYER = {
  id: "shared",
  label: "Shared Platform",
  description: "Shell · Identity · AI runtime · Voice · Memory · Notifications · Files · Connectors",
} as const;

export type SharedLayer = typeof SHARED_LAYER;

export type {
  PillarCapability,
  PillarManifest,
  CapabilityMaturity,
  TrustTier,
} from "@/platform/contracts/pillar-contract";

export {
  DECISION_QUEUE,
  getDecisionFor,
  type DecisionEntry,
  type SurfaceOwner,
} from "@/platform/contracts/decision-queue";

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
} from "@/platform/registry/module-registry";

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
} from "@/platform/workspace/workspace-context";

export {
  useOrchestrator,
  callOrchestrator,
  useInvocationPlan,
  useExplainabilityTraces,
  useRecentInvocations,
  ExplainabilityPanel,
  EXPLAINABILITY_QUERY_KEY,
  type OrchestratorMode,
  type OrchestratorMessage,
  type OrchestratorRequest,
  type OrchestratorResponse,
  type OrchestratorBlocked,
  type OrchestratorOutcome,
  type OrchestratorContextSources,
  type ExplainabilityTraceRow,
  type InvocationPlanRow,
} from "@/platform/ai";

export {
  fetchEffectiveWorkspaceMemories,
  recordMemoryUsage,
  fetchPendingMemoryReviews,
  resolveMemoryReview,
  fetchChunksForFile,
  searchChunks,
  listRecentIngestionJobs,
  reindexFile,
  useEffectiveWorkspaceMemories,
  usePendingMemoryReviews,
  useResolveMemoryReview,
  useFileChunks,
  useIngestionJobs,
  useReindexFile,
  useChunkSearch,
  KNOWLEDGE_QUERY_KEYS,
  MemoryProvenanceBadge,
  MemoryReviewQueue,
  IngestionStatusPanel,
  type EffectiveMemoryRow,
  type PendingMemoryReview,
  type KnowledgeChunkRow,
  type IngestionJobRow,
  type IngestionStage,
  type EmbeddingStatus,
  type ConfidenceBand,
  type Sensitivity,
  type ProvenanceKind,
  type ReviewStatus,
  type ReindexInput,
} from "@/platform/knowledge";
