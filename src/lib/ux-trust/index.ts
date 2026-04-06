// ═══════════════════════════════════════════════════════════════
// SITA OS — UX Trust Index Barrel Export
// Central export for all UX trust patterns
// ═══════════════════════════════════════════════════════════════

// Hooks
export { useOnlineStatus, type ConnectionQuality, type UseOnlineStatusReturn } from "@/hooks/use-online-status";
export { useConfirmation, useUndoStack, type ConfirmationOptions, type UndoAction } from "@/hooks/use-confirmation";
export { useStaleData, type DataFreshness, type UseStaleDataReturn } from "@/hooks/use-stale-data";
export { useOptimisticMutation, type MutationStatus } from "@/hooks/use-optimistic-mutation";
export { useActionFeedback } from "@/components/sita/ActionSuccessFeedback";
export { useQueryFreshness } from "@/hooks/use-query-freshness";

// Components
export { NetworkStatusBar } from "@/components/sita/NetworkStatusBar";
export { ConfirmationDialog } from "@/components/sita/ConfirmationDialog";
export { UndoToastStack } from "@/components/sita/UndoToast";
export { DataFreshnessBadge } from "@/components/sita/DataFreshnessBadge";
export { TrustTransitionIndicator } from "@/components/sita/TrustTransitionIndicator";
export { ActionFeedbackStack } from "@/components/sita/ActionSuccessFeedback";
export { FormProgressIndicator, type SaveStatus } from "@/components/sita/FormProgressIndicator";
export { ContextualEmptyState } from "@/components/sita/ContextualEmptyState";

// Empty states
export { getContextualEmptyState, CONTEXTUAL_EMPTY_STATES } from "@/lib/ux-trust/contextual-empty-states";

// Score calculator
export { calculateTrustScore, type TrustScoreBreakdown, type TrustScoreInput } from "@/lib/ux-trust/ux-trust-score";
