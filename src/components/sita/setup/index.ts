// ═══════════════════════════════════════════════════════════════
// SITA OS — Setup Reusable Components Barrel Export
// ═══════════════════════════════════════════════════════════════

// Shell & Layout
export { SetupShell } from "./SetupShell";
export { SetupStageHeader } from "./SetupStageHeader";
export { PremiumProgressRail } from "./PremiumProgressRail";
export { AmbientFormationCanvas } from "./AmbientFormationCanvas";

// Information & Trust
export { TrustInfoCard } from "./TrustInfoCard";
export { AdvancedDetailsDisclosure } from "./AdvancedDetailsDisclosure";
export { RecoveryStateCard } from "./RecoveryStateCard";

// Status & Preview
export { SystemStatusPreview } from "./SystemStatusPreview";
export { StageTransitionController } from "./StageTransitionController";
export { persistSetupState, loadPersistedSetupState, clearPersistedSetupState } from "./SetupPersistenceManager";

// Boot Phase Panels
export { NetworkSelectionPanel } from "./NetworkSelectionPanel";
export { UpdateProgressExperience } from "./UpdateProgressExperience";
export { OwnershipModeSelector } from "./OwnershipModeSelector";
export { AccountPathChooser } from "./AccountPathChooser";
export { RestorePreviewCard } from "./RestorePreviewCard";

// Security Panels
export { AccessProtectionFlow } from "./AccessProtectionFlow";
export { BiometricEnrollmentPanel } from "./BiometricEnrollmentPanel";
export { RecoveryMethodCard } from "./RecoveryMethodCard";

// Privacy & Identity
export { PrivacyPermissionCards } from "./PrivacyPermissionCards";
export { TransparencyPreviewCard } from "./TransparencyPreviewCard";
export { QuickIdentityCardStack } from "./QuickIdentityCardStack";
export { WorldModelConversationPanels } from "./WorldModelConversationPanels";

// Preview & Selection
export { LiveEnvironmentModelPreview } from "./LiveEnvironmentModelPreview";
export { UseModeSelectionCards } from "./UseModeSelectionCards";
export { TrustLadderControl } from "./TrustLadderControl";
export { TrustWorkflowPreview } from "./TrustWorkflowPreview";

// Advisor & Connections
export { AdvisorActivationGrid } from "./AdvisorActivationGrid";
export { AdvisorActivityControl } from "./AdvisorActivityControl";
export { RecommendedConnectionsPanel } from "./RecommendedConnectionsPanel";
export { ConnectionValuePreviewCard } from "./ConnectionValuePreviewCard";

// Arrival
export { FirstWinRecommendationCard } from "./FirstWinRecommendationCard";
export { SetupSummaryExperience } from "./SetupSummaryExperience";
export { DesktopArrivalTransitionController } from "./DesktopArrivalTransitionController";
export { WelcomeStateComposer } from "./WelcomeStateComposer";

// Wow & Polish (new)
export { SignatureWowMoment } from "./SignatureWowMoment";
export type { WowMomentId } from "./SignatureWowMoment";
export { ChapterTransition } from "./ChapterTransition";
export { ConfidenceIndicator, computeConfidenceLevel } from "./ConfidenceIndicator";
export type { ConfidenceLevel } from "./ConfidenceIndicator";
export { DeferredCompletionCenter, buildDeferredItems } from "./DeferredCompletionCenter";
export type { DeferredItem } from "./DeferredCompletionCenter";

// Skeleton & Transitions
export { SetupPhaseSkeleton } from "./SetupPhaseSkeleton";

// Language & Region
export { SetupLanguageRegion } from "./SetupLanguageRegion";

// Extracted Reusable Components
export { NetworkAdvancedOptionsDisclosure } from "./NetworkAdvancedOptionsDisclosure";
export { DeviceReadinessStatusCard } from "./DeviceReadinessStatusCard";
export type { ReadinessStatus } from "./DeviceReadinessStatusCard";
export { ContinuationAfterRestartView } from "./ContinuationAfterRestartView";
