// ═══════════════════════════════════════════════════════════════
// SITA OS — UX Trust Index Barrel Export
// Central export for all UX trust patterns
// ═══════════════════════════════════════════════════════════════

// Hooks
export { useOnlineStatus, type ConnectionQuality, type UseOnlineStatusReturn } from "@/hooks/use-online-status";
export { useConfirmation, useUndoStack, type ConfirmationOptions, type UndoAction } from "@/hooks/use-confirmation";
export { useStaleData, type DataFreshness, type UseStaleDataReturn } from "@/hooks/use-stale-data";
export { useOptimisticMutation, type MutationStatus } from "@/hooks/use-optimistic-mutation";
export { useActionFeedback } from "@/platform/sita/components/sita/ActionSuccessFeedback";
export { useQueryFreshness } from "@/hooks/use-query-freshness";
export { useUndoableAction, type UseUndoableActionOptions } from "@/hooks/use-undoable-action";

// Components
export { NetworkStatusBar } from "@/platform/sita/components/sita/NetworkStatusBar";
export { ConfirmationDialog } from "@/platform/sita/components/sita/ConfirmationDialog";
export { UndoToastStack } from "@/platform/sita/components/sita/UndoToast";
export { DataFreshnessBadge } from "@/platform/sita/components/sita/DataFreshnessBadge";
export { TrustTransitionIndicator } from "@/platform/sita/components/sita/TrustTransitionIndicator";
export { ActionFeedbackStack } from "@/platform/sita/components/sita/ActionSuccessFeedback";
export { FormProgressIndicator, type SaveStatus } from "@/platform/sita/components/sita/FormProgressIndicator";
export { ContextualEmptyState } from "@/platform/sita/components/sita/ContextualEmptyState";
export { CognitiveLoadGuard } from "@/platform/sita/components/sita/CognitiveLoadGuard";
export { DegradedServiceBanner, type DegradedService } from "@/platform/sita/components/sita/DegradedServiceBanner";
export { RecoveryPrompt, type RecoverableItem } from "@/platform/sita/components/sita/RecoveryPrompt";

// Surfaces
export { ContextOrientationBar } from "@/platform/sita/components/sita/surfaces/ContextOrientationBar";
export { InformationLayerSurface } from "@/platform/sita/components/sita/surfaces/InformationLayerSurface";
export { ActionConsequencePreview } from "@/platform/sita/components/sita/surfaces/ActionConsequencePreview";

// Primitives
export { AIConfidenceDisclosure } from "@/platform/sita/components/sita/primitives/AIConfidenceDisclosure";

// Empty states
export { getContextualEmptyState, CONTEXTUAL_EMPTY_STATES } from "@/lib/ux-trust/contextual-empty-states";

// UX Principles + Microcopy
export { UX_PRINCIPLES, auditPrinciples, shouldSuppressNonCritical, getDensityGuidance } from "@/lib/ux-trust/ux-principles";
export type { UXPrincipleKey, UXPrincipleContext, UXPrincipleResult } from "@/lib/ux-trust/ux-principles";
export { getErrorCopy, getAICopy, getActionCopy, getStateCopy, getFreshnessCopy, getConfidenceLevel } from "@/lib/ux-trust/microcopy-system";
export type { AIConfidenceLevel, AIOutputType, ErrorCopyContext, AICopyContext, ActionCopyContext } from "@/lib/ux-trust/microcopy-system";

// Score calculator
export { calculateTrustScore, type TrustScoreBreakdown, type TrustScoreInput } from "@/lib/ux-trust/ux-trust-score";
