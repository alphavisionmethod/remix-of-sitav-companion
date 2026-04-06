// ═══════════════════════════════════════════════════════════════
// SITA OS — Apple Ecosystem Architecture Contract
// iPhone + iPad + Apple Watch + Sign In + Trust + Health + Continuity
// ═══════════════════════════════════════════════════════════════

export type AppleSurfaceKey = "iphone" | "ipad" | "apple_watch" | "mac_desktop" | "vision_pro";
export type AppleIdentityProvider = "apple_sign_in";
export type ApplePushChannel = "apns" | "apns_voip" | "apns_complication";
export type AppleTrustClass = "trusted_iphone" | "trusted_ipad" | "trusted_watch" | "trusted_mac" | "untrusted";
export type AppleHealthSignalType = "heart_rate" | "hrv" | "steps" | "sleep" | "vo2max" | "workout" | "stand_hours" | "mindfulness" | "respiratory_rate" | "blood_oxygen" | "resting_heart_rate" | "walking_steadiness";
export type AppleLaunchTarget = "iphone_shell" | "ipad_shell" | "apple_watch" | "sign_in_with_apple" | "apple_health" | "apple_device_trust" | "apple_continuity";

export interface AppleProviderFamilyRecord {
  id: string;
  familyKey: "apple";
  displayName: string;
  description: string;
  capabilities: AppleCapabilityKey[];
  launchStage: "planned" | "alpha" | "beta" | "production";
  integrationModel: "native_sdk" | "web_api" | "hybrid";
}

export type AppleCapabilityKey =
  | "apple_identity"
  | "apple_mobile_shell"
  | "apple_watch_surface"
  | "apple_health_readiness"
  | "apple_push_channel"
  | "apple_device_trust"
  | "apple_continuity";

export interface AppleIdentityLinkRecord {
  id: string;
  userId: string;
  appleUserId: string;
  email?: string;
  fullName?: string;
  identityToken?: string;
  authorizationCode?: string;
  linkedAt: string;
  lastAuthAt?: string;
  revoked: boolean;
  sessionSemantics: "stateless" | "session_token" | "jwt";
  deviceBoundTrustLinked: boolean;
}

export interface AppleDeviceRecord {
  id: string;
  userId: string;
  surface: AppleSurfaceKey;
  deviceModel: string;
  osVersion: string;
  pushToken?: string;
  pushChannel: ApplePushChannel;
  trustClass: AppleTrustClass;
  biometricCapable: boolean;
  biometricType?: "face_id" | "touch_id" | "optic_id";
  lastSeenAt: string;
  continuityEligible: boolean;
}

export interface AppleWatchCapabilityRecord {
  id: string;
  userId: string;
  watchModel: string;
  watchOSVersion: string;
  supportedComplications: string[];
  glanceCardsEnabled: boolean;
  microApprovalEnabled: boolean;
  hapticRoutingEnabled: boolean;
  urgentFilteredAlertsOnly: boolean;
  whatMattersNowEnabled: boolean;
  snoozeEscalateEnabled: boolean;
  openOnPhoneEnabled: boolean;
  trustedActionClasses: string[];
  maxRiskTierForWatch: "low" | "medium";
}

/** Apple Watch interaction grammar */
export interface AppleWatchGrammar {
  glanceCards: { maxVisible: number; refreshIntervalSec: number; priorityOrder: string[] };
  microApprovals: { maxPendingOnWatch: number; riskCeiling: "low" | "medium"; requireBiometric: boolean };
  hapticPatterns: { urgentAlert: string; approval: string; nudge: string; escalation: string };
  escalationFlow: { watchToPhone: boolean; autoEscalateAfterSec: number; escalationTriggers: string[] };
}

export interface ApplePushRouteRecord {
  id: string;
  userId: string;
  deviceId: string;
  channel: ApplePushChannel;
  urgencyFilter: "all" | "high_and_critical" | "critical_only";
  focusModeAware: boolean;
  quietModeRespected: boolean;
  calmRouterIntegrated: boolean;
  routingPriority: number;
}

export interface AppleTrustRecord {
  id: string;
  userId: string;
  deviceId: string;
  trustClass: AppleTrustClass;
  biometricVerified: boolean;
  biometricType?: "face_id" | "touch_id" | "optic_id";
  approvalEligibleClasses: string[];
  riskTierCeiling: "low" | "medium" | "high";
  escalationTarget?: string;
  deviceBoundReceipts: boolean;
  lastVerifiedAt: string;
}

export interface AppleHealthConsentRecord {
  id: string;
  userId: string;
  signalType: AppleHealthSignalType;
  readPermission: boolean;
  routingInfluenceConsent: boolean;
  boardroomVisibilityConsent: boolean;
  assistantUseConsent: boolean;
  consentedAt: string;
  revokedAt?: string;
  privacyExplanationShown: boolean;
}

export interface AppleReadinessIntegrationRecord {
  id: string;
  userId: string;
  healthKitAvailable: boolean;
  permissionsGranted: AppleHealthSignalType[];
  lastSyncAt?: string;
  readinessDerivationEnabled: boolean;
  interruptionInfluenceEnabled: boolean;
  notificationAdjustmentEnabled: boolean;
}

export interface AppleContinuityRecord {
  id: string;
  userId: string;
  sourceDevice: AppleSurfaceKey;
  targetDevice: AppleSurfaceKey;
  handoffType: "continue_activity" | "universal_clipboard" | "sidecar" | "instant_hotspot";
  contextRef?: string;
  state: "available" | "active" | "completed" | "failed";
  initiatedAt: string;
  completedAt?: string;
}

export interface AppleLaunchReadinessRecord {
  id: string;
  target: AppleLaunchTarget;
  launchStage: "planned" | "internal" | "demo" | "pilot" | "launch_ready" | "production";
  blockers: string[];
  demoAvailable: boolean;
  pilotReady: boolean;
  launchReady: boolean;
  lastAssessedAt: string;
  evidence?: Record<string, unknown>;
}

/** iPhone/iPad shell navigation grammar */
export interface AppleMobileShellGrammar {
  navigationPattern: "tab_bar" | "sidebar" | "stack";
  primaryTabs: string[];
  taskActionGrammar: { quickCapture: boolean; swipeActions: string[]; longPressMenu: string[] };
  approvalGrammar: { inlineApproval: boolean; biometricRequired: boolean; batchApproval: boolean };
  notificationGrammar: { grouping: "by_category" | "by_urgency" | "chronological"; quickActions: string[] };
  assistantGrammar: { floatingButton: boolean; voiceActivation: boolean; contextualSuggestions: boolean };
  boardroomSummaryGrammar: { compactMode: boolean; expandable: boolean; refreshOnPull: boolean };
}

/** Full Apple ecosystem surface strategy */
export interface AppleEcosystemStrategy {
  providerFamily: AppleProviderFamilyRecord;
  surfaces: AppleSurfaceKey[];
  identityProvider: AppleIdentityProvider;
  watchGrammar: AppleWatchGrammar;
  mobileShellGrammar: AppleMobileShellGrammar;
  trustModel: { escalationChain: AppleSurfaceKey[]; biometricSurfaces: AppleSurfaceKey[] };
  continuityModel: { supportedFlows: Array<{ from: AppleSurfaceKey; to: AppleSurfaceKey }> };
  healthReadinessPath: { phase1Signals: AppleHealthSignalType[]; phase2Signals: AppleHealthSignalType[] };
  launchMatrix: AppleLaunchReadinessRecord[];
}
