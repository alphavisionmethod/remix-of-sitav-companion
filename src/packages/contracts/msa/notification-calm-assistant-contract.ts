// ═══════════════════════════════════════════════════════════════
// SITA OS — Notification Routing + Calm AI Assistant Contract
// Attention + Urgency + Surface Selection + Anti-Spam + Roles
// ═══════════════════════════════════════════════════════════════

export type UrgencyClass = "silent" | "low" | "normal" | "high" | "critical" | "emergency";
export type DeliveryDecisionType = "no_interruption" | "route_to_queue" | "route_to_summary" | "push_to_phone" | "watch_alert" | "desktop_banner" | "urgent_escalation" | "daily_digest" | "boardroom_escalation";
export type AssistantRoleKey = "chief_of_staff" | "operator" | "strategist" | "money_sentinel" | "boardroom_curator" | "followup_guardian" | "risk_watcher" | "calm_filter" | "health_monitor";
export type ToneMode = "calm" | "executive" | "direct" | "analytical" | "caring" | "precise" | "concise";
export type NotificationLaunchTarget = "attention_routing" | "fatigue_engine" | "assistant_roles" | "queue_system" | "cross_device_delivery" | "calm_synthesis";

export interface AttentionRouteRecord {
  id: string;
  userId: string;
  inputUrgency: UrgencyClass;
  inputCategory: string;
  inputRiskTier: string;
  userFocusState: string;
  userReadiness: string;
  devicePresence: string[];
  fatigueLevel: number;
  trustLevel: string;
  decision: DeliveryDecisionType;
  targetSurface: string;
  targetChannel: string;
  deferred: boolean;
  deferUntil?: string;
  routeReason: string;
  decidedAt: string;
}

export interface NotificationGrammarRecord {
  id: string;
  urgencyClass: UrgencyClass;
  explanationStyle: "brief" | "detailed" | "contextual";
  quickActionAffordances: string[];
  toneMode: ToneMode;
  maxLength: number;
  trustStatePresentation: "show_trust" | "hide_trust" | "conditional";
  refusalDeferLanguage: string;
  premiumTone: boolean;
}

export interface FatigueProfileRecord {
  id: string;
  userId: string;
  recentInterruptionsCount: number;
  recentInterruptionWindow: string;
  ignoredAlertsCount: number;
  repeatedCategoriesSupressed: string[];
  overloadRisk: boolean;
  quietWindowStart?: string;
  quietWindowEnd?: string;
  adaptiveSuppressionEnabled: boolean;
  fatigueScore: number;
  lastUpdatedAt: string;
}

export interface ProactiveInterventionRecord {
  id: string;
  userId: string;
  interventionType: "surface_what_matters" | "prepare_needed" | "remind_without_nagging" | "escalate_justified" | "summarize_not_spam" | "strategic_brief";
  triggerCondition: string;
  content: string;
  delivered: boolean;
  deliveredAt?: string;
  deliverySurface?: string;
  userResponse?: "acted" | "dismissed" | "snoozed" | "ignored";
}

export interface AssistantRoleRecord {
  id: string;
  roleKey: AssistantRoleKey;
  displayName: string;
  description: string;
  responsibilities: string[];
  proactiveMode: boolean;
  toneMode: ToneMode;
  escalationBehavior: "auto_handle" | "suggest" | "recommend" | "escalate" | "alert" | "remind" | "suppress";
  activeHours?: { start: string; end: string };
  priority: number;
  enabled: boolean;
}

export interface DeliveryDecisionRecord {
  id: string;
  userId: string;
  notificationId: string;
  decision: DeliveryDecisionType;
  surface: string;
  channel: string;
  urgencyOverride?: UrgencyClass;
  deferredUntil?: string;
  batchedIntoDigest: boolean;
  fatigueSuppressed: boolean;
  reason: string;
  decidedAt: string;
}

export interface InterruptionHistoryRecord {
  id: string;
  userId: string;
  surface: string;
  channel: string;
  category: string;
  urgency: UrgencyClass;
  userResponse: "opened" | "dismissed" | "snoozed" | "ignored" | "acted";
  responseTimeMs?: number;
  interruptedAt: string;
}

export interface QueueItemRecord {
  id: string;
  userId: string;
  category: string;
  title: string;
  summary: string;
  urgency: UrgencyClass;
  sourceNotificationId?: string;
  queueType: "silent" | "daily_digest" | "boardroom" | "work_queue";
  status: "pending" | "delivered" | "read" | "acted" | "expired";
  deferredUntil?: string;
  createdAt: string;
  deliveredAt?: string;
}

export interface AssistantLaunchReadinessRecord {
  id: string;
  target: NotificationLaunchTarget;
  launchStage: "planned" | "internal" | "demo" | "pilot" | "launch_ready" | "production";
  routingFullyReal: boolean;
  partiallyRuleBased: boolean;
  demoRouting: boolean;
  assistantToneLive: boolean;
  cachedSynthesis: boolean;
  blockers: string[];
  lastAssessedAt: string;
}

/** Attention router input envelope */
export interface AttentionRouterInput {
  urgency: UrgencyClass;
  riskTier: string;
  category: string;
  userContext: { focusState: string; readiness: string; activeDevices: string[]; fatigueScore: number };
  actionClass: string;
  trustLevel: string;
}

/** Queue vs interrupt strategy */
export interface QueueInterruptStrategy {
  silentQueueCategories: string[];
  dailyDigestCategories: string[];
  watchNudgeCategories: string[];
  immediatePhonePushCategories: string[];
  desktopWorkItemCategories: string[];
  boardroomEscalationCategories: string[];
}

/** Quick action definitions */
export interface QuickActionDefinition {
  actionKey: string;
  label: string;
  icon: string;
  requiresBiometric: boolean;
  availableOnSurfaces: string[];
  actionType: "approve" | "snooze" | "route_later" | "assign_assistant" | "dismiss" | "escalate" | "open_context";
}
