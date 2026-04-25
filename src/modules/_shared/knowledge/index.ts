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