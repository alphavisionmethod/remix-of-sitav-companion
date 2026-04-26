// ═══════════════════════════════════════════════════════════════
// SITA OS — Canonical Business Domain: Lead types
//
// Single source of truth for lead scoring, prioritization, and
// triage contracts. Pure types — no runtime, no I/O, no React.
//
// Originally lifted from src/domains/engines/lead-scoring-engine.ts
// during the Business OS canonical architecture reorganization.
// The engine now re-exports these from here.
// ═══════════════════════════════════════════════════════════════

export type PriorityTier =
  | "critical-now"
  | "high-priority"
  | "active-watch"
  | "nurture"
  | "recovery-candidate"
  | "low-priority";

export type UrgencyBand =
  | "heating-up"
  | "needs-response-today"
  | "at-risk-of-cooling"
  | "quiet-but-recoverable"
  | "stable";

export type HeatStatus = "hot" | "warm" | "cooling" | "cold" | "recovering";

export type ConfidenceLevel = "strong" | "moderate" | "low";

export type ConversionBand =
  | "very-likely"
  | "likely"
  | "possible"
  | "unlikely"
  | "insufficient-data";

export type NextBestActionType =
  | "respond"
  | "assign"
  | "schedule"
  | "follow-up"
  | "enrich"
  | "recover"
  | "escalate"
  | "archive"
  | "review";

export type ValuePotentialBand =
  | "high-value"
  | "strategic"
  | "moderate"
  | "low"
  | "repeat-value";

export type TimingSensitivity =
  | "narrow-window"
  | "time-sensitive"
  | "standard"
  | "flexible";

export interface ScoreFactor {
  key: string;
  label: string;
  rawValue: number;
  /** Normalized 0–100 */
  normalizedScore: number;
  /** Weight 0–1 */
  weight: number;
  polarity: "positive" | "negative" | "neutral";
  explanation: string;
}

export interface LeadScoreResult {
  leadId: string;
  /** 0–100 */
  priorityScore: number;
  priorityTier: PriorityTier;
  conversionLikelihood: ConversionBand;
  urgencyBand: UrgencyBand;
  heatStatus: HeatStatus;
  /** 0–100 */
  staleRisk: number;
  /** 0–100 */
  recoveryPotential: number;
  boardroomWorthy: boolean;
  confidenceLevel: ConfidenceLevel;
  /** 0–100 */
  confidenceScore: number;
  nextBestAction: string;
  nextBestActionType: NextBestActionType;
  topPositiveFactors: ScoreFactor[];
  topNegativeFactors: ScoreFactor[];
  allFactors: ScoreFactor[];
  explanation: string;
  whatChanged: string[];
  valuePotentialBand: ValuePotentialBand;
  timingSensitivity: TimingSensitivity;
  businessModeUsed: string;
}

export interface ScoreableLead {
  id: string;
  contact_name: string;
  company: string | null;
  source: string;
  inquiry_text: string | null;
  urgency: "low" | "medium" | "high" | "critical";
  quality_score: number;
  completeness_score: number;
  missing_fields: string[];
  duplicate_status: "none" | "possible" | "definite";
  suggested_route: string;
  suggested_owner: string | null;
  advisor_suggestion: string | null;
  triage_status: string;
  created_at: string;
  updated_at: string;
  contact_email: string | null;
  contact_phone: string | null;
  quality_hints: string[];
  // Scoring-enrichment fields
  response_time_minutes?: number | null;
  last_activity_at?: string | null;
  engagement_events?: number;
  appointment_booked?: boolean;
  quote_requested?: boolean;
  prior_customer?: boolean;
  owner_assigned?: string | null;
  owner_last_action_at?: string | null;
  estimated_value?: number | null;
  communication_count?: number;
  replied_to_outreach?: boolean;
  engagement_quality?: "high" | "medium" | "low" | null;
}

/**
 * Persisted/service-layer view of a lead score after it has been
 * stored, dispatched to a queue, or wrapped with side-effect metadata.
 * Services and persistence callers consume this; the engine produces
 * `LeadScoreResult` and the service layer enriches into this shape.
 */
export interface ScoredLeadResult extends LeadScoreResult {
  scoredAt: string;
  scoredBy?: string;
}