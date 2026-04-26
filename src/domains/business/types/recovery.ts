// ═══════════════════════════════════════════════════════════════
// SITA OS — Canonical Business Domain: Lead Recovery types
//
// Failure modes, recovery paths, success bands, queues, and the
// canonical RecoveryCandidate contract used across the recovery
// engine, services, and UI.
//
// Originally lifted from src/domains/engines/lead-recovery-engine.ts.
// The engine and recovery service now re-export from here.
// ═══════════════════════════════════════════════════════════════

export type FailureMode =
  | "no_response"
  | "missed_followup"
  | "quote_abandoned"
  | "lost_momentum"
  | "owner_dropped"
  | "appointment_incomplete"
  | "post_consult_drift"
  | "handoff_failure"
  | "silent_high_value"
  | "callback_missed";

export type RecoveryPath =
  | "soft_reactivation"
  | "direct_rescue"
  | "quote_rescue"
  | "consult_reactivation"
  | "relationship_repair"
  | "reassignment"
  | "strategic_rescue";

export type SuccessBand = "strong" | "moderate" | "uncertain" | "low" | "archive";

export type UrgencyLevel = "act_today" | "this_week" | "flexible";
export type RelationshipSensitivity =
  | "handle_carefully"
  | "standard"
  | "direct_approach";

export interface RecoveryQueueDef {
  key: string;
  label: string;
  failureModes: FailureMode[];
  icon: string;
}

export interface RecoveryTimelineEvent {
  date: string;
  label: string;
  status: "positive" | "neutral" | "warning" | "negative" | "current";
}

export interface RecoveryCandidate {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  // Failure context
  failureMode: FailureMode;
  recoveryReason: string;
  stageAtSlip: string;
  daysSinceLastAction: number;
  // Value
  valueAtRisk: number;
  dealSize: number;
  // Scores
  recoveryScore: number;
  successBand: SuccessBand;
  urgency: UrgencyLevel;
  relationshipSensitivity: RelationshipSensitivity;
  // Path
  recommendedPath: RecoveryPath;
  suggestedChannel: "email" | "phone" | "linkedin" | "sms";
  // Accountability
  currentOwner: string;
  previousOwner?: string;
  ownerIssue?: string;
  escalationNeeded: boolean;
  boardroomCandidate: boolean;
  // Communications
  aiDraft: string;
  draftTone: string;
  // Timeline
  timeline: RecoveryTimelineEvent[];
  // Advisor messaging — provided externally; engine does NOT carry copy.
  advisorInsight: string;
  // Queue assignment
  queueKey: string;
}