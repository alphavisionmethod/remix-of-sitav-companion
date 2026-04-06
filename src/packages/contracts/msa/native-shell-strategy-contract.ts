// ═══════════════════════════════════════════════════════════════
// SITA OS — Native App Shell Strategy Contract
// iPhone/Android Shells + Capability Mapping + Trust + Continuity
// ═══════════════════════════════════════════════════════════════

export type NativeShellPlatform = "ios" | "android" | "ios_tablet" | "android_tablet";
export type CapabilitySurfaceFit = "mobile_primary" | "mobile_supported" | "desktop_primary" | "wearable_micro_action" | "not_mobile_appropriate" | "cross_surface";
export type MobileActionClass = "push_open" | "quick_action" | "camera_capture" | "file_capture" | "swipe_gesture" | "offline_action" | "boardroom_glance" | "money_pulse" | "advisor_chat" | "approval_flow" | "notification_inline";
export type ShellLaunchStage = "planned" | "pilot" | "launch_ready" | "production";
export type NativeShellLaunchTarget = "iphone_shell" | "android_shell" | "tablet_shell" | "app_only_features" | "web_only_features" | "native_only_features";

export interface NativeShellRecord {
  id: string;
  platform: NativeShellPlatform;
  displayName: string;
  shellVersion?: string;
  technologyStack: string[];
  launchStage: ShellLaunchStage;
  supportedCapabilities: string[];
  readinessScore: number;
  rolloutStatus: "not_started" | "development" | "internal_testing" | "beta" | "staged_rollout" | "general_availability";
  blockers: string[];
}

export interface CapabilitySurfaceFitRecord {
  id: string;
  capabilityKey: string;
  capabilityName: string;
  surfaceFit: CapabilitySurfaceFit;
  mobileExperience: "full" | "adapted" | "minimal" | "not_available";
  desktopExperience: "full" | "adapted" | "minimal" | "not_available";
  wearableExperience: "micro_action" | "glance" | "not_available";
  notes?: string;
}

export interface MobileActionClassRecord {
  id: string;
  actionClass: MobileActionClass;
  displayName: string;
  description: string;
  supportedPlatforms: NativeShellPlatform[];
  requiresNativeAPI: boolean;
  offlineCapable: boolean;
  biometricRequired: boolean;
  gestureModel?: string;
}

export interface DeviceSecureActionRecord {
  id: string;
  userId: string;
  deviceId: string;
  platform: NativeShellPlatform;
  actionClass: string;
  riskTier: "low" | "medium" | "high" | "critical";
  biometricRequired: boolean;
  deviceRegistered: boolean;
  sessionSecurityLevel: "standard" | "elevated" | "maximum";
  watchEscalationEligible: boolean;
  receiptLinked: boolean;
}

export interface NativeContinuityRecord {
  id: string;
  userId: string;
  flowType: "web_to_app" | "app_to_web" | "watch_to_app" | "app_to_desktop" | "desktop_to_app";
  sourcePlatform: string;
  targetPlatform: string;
  contextType: "assistant_thread" | "boardroom_context" | "approval_flow" | "document" | "workflow" | "navigation_state";
  contextRef?: string;
  state: "available" | "initiated" | "completed" | "failed";
  seamless: boolean;
  initiatedAt: string;
  completedAt?: string;
}

export interface PushRouteBindingRecord {
  id: string;
  userId: string;
  platform: NativeShellPlatform;
  calmRouterCategory: string;
  nativePushChannel: string;
  lockScreenQuickAction: boolean;
  appInboxFallback: boolean;
  appSummaryView: boolean;
  urgencyMapping: Record<string, string>;
}

export interface MobileLaunchReadinessRecord {
  id: string;
  target: NativeShellLaunchTarget;
  launchStage: ShellLaunchStage;
  readinessScore: number;
  blockers: string[];
  featureList: string[];
  webAlternativeAvailable: boolean;
  nativeExclusive: boolean;
  lastAssessedAt: string;
}

/** Native interaction grammar */
export interface NativeInteractionGrammar {
  pushOpenFlows: { deepLinkPatterns: string[]; contextPreloading: boolean };
  quickActions: { appShortcuts: string[]; notificationActions: string[]; widgetActions: string[] };
  cameraFileCapture: { cameraDirect: boolean; documentScanner: boolean; shareExtension: boolean };
  offlineDegraded: { queuedActions: string[]; readOnlyCapabilities: string[]; syncOnReconnect: boolean };
  gestureModel: { swipeActions: string[]; longPressMenu: boolean; pullToRefresh: boolean; shakeToDismiss: boolean };
}

/** Full native shell strategy */
export interface NativeShellStrategy {
  shells: NativeShellRecord[];
  capabilityFitMatrix: CapabilitySurfaceFitRecord[];
  actionClasses: MobileActionClassRecord[];
  interactionGrammar: NativeInteractionGrammar;
  continuityFlows: NativeContinuityRecord[];
  pushBindings: PushRouteBindingRecord[];
  launchMatrix: MobileLaunchReadinessRecord[];
}
