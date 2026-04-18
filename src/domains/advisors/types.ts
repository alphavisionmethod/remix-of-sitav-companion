// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Intelligence Layer: Core Type System
// Per-advisor specialization, briefing packets, evidence model,
// recommendation v2, and council deliberation contracts
// ═══════════════════════════════════════════════════════════════

import type { ConfidenceEnvelope, HallucinationRiskClass, StalenessState, ContradictionReport, GroundingReport, RefusalState, OutputClass } from "@/lib/no-hallucination/types";

// ── Evidence Model ────────────────────────────────────────

export type EvidenceSourceType =
  | "live-record"
  | "historical-record"
  | "user-confirmed-memory"
  | "inferred-preference"
  | "projection"
  | "simulation"
  | "external-provider"
  | "policy-constraint"
  | "approval-state"
  | "recent-event"
  | "analytics-derived"
  | "user-input";

export interface EvidenceReference {
  sourceType: EvidenceSourceType;
  sourceId: string;
  sourceName: string;
  domain: string;
  freshness: string; // ISO timestamp
  freshnessMs: number;
  confidence: number; // 0-1
  summary: string;
  isVerbatim: boolean;
  provenance?: string; // where did this come from
}

export interface EvidenceBundle {
  references: EvidenceReference[];
  totalSources: number;
  freshestAt: string;
  stalestAt: string;
  overallFreshness: "fresh" | "aging" | "stale" | "critical";
  gapsDetected: string[];
  contradictionsDetected: string[];
}

// ── Fact / Inference / Recommendation Separation ──────────

export type ClaimType = "fact" | "inference" | "assumption" | "recommendation" | "unknown" | "simulation-result";

export interface StructuredClaim {
  id: string;
  type: ClaimType;
  statement: string;
  confidence: number;
  evidenceRefs: string[]; // evidence reference IDs
  caveats: string[];
  isGrounded: boolean; // backed by at least one evidence source
}

export interface StructuredOutput {
  facts: StructuredClaim[];
  inferences: StructuredClaim[];
  risksDetected: StructuredClaim[];
  alternativesConsidered: StructuredClaim[];
  recommendations: StructuredClaim[];
  missingInformation: string[];
  unknowns: string[];
}

// ── Advisor Specialization Contract ───────────────────────

export type AdvisorTier = "primary" | "specialist" | "meta" | "governance";
export type AdvisorMaturity = "scaffold" | "alpha" | "beta" | "production";
export type SimulationPolicy = "never" | "optional" | "recommended" | "required-for-action";
export type MemoryPolicy = "none" | "read-only" | "read-write-governed" | "full";
export type TrustSensitivity = "standard" | "elevated" | "critical" | "veto-capable";

export interface AdvisorSpecializationContract {
  advisorId: string;
  domain: string;
  tier: AdvisorTier;
  maturity: AdvisorMaturity;
  displayName: string;
  specializationTags: string[];

  // Decision lens
  decisionLens: string; // what perspective this advisor brings

  // Context requirements
  requiredContext: string[];
  optionalContext: string[];
  forbiddenContext: string[];
  inferrableContext: string[]; // can be derived
  mustConfirmContext: string[]; // must be explicitly verified, never assumed

  // Scoring signals
  scoringSignals: string[];
  prioritySignals: string[];

  // Policies
  simulationPolicy: SimulationPolicy;
  memoryPolicy: MemoryPolicy;
  trustSensitivity: TrustSensitivity;

  // Output requirements
  outputRequirements: {
    mustIncludeFacts: boolean;
    mustSeparateInferences: boolean;
    mustCiteEvidence: boolean;
    mustDeclareUnknowns: boolean;
    maxRecommendations: number;
  };

  // Anti-hallucination
  neverClaimWithoutEvidence: string[];
  mustAskForClarification: string[];
  refusalConditions: string[];
  confidenceFloor: number;

  // Simulation types this advisor uses
  simulationTypes: string[];

  // Paired advisors (auto-convened together)
  pairedWith: string[];

  // Evaluation
  evaluationSuiteIds: string[];
}

// ── Advisor Briefing Packet ───────────────────────────────

export interface AdvisorBriefingPacket {
  advisorId: string;
  sessionId: string;
  assembledAt: string;
  tokenBudget: number;
  tokenUsed: number;

  // Context layers
  sharedContext: Record<string, unknown>;
  domainContext: Record<string, unknown>;
  specializationContext: Record<string, unknown>;

  // Policy & trust envelope
  policyEnvelope: {
    activeRules: string[];
    constraints: string[];
    approvalRequired: boolean;
    trustLevel: TrustSensitivity;
  };

  // Memory
  memoryContext: {
    relevantMemories: { key: string; value: string; confidence: number; age: string }[];
    preferences: Record<string, string>;
    corrections: { original: string; corrected: string; correctedAt: string }[];
  };

  // Evidence
  evidence: EvidenceBundle;

  // Simulation outputs (if pre-run)
  simulationResults: {
    scenarioId: string;
    outcome: string;
    confidence: number;
    risks: string[];
  }[];

  // Unresolved data gaps
  unresolvedGaps: string[];

  // Confidence signals
  contextConfidence: ConfidenceEnvelope;
}

// ── Context Retrieval Plan ────────────────────────────────

export type RetrievalStrategy = "direct-query" | "graph-traversal" | "text-retrieval" | "analytics-aggregate" | "projection-read" | "memory-lookup" | "policy-eval";

export interface ContextRetrievalStep {
  source: string;
  strategy: RetrievalStrategy;
  priority: "required" | "preferred" | "optional";
  maxLatencyMs: number;
  fallbackBehavior: "skip" | "use-stale" | "block";
  tokenEstimate: number;
}

export interface ContextRetrievalPlan {
  advisorId: string;
  steps: ContextRetrievalStep[];
  totalTokenEstimate: number;
  maxParallelFetches: number;
  deadlineMs: number;
}

// ── Recommendation V2 ─────────────────────────────────────

export type ActionabilityLevel = "informational" | "suggested" | "recommended" | "urgent" | "action-required";
export type RecommendationScope = "immediate" | "short-term" | "medium-term" | "long-term" | "strategic";

export interface RecommendationV2 {
  id: string;
  advisorId: string;
  sessionId: string;
  createdAt: string;

  // Core
  title: string;
  summary: string;
  structuredOutput: StructuredOutput;

  // Evidence
  evidenceBundle: EvidenceBundle;
  confidenceBreakdown: ConfidenceEnvelope;

  // Freshness
  dataFreshness: StalenessState;

  // Simulation basis
  simulationBasis: {
    ran: boolean;
    scenarioIds: string[];
    worstCase: string;
    bestCase: string;
    mostLikelyCase: string;
  };

  // Policy
  policyConstraintsNoticed: string[];
  contradictionFlags: string[];

  // Scope
  scope: RecommendationScope;
  actionability: ActionabilityLevel;
  requiredConfirmations: string[];
  affectedDomains: string[];

  // Grounding
  grounding: GroundingReport;
  refusal: RefusalState;
}

// ── Council Deliberation V2 ──────────────────────────────

export interface CouncilVoteV2 {
  advisorId: string;
  position: "support" | "oppose" | "conditional" | "abstain" | "defer-to-specialist";
  confidence: number;
  reasoning: StructuredClaim[];
  conditions: string[];
  risks: string[];
  evidenceRefs: string[];
  dissent?: {
    from: string;
    severity: "material" | "minor" | "procedural";
    alternativeProposal: string;
  };
}

export interface CouncilDeliberationV2 {
  id: string;
  topic: string;
  domain: string;
  convener: string;
  participants: string[];
  votes: CouncilVoteV2[];
  critiqueResults: CritiqueResult[];
  resolution: {
    outcome: "consensus" | "majority" | "conditional" | "deadlocked" | "escalated";
    consensusScore: number;
    summary: string;
    conditions: string[];
    dissents: string[];
    evidenceQuality: "strong" | "moderate" | "weak" | "insufficient";
  };
  startedAt: string;
  concludedAt: string;
  durationMs: number;
  replayable: boolean;
  proofBundleId?: string;
}

// ── Critic / Verifier ─────────────────────────────────────

export type CritiqueType =
  | "factuality"
  | "policy-compliance"
  | "evidence-sufficiency"
  | "contradiction"
  | "scope-violation"
  | "hallucination-risk"
  | "trust-sensitivity";

export interface CritiqueResult {
  type: CritiqueType;
  passed: boolean;
  severity: "info" | "warning" | "block";
  finding: string;
  affectedClaims: string[];
  suggestedRevision?: string;
}

export interface VerificationPass {
  passId: string;
  recommendation: RecommendationV2;
  critiques: CritiqueResult[];
  overallVerdict: "approved" | "revised" | "blocked" | "needs-human";
  revisedRecommendation?: RecommendationV2;
  verifiedAt: string;
  latencyMs: number;
}

// ── Learning Loop ─────────────────────────────────────────

export type FeedbackSignal =
  | "accepted"
  | "rejected"
  | "modified"
  | "executed-successfully"
  | "executed-failed"
  | "rolled-back"
  | "escalated"
  | "corrected"
  | "ignored";

export interface RecommendationOutcome {
  recommendationId: string;
  advisorId: string;
  signal: FeedbackSignal;
  userSatisfaction?: number; // 1-5
  correctionNote?: string;
  executionResult?: string;
  rollbackReason?: string;
  recordedAt: string;
}

export interface AdvisorCalibrationUpdate {
  advisorId: string;
  period: string;
  totalRecommendations: number;
  acceptanceRate: number;
  executionSuccessRate: number;
  rollbackRate: number;
  avgConfidenceWhenAccepted: number;
  avgConfidenceWhenRejected: number;
  hallucinationIncidents: number;
  calibrationDelta: number; // positive = overconfident, negative = underconfident
  weightAdjustment: number;
  updatedAt: string;
}
