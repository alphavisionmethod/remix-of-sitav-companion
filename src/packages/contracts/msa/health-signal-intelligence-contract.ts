// ═══════════════════════════════════════════════════════════════
// SITA OS — Health / Readiness / Signal Intelligence Contract
// Wearables + Health + Recovery + Consent + Privacy + Timing
// ═══════════════════════════════════════════════════════════════

export type SignalProviderKey = "apple_health" | "health_connect" | "fitbit" | "garmin" | "oura" | "whoop" | "polar" | "samsung_health" | "manual_input" | "device_focus_state";
export type SignalCategory = "heart_rate" | "hrv" | "sleep" | "activity" | "strain" | "recovery" | "readiness" | "temperature" | "respiratory" | "blood_oxygen" | "stress" | "focus" | "movement" | "workout";
export type NormalizedState = "activity_state" | "sleep_state" | "strain_load" | "recovery_state" | "focus_proxy" | "interruption_sensitivity" | "workout_state" | "movement_state";
export type SignalReadinessLevel = "high" | "medium" | "low" | "overload_risk" | "recovery_priority" | "deep_focus" | "dnd_recommended" | "low_interruption" | "ideal_strategic_window";
export type VisibilityScope = "raw_only" | "derived_only" | "user_visible" | "assistant_visible" | "boardroom_visible" | "not_visible";
export type SignalLaunchTarget = "signal_ingestion" | "normalization" | "readiness_derivation" | "routing_influence" | "assistant_timing" | "demo_signals";

export interface SignalProviderRecord {
  id: string;
  providerKey: SignalProviderKey;
  displayName: string;
  description: string;
  supportedSignals: SignalCategory[];
  requiresNativeApp: boolean;
  requiresPartnerProgram: boolean;
  apiType: "rest" | "sdk" | "healthkit" | "health_connect" | "manual";
  launchStage: "planned" | "alpha" | "beta" | "production";
  privacyTier: "high" | "standard";
}

export interface HealthSignalConsentRecord {
  id: string;
  userId: string;
  providerKey: SignalProviderKey;
  signalCategory: SignalCategory;
  ingestionConsent: boolean;
  routingInfluenceConsent: boolean;
  boardroomVisibilityConsent: boolean;
  assistantUseConsent: boolean;
  revokeEraseAvailable: boolean;
  privacyExplanationShown: boolean;
  consentedAt: string;
  revokedAt?: string;
}

export interface RawSignalRecord {
  id: string;
  userId: string;
  providerKey: SignalProviderKey;
  signalCategory: SignalCategory;
  rawValue: number | string;
  unit: string;
  recordedAt: string;
  ingestedAt: string;
  syntheticFlag: boolean;
  metadata?: Record<string, unknown>;
}

export interface NormalizedSignalRecord {
  id: string;
  userId: string;
  normalizedState: NormalizedState;
  value: number;
  confidence: number;
  derivedFrom: SignalProviderKey[];
  normalizedAt: string;
  validUntil?: string;
}

export interface ReadinessStateRecord {
  id: string;
  userId: string;
  readinessLevel: ReadinessLevel;
  interruptionSensitivity: "silent" | "critical_only" | "low" | "normal" | "high";
  derivedFrom: NormalizedState[];
  confidence: number;
  computedAt: string;
  validUntil?: string;
  overrideByUser: boolean;
}

export interface InterruptionPostureRecord {
  id: string;
  userId: string;
  posture: "open" | "selective" | "restricted" | "silent";
  readinessRef: string;
  allowedCategories: string[];
  suppressedCategories: string[];
  deferredCategories: string[];
  escalationCategories: string[];
  targetSurface?: string;
  computedAt: string;
}

export interface SignalInfluenceRecord {
  id: string;
  userId: string;
  readinessLevel: ReadinessLevel;
  influenceType: "suppress" | "defer" | "escalate" | "route_surface" | "adjust_timing";
  targetCategory: string;
  targetSurface?: string;
  priority: number;
  enabled: boolean;
  description: string;
}

export interface VisibilityPolicyRecord {
  id: string;
  userId: string;
  signalCategory: SignalCategory;
  rawVisibility: VisibilityScope;
  derivedVisibility: VisibilityScope;
  userVisibleExplanation: boolean;
  assistantAccessLevel: "none" | "derived_only" | "full";
  boardroomAccessLevel: "none" | "summary_only" | "detailed";
}

export interface SyntheticSignalScenarioRecord {
  id: string;
  scenarioName: string;
  description: string;
  signals: Array<{ providerKey: SignalProviderKey; signalCategory: SignalCategory; value: number; unit: string }>;
  expectedReadiness: ReadinessLevel;
  expectedPosture: string;
  isActive: boolean;
}

export interface SignalLaunchReadinessRecord {
  id: string;
  target: SignalLaunchTarget;
  launchStage: "planned" | "internal" | "demo" | "pilot" | "launch_ready" | "production";
  blockers: string[];
  demoAvailable: boolean;
  realSignalsActive: boolean;
  lastAssessedAt: string;
}

/** Readiness derivation rules */
export interface ReadinessDerivationConfig {
  rules: Array<{
    condition: { state: NormalizedState; operator: "gt" | "lt" | "eq" | "between"; value: number | [number, number] };
    producesLevel: ReadinessLevel;
    confidence: number;
    priority: number;
  }>;
  combineStrategy: "highest_priority" | "worst_case" | "weighted_average";
  defaultLevel: ReadinessLevel;
}

/** Assistant timing intelligence */
export interface AssistantTimingConfig {
  dontBotherDuring: string[];
  holdLowValueWhen: ReadinessLevel[];
  showStrategicBriefWhen: ReadinessLevel[];
  escalateUrgentDespite: boolean;
  schedulePlanningPromptsWhen: ReadinessLevel[];
  idealBriefingWindow: { readiness: ReadinessLevel; timeOfDay?: string };
}
