// ═══════════════════════════════════════════════════════════════
// SITA OS — MSA Contract: Wearable Surface Adapters
// Apple Watch, Wear OS, Ring, Band architecture layers
// ═══════════════════════════════════════════════════════════════

import type { DeviceFamilyKey, TrustClass, WearablePrimaryRole } from "./device-family-contract";

// ── Wearable Provider Record ──
export type WearableAuthMethod = "oauth2" | "api_key" | "companion_app" | "ble_pairing" | "sdk" | "none";
export type ApiAvailabilityClass = "public_api" | "partner_api" | "sdk_only" | "companion_only" | "unavailable";
export type WearableLaunchStage = "production" | "beta" | "pilot" | "research" | "planned" | "unsupported";

export interface WearableProviderRecord {
  wearableProviderId: string;
  providerKey: string;
  name: string;
  categoriesSupported: DeviceFamilyKey[];
  authMethod: WearableAuthMethod;
  apiAvailabilityClass: ApiAvailabilityClass;
  launchStage: WearableLaunchStage;
  primaryRoles: WearablePrimaryRole[];
  createdAt: string;
}

// ── Wearable Signal Record ──
export type WearableSignalType =
  | "heart_rate" | "resting_heart_rate" | "activity_state" | "sleep_state"
  | "strain" | "recovery" | "workout_state" | "movement" | "steps"
  | "focus_proxy" | "stress_proxy" | "standing" | "calories" | "spo2" | "other";

export interface WearableSignalRecord {
  wearableSignalId: string;
  connectedDeviceId: string;
  providerKey: string;
  signalType: WearableSignalType;
  rawValue: number | string;
  normalizedValue?: number;
  unit: string;
  confidence: number;
  capturedAt: string;
  processedAt?: string;
}

// ── Readiness State Record ──
export type ReadinessLevel = "optimal" | "good" | "moderate" | "low" | "recovering" | "unknown";
export type InterruptionSensitivity = "receptive" | "moderate" | "sensitive" | "unavailable";

export interface ReadinessStateRecord {
  readinessStateId: string;
  userId: string;
  sourceWindow: string;
  readinessLevel: ReadinessLevel;
  workloadTolerance: "high" | "medium" | "low";
  interruptionSensitivity: InterruptionSensitivity;
  recoveryState?: string;
  focusRecommendation?: string;
  derivedFromSignals: string[];
  confidence: number;
  createdAt: string;
}

// ── Health Signal Consent Record ──
export interface HealthSignalConsentRecord {
  consentId: string;
  userId: string;
  providerKey: string;
  signalTypesAllowed: WearableSignalType[];
  routingInfluenceAllowed: boolean;
  boardroomVisibilityAllowed: boolean;
  assistantUseAllowed: boolean;
  notificationUseAllowed: boolean;
  grantedAt: string;
  revokedAt?: string;
  mode: "active" | "paused" | "revoked";
}

// ── Watch Surface Adapter ──
export interface WatchCardGrammar {
  cardType: "glance" | "detail" | "action" | "summary";
  maxLines: number;
  supportsHaptic: boolean;
  supportsTap: boolean;
  supportsSwipe: boolean;
}

export interface WatchNotificationRouter {
  urgencyThreshold: "critical_only" | "high_and_above" | "medium_and_above" | "all";
  fatigueSuppression: boolean;
  focusAwareRouting: boolean;
  healthReadinessSuppression: boolean;
  quietHoursEnforced: boolean;
}

export interface WatchActionCapability {
  actionKey: string;
  displayLabel: string;
  actionType: "approve" | "deny" | "snooze" | "escalate" | "mark_seen" | "route_to_assistant" | "quick_complete" | "defer";
  requiresTrust: TrustClass;
  hapticFeedback: boolean;
}

export interface WatchSurfaceAdapter {
  surfaceKey: "apple_watch" | "wear_os";
  cardGrammar: WatchCardGrammar;
  notificationRouter: WatchNotificationRouter;
  actionCapabilities: WatchActionCapability[];
  handoffTarget: "phone" | "desktop" | "any";
  complicationSupport: boolean;
}

// ── Ring / Band Signal Adapter ──
export interface RingSignalConnector {
  providerKey: string;
  signalTypes: WearableSignalType[];
  pollingIntervalMs: number;
  realtimeAvailable: boolean;
}

export interface SignalNormalizationLayer {
  signalType: WearableSignalType;
  sourceUnit: string;
  canonicalUnit: string;
  transform: "passthrough" | "scale" | "classify" | "aggregate";
  confidenceFloor: number;
}

export interface RoutingInfluenceRule {
  signalType: WearableSignalType;
  condition: string;
  effect: "suppress_non_urgent" | "delay_proactive" | "escalate_to_phone" | "silent_mode" | "reduce_frequency";
  description: string;
}

// ── Micro-Approval Policy ──
export interface MicroApprovalPolicyRecord {
  microApprovalPolicyId: string;
  userId: string;
  deviceFamilyId: string;
  actionClass: string;
  allowed: boolean;
  maxRiskTier: "low" | "medium" | "high";
  requiresPhoneEscalation: boolean;
  requiresBiometric: boolean;
  createdAt: string;
}

// ── Device Approval Receipt ──
export interface DeviceApprovalReceiptRecord {
  deviceApprovalReceiptId: string;
  userId: string;
  actionId: string;
  connectedDeviceId: string;
  approvalClass: string;
  trustClass: TrustClass;
  outcome: "approved" | "denied" | "escalated" | "expired";
  createdAt: string;
}

// ── Ambient Notification Route Record ──
export interface AmbientNotificationRouteRecord {
  routeId: string;
  userId: string;
  eventId?: string;
  urgencyClass: "critical" | "high" | "normal" | "low" | "background";
  selectedDeviceId?: string;
  selectedSurface: string;
  selectedChannel: string;
  routeReason: string;
  fatigueScore: number;
  deferred: boolean;
  deliveredAt?: string;
  createdAt: string;
}

// ── Unified User Device Graph ──
export type GraphNodeType = "identity" | "connector_account" | "device" | "wearable" | "workspace" | "entity" | "other";
export type GraphEdgeType = "owns" | "trusts" | "paired_with" | "linked_to" | "monitors" | "provides_signal";

export interface UnifiedUserDeviceGraphRecord {
  graphRecordId: string;
  userId: string;
  nodeType: GraphNodeType;
  nodeRef: string;
  edgeType: GraphEdgeType;
  relatedNodeRef: string;
  createdAt: string;
}

// ── Ambient Launch Readiness ──
export type LaunchHonestyClass = "production" | "pilot" | "demo_only" | "internal_only" | "planned" | "unsupported";

export interface AmbientLaunchReadinessRecord {
  readinessId: string;
  deviceFamilyId?: string;
  providerKey?: string;
  mode: "real" | "demo" | "internal";
  implementationState: string;
  launchHonestyClass: LaunchHonestyClass;
  notes?: string;
  updatedAt: string;
}
