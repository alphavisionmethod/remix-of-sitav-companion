// ═══════════════════════════════════════════════════════════════
// SITA OS — Android / Wear OS Ecosystem Architecture Contract
// Android + Wear OS + Trust + Push + Health Connect
// ═══════════════════════════════════════════════════════════════

export type AndroidSurfaceKey = "android_phone" | "android_tablet" | "wear_os" | "chromebook" | "android_tv";
export type AndroidPushChannel = "fcm" | "fcm_data" | "fcm_notification";
export type AndroidTrustClass = "trusted_phone" | "trusted_tablet" | "trusted_watch" | "untrusted";
export type HealthConnectSignalType = "heart_rate" | "steps" | "sleep" | "exercise" | "blood_glucose" | "blood_pressure" | "body_temperature" | "oxygen_saturation" | "respiratory_rate" | "nutrition";
export type AndroidLaunchTarget = "android_shell" | "wear_os_shell" | "android_trust" | "android_health" | "android_push";

export interface AndroidProviderFamilyRecord {
  id: string;
  familyKey: "android";
  displayName: string;
  description: string;
  capabilities: AndroidCapabilityKey[];
  launchStage: "planned" | "alpha" | "beta" | "production";
}

export type AndroidCapabilityKey =
  | "android_mobile_shell"
  | "wearos_surface"
  | "android_push_channel"
  | "android_device_trust"
  | "android_health_readiness";

export interface AndroidDeviceRecord {
  id: string;
  userId: string;
  surface: AndroidSurfaceKey;
  deviceModel: string;
  androidVersion: string;
  manufacturer: string;
  pushToken?: string;
  pushChannel: AndroidPushChannel;
  trustClass: AndroidTrustClass;
  biometricCapable: boolean;
  biometricTypes?: ("fingerprint" | "face" | "iris")[];
  lastSeenAt: string;
  playServicesAvailable: boolean;
}

export interface WearOSCapabilityRecord {
  id: string;
  userId: string;
  watchModel: string;
  wearOSVersion: string;
  tilesSupported: string[];
  complicationsSupported: string[];
  microActionsEnabled: boolean;
  glanceableStatesEnabled: boolean;
  filteredAlertsOnly: boolean;
  escalateToPhoneEnabled: boolean;
  urgencyPatterns: string[];
  trustLimitations: string[];
  maxRiskTierForWatch: "low" | "medium";
}

/** Wear OS interaction grammar */
export interface WearOSGrammar {
  tiles: { maxActive: number; refreshIntervalSec: number; layouts: string[] };
  complications: { maxSlots: number; dataTypes: string[] };
  microActions: { approveReject: boolean; snooze: boolean; escalate: boolean; dismiss: boolean };
  escalation: { watchToPhone: boolean; autoEscalateSec: number; vibrationPattern: string };
  glanceStates: { whatMattersNow: boolean; urgentAlerts: boolean; dailySummary: boolean };
}

export interface AndroidPushRouteRecord {
  id: string;
  userId: string;
  deviceId: string;
  channel: AndroidPushChannel;
  urgencyFilter: "all" | "high_and_critical" | "critical_only";
  dndAware: boolean;
  focusModeAware: boolean;
  calmRouterIntegrated: boolean;
  routingPriority: number;
  notificationChannelId?: string;
}

export interface AndroidTrustRecord {
  id: string;
  userId: string;
  deviceId: string;
  trustClass: AndroidTrustClass;
  biometricVerified: boolean;
  biometricTypes?: ("fingerprint" | "face" | "iris")[];
  keystoreSecured: boolean;
  approvalEligibleClasses: string[];
  riskTierCeiling: "low" | "medium" | "high";
  escalationTarget?: string;
  deviceBoundReceipts: boolean;
  safetyNetVerified: boolean;
  lastVerifiedAt: string;
}

export interface AndroidHealthConsentRecord {
  id: string;
  userId: string;
  signalType: HealthConnectSignalType;
  readPermission: boolean;
  routingInfluenceConsent: boolean;
  assistantUseConsent: boolean;
  consentedAt: string;
  revokedAt?: string;
  privacyExplanationShown: boolean;
}

export interface AndroidLaunchReadinessRecord {
  id: string;
  target: AndroidLaunchTarget;
  launchStage: "planned" | "internal" | "demo" | "pilot" | "launch_ready" | "production";
  blockers: string[];
  demoAvailable: boolean;
  pilotReady: boolean;
  launchReady: boolean;
  lastAssessedAt: string;
}

/** Android mobile shell grammar */
export interface AndroidMobileShellGrammar {
  navigationPattern: "bottom_nav" | "drawer" | "rail";
  primaryDestinations: string[];
  taskApprovalPatterns: { inlineApproval: boolean; biometricRequired: boolean; notificationActions: boolean };
  boardroomSummary: { widgetSupport: boolean; compactView: boolean };
  alertRouting: { headsUp: boolean; channelGrouping: boolean; bubbleSupport: boolean };
  commandCenter: { quickSettings: boolean; appShortcuts: string[] };
  advisorChat: { bubbleMode: boolean; notificationReply: boolean };
  quickCapture: { cameraShortcut: boolean; shareSheet: boolean; voiceInput: boolean };
}

/** Full Android ecosystem strategy */
export interface AndroidEcosystemStrategy {
  providerFamily: AndroidProviderFamilyRecord;
  surfaces: AndroidSurfaceKey[];
  wearOSGrammar: WearOSGrammar;
  mobileShellGrammar: AndroidMobileShellGrammar;
  trustModel: { escalationChain: AndroidSurfaceKey[]; biometricSurfaces: AndroidSurfaceKey[] };
  healthConnectPath: { phase1Signals: HealthConnectSignalType[]; phase2Signals: HealthConnectSignalType[] };
  launchMatrix: AndroidLaunchReadinessRecord[];
}
