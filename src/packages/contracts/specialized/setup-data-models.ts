// ═══════════════════════════════════════════════════════════════
// SITA OS — Setup Data Models
// Typed profile contracts for every setup domain
// ═══════════════════════════════════════════════════════════════

import type { DomainId } from "../_contract-scaffold";

// ── Extended Capability Profile ─────────────────────────────

export interface CapabilityProfileFull {
  // Core (from HardwareCapabilities)
  hasCamera: boolean;
  hasBiometric: boolean;
  hasGeolocation: boolean;
  screenSize: "small" | "medium" | "large";
  connectionType: "fast" | "slow" | "offline";
  storageAvailable: boolean;
  notificationsSupported: boolean;
  performanceTier: "low" | "medium" | "high";
  // Extended
  hasTPM: boolean;
  hasSecureEnclave: boolean;
  biometricTypes: ("fingerprint" | "face" | "iris")[];
  hasMicrophone: boolean;
  hasBattery: boolean;
  batteryLevel: number | null; // 0-100
  hasCellular: boolean;
  hasEthernet: boolean;
  hasWifi: boolean;
  displayClass: "phone" | "tablet" | "laptop" | "desktop" | "tv";
  inputModes: ("touch" | "keyboard" | "mouse" | "pen" | "voice" | "controller")[];
  deviceClass: "mobile" | "tablet" | "desktop" | "embedded";
  supportsReducedEffectsRecommendation: boolean;
  hardwareWarnings: HardwareWarning[];
}

export interface HardwareWarning {
  code: string;
  severity: "info" | "warning" | "critical";
  message: string;
  recommendation?: string;
}

// ── Security Baseline ───────────────────────────────────────

export interface SecurityBaseline {
  secureBootStatus: "verified" | "unverified" | "unavailable";
  encryptionSupportLevel: "full" | "partial" | "none";
  encryptionEnabled: boolean;
  integrityCheckStatus: "passed" | "failed" | "skipped";
  recoveryEnvironmentStatus: "present" | "absent" | "degraded";
  hardwareBackedKeySupport: boolean;
  degradedProtectionReason?: string;
  userVisibleSecurityMode: "full" | "standard" | "reduced";
  advancedDetailsAvailable: boolean;
}

// ── Ownership Profile ───────────────────────────────────────

export type OwnershipType = "personal" | "family" | "work" | "managed";

export interface OwnershipProfile {
  ownershipType: OwnershipType;
  sharedProfileExpected: boolean;
  managedProfileExpected: boolean;
  privacyDefaultPreset: "strict" | "balanced" | "open";
  trustDefaultPreset: "cautious" | "balanced" | "autonomous";
  advisorDefaultPreset: "minimal" | "standard" | "full";
  connectionRecommendationPreset: "conservative" | "standard" | "aggressive";
}

// ── Identity Profile ────────────────────────────────────────

export type AuthPath = "sita-account" | "google" | "apple" | "email-password" | "offline" | "managed";

export interface IdentityProfile {
  authPath: AuthPath;
  signedIn: boolean;
  provider?: string;
  userId?: string;
  displayName?: string;
  avatarUrl?: string;
  trustedDeviceIntent: boolean;
  lastKnownEnvironmentId?: string;
  environmentCandidates: EnvironmentCandidate[];
}

export interface EnvironmentCandidate {
  id: string;
  name: string;
  lastUsed: string;
  deviceName?: string;
  completeness: number;
}

// ── Restore Profile ─────────────────────────────────────────

export type RestoreAvailability = "full" | "partial" | "none" | "checking";

export interface RestoreProfile {
  restoreRequested: boolean;
  restoreSourceId?: string;
  restoreAvailability: RestoreAvailability;
  restoreCompleteness: number; // 0-100
  restoreItemsAvailable: RestoreItem[];
  restoreItemsSelected: string[];
  restoreMetadata?: Record<string, unknown>;
  restoreWarnings: string[];
}

export interface RestoreItem {
  id: string;
  category: "settings" | "advisors" | "trust" | "connections" | "world-model" | "preferences" | "workflows";
  label: string;
  available: boolean;
  size?: string;
}

// ── Access Profile ──────────────────────────────────────────

export type AccessMethodType = "pin" | "password" | "passphrase";
export type RecoveryMethodType = "email" | "phone" | "recovery-key" | "trusted-contact";

export interface AccessProfile {
  accessMethodType: AccessMethodType;
  hasPrimarySecret: boolean;
  biometricEnrolled: boolean;
  biometricTypesEnabled: ("fingerprint" | "face" | "iris")[];
  recoveryMethodConfigured: boolean;
  recoveryMethodType?: RecoveryMethodType;
  accessWarnings: string[];
}

// ── Privacy Profile ─────────────────────────────────────────

export type AwarenessLevel = "full" | "limited" | "none";

export interface PrivacyProfile {
  calendarAwareness: AwarenessLevel;
  communicationAwareness: AwarenessLevel;
  fileAwareness: AwarenessLevel;
  moneyAwareness: AwarenessLevel;
  householdAwareness: AwarenessLevel;
  behaviorLearning: AwarenessLevel;
  proactiveSupport: AwarenessLevel;
  enforcedManagedPolicies: string[];
  privacyPresetSource: "recommended" | "custom" | "managed";
  proofPreviewSeen: boolean;
}

// ── Starter Profile ─────────────────────────────────────────

export type SupportStyle = "hands-off" | "guided" | "proactive" | "copilot";
export type InformationDepth = "headlines" | "summaries" | "detailed" | "deep";

export interface StarterProfile {
  primaryFocusArea?: string;
  commonSlipAreas: string[];
  preferredSupportStyle: SupportStyle;
  preferredInformationDepth: InformationDepth;
  immediateGoal?: string;
  confidenceScore: number; // 0-1
}

// ── World Model ─────────────────────────────────────────────

export interface WorldModelDomainState {
  responses: Record<string, unknown>;
  confidence: number; // 0-1
  sensitivity: "low" | "medium" | "high";
  completeness: number; // 0-1
}

export interface WorldModel {
  lifeRhythm?: Record<string, unknown>;
  householdContext?: Record<string, unknown>;
  workContext?: Record<string, unknown>;
  moneyContext?: Record<string, unknown>;
  communicationStyle?: Record<string, unknown>;
  goalsAndStressors?: Record<string, unknown>;
  supportDomains: string[];
  inferredNeeds: string[];
  explicitNeeds: string[];
  confidenceByDomain: Record<string, number>;
  sensitivityByDomain: Record<string, "low" | "medium" | "high">;
  completionByDomain: Record<string, number>;
  domains: Record<string, WorldModelDomainState>;
}

// ── Use Mode Profile ────────────────────────────────────────

export type UseModeId = "personal" | "family" | "business" | "money" | "full";

export interface UseModeProfile {
  selectedMode: UseModeId;
  recommendedMode?: UseModeId;
  recommendationReason?: string;
  modulePriority: DomainId[];
  connectionPriority: string[];
  advisorWeightingMap: Record<string, number>;
}

// ── Trust Profile ───────────────────────────────────────────

export type AutonomyLevel = "observe" | "suggest" | "simulate" | "ask" | "auto";
export type ActionPolicy = "always-ask" | "suggest" | "auto-with-review" | "auto";
export type EscalationStyle = "immediate" | "batched" | "daily-summary";

export interface TrustProfile {
  autonomyLevel: AutonomyLevel;
  calendarActionPolicy: ActionPolicy;
  communicationActionPolicy: ActionPolicy;
  financeActionPolicy: ActionPolicy;
  notificationIntensity: "minimal" | "balanced" | "full";
  escalationStyle: EscalationStyle;
  householdPermissionRules: Record<string, unknown>;
  businessPermissionRules: Record<string, unknown>;
  automationBoundaries: Record<string, unknown>;
  proofModeEnabled: boolean;
  spendingThreshold?: number;
  approvalRules: ApprovalRule[];
}

export interface ApprovalRule {
  domain: string;
  action: string;
  requiresApproval: boolean;
  threshold?: number;
}

// ── Advisor Profile ─────────────────────────────────────────

export interface AdvisorActivation {
  advisorId: string;
  displayName: string;
  domain: string;
  active: boolean;
  activityLevel: "quiet" | "balanced" | "proactive";
}

export interface AdvisorProfile {
  activeAdvisors: AdvisorActivation[];
  advisorPriorityMap: Record<string, number>;
  advisorActivityLevels: Record<string, "quiet" | "balanced" | "proactive">;
  advisorSurfaceMap: Record<string, string[]>;
  samplePreviewSeen: boolean;
}

// ── Connection Profile ──────────────────────────────────────

export type ConnectionStatus = "connected" | "pending" | "failed" | "deferred";

export interface ConnectedService {
  serviceId: string;
  serviceType: string;
  displayName: string;
  status: ConnectionStatus;
  connectedAt?: string;
  capabilities: string[];
  dataReadiness: "ready" | "syncing" | "partial" | "empty";
}

export interface ConnectionProfile {
  onlineStatus: "online" | "offline" | "limited";
  connectedServices: ConnectedService[];
  recommendedServices: string[];
  deferredServices: string[];
  failedConnections: string[];
  importedDataReadiness: Record<string, "ready" | "partial" | "empty">;
  connectionConfidenceMap: Record<string, number>;
  unlockedCapabilities: string[];
}

// ── First Win Profile ───────────────────────────────────────

export interface FirstWinOption {
  id: string;
  label: string;
  description: string;
  domain: DomainId;
  confidence: number;
  reason: string;
  preparedArtifacts: string[];
}

export interface FirstWinProfile {
  recommendedWins: FirstWinOption[];
  selectedWin?: string;
  selectionReason?: string;
  preparedArtifacts: string[];
  confidenceScore: number;
  visibleDesktopModule?: string;
  boardroomSeed?: Record<string, unknown>;
}

// ── Arrival Summary ─────────────────────────────────────────

export interface ArrivalSummary {
  activeMode: UseModeId;
  activeAdvisors: string[];
  trustMode: AutonomyLevel;
  connectedSystems: string[];
  preparedWorkflow?: string;
  privacyBaselineSummary: string;
  deferredItems: SetupDeferredItem[];
  desktopPreviewModel: Record<string, unknown>;
  welcomePriorities: string[];
}

// ── Deferred Items ──────────────────────────────────────────

export type DeferredItemType = "security" | "connection" | "personalization" | "privacy" | "advisor" | "recovery";
export type DeferredItemUrgency = "low" | "medium" | "high";

export interface SetupDeferredItem {
  itemId: string;
  itemType: DeferredItemType;
  label: string;
  reasonSkipped: string;
  recommendedFollowUpLocation: string;
  urgency: DeferredItemUrgency;
  userVisibleSummary: string;
}

// ── Global Session States ───────────────────────────────────

export type GlobalSetupState =
  | "not_started"
  | "boot_preparing"
  | "machine_foundation_in_progress"
  | "awaiting_user_input"
  | "validating"
  | "processing"
  | "restarting_for_continuation"
  | "resumed_from_restart"
  | "degraded_continueable"
  | "blocked_requires_resolution"
  | "user_setup_in_progress"
  | "setup_ready_for_arrival"
  | "completed"
  | "completed_with_deferred_items";

// ── Error Categories ────────────────────────────────────────

export type SetupErrorCategory =
  | "machine-capability"
  | "security-baseline"
  | "network"
  | "update"
  | "identity-auth"
  | "restore"
  | "access"
  | "recovery-setup"
  | "privacy-policy-conflict"
  | "personalization-incomplete"
  | "connection"
  | "low-power"
  | "managed-policy";

export interface SetupError {
  category: SetupErrorCategory;
  code: string;
  message: string;
  recoveryOptions: ("retry" | "skip" | "alternate" | "back" | "blocked" | "details")[];
  userVisibleMessage: string;
  technicalDetail?: string;
}
