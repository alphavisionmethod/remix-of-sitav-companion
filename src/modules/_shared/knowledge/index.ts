export * from "./memory-service";
export * from "./knowledge-service";
export * from "./use-knowledge";
export { MemoryProvenanceBadge } from "./MemoryProvenanceBadge";
export { MemoryReviewQueue } from "./MemoryReviewQueue";
export { IngestionStatusPanel } from "./IngestionStatusPanel";

// ── Phase 6 — Voice spine + semantic surfaces ─────────────────
export * from "./voice-service";
export * from "./use-voice-spine";
export { SemanticContextBadge, type RetrievalKind, type SemanticContextBadgeProps } from "./SemanticContextBadge";
export { VoiceTranscriptDrawer, type VoiceTranscriptDrawerProps } from "./VoiceTranscriptDrawer";
export { EmbeddingHealthPanel } from "./EmbeddingHealthPanel";

// ── Phase 7 — Live Cortex surfaces ────────────────────────────
export { EmbeddingBudgetPanel } from "./EmbeddingBudgetPanel";

// ── Phase 8 — Federation + voice→agent bridge ────────────────
export { dispatchVoiceIntent, type DispatchVoiceIntentResponse } from "./voice-service";
export { useDispatchVoiceIntent } from "./use-voice-spine";

// ── Phase 8.b — Federation surfaces + multi-modal ingest ──────
export {
  listFederationOverview,
  createFederation,
  revokeFederation,
  federateMemories,
  type WorkspaceFederationRow,
  type FederationOverviewRow,
  type CreateFederationInput,
  type FederationStatus,
  type FederationSensitivity,
  type FederateMemoriesResult,
} from "./federation-service";
export {
  useFederationOverview,
  useCreateFederation,
  useRevokeFederation,
  useFederateMemories,
} from "./use-federation";
export {
  ingestMedia,
  modalityFromMime,
  getMediaPreviewUrl,
  type Modality,
  type IngestMediaInput,
  type IngestMediaResult,
} from "./multimodal-service";
export { MultiModalIngestPanel } from "./MultiModalIngestPanel";

// ── Phase 9 — Federated semantic retrieval ─────────────────────
export {
  searchFederatedChunks,
  searchFederatedMemories,
  type FederatedChunkHit,
  type FederatedMemoryHit,
} from "./federated-retrieval-service";

// ── Phase 10 — Federated attribution + cross-workspace approvals ──
export {
  fetchAttributionSummary,
  groupAttributionByWorkspace,
  type AttributionSummaryRow,
  type AttributionGroup,
} from "./attribution-service";
export {
  listCrossWorkspaceApprovals,
  requestCrossWorkspaceApproval,
  decideCrossWorkspaceApproval,
  type ApprovalStatus,
  type ApprovalActionKind,
  type ApprovalSensitivity,
  type CrossWorkspaceApprovalRow,
  type RequestApprovalInput,
  type DecideApprovalInput,
} from "./cross-workspace-approval-service";
export {
  useCrossWorkspaceApprovals,
  useRequestCrossWorkspaceApproval,
  useDecideCrossWorkspaceApproval,
  useAttributionSummary,
} from "./use-cross-workspace-approvals";
export { FederatedAttributionPanel } from "./FederatedAttributionPanel";
export { CrossWorkspaceApprovalQueue } from "./CrossWorkspaceApprovalQueue";