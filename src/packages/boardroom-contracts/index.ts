// ═══════════════════════════════════════════════════════════════
// SITA OS — Boardroom Contracts
// Comprehensive boardroom session, analytics, decision governance,
// advisor council, and strategic intelligence types.
// ═══════════════════════════════════════════════════════════════

// ── Re-exports from canonical sources ────────────────────────
export type {
  BoardroomSection, AdvisorTrack, Disagreement,
  CarryoverItem, DecisionRecord, SpecializedBoardroomPacket,
} from "@/packages/contracts/specialized/boardroom-packet";

// ── Session Management ───────────────────────────────────────

export type BoardroomSessionType = "daily-pulse" | "weekly-review" | "strategic" | "emergency" | "quarterly" | "ad-hoc";
export type BoardroomSessionStatus = "scheduled" | "in-progress" | "completed" | "cancelled" | "deferred";

export interface BoardroomSession {
  id: string;
  tenantId: string;
  type: BoardroomSessionType;
  status: BoardroomSessionStatus;
  title: string;
  agenda: BoardroomAgendaItem[];
  advisorsPresent: string[];
  scheduledAt: string;
  startedAt?: string;
  completedAt?: string;
  durationMinutes?: number;
  decisionsMade: string[];
  actionItemsGenerated: string[];
  proofId?: string;
  correlationId: string;
}

export interface BoardroomAgendaItem {
  id: string;
  order: number;
  topic: string;
  domain: string;
  priority: "critical" | "high" | "medium" | "low";
  presenter: string;
  estimatedMinutes: number;
  dataSourceIds: string[];
  status: "pending" | "discussed" | "tabled" | "decided";
  decision?: string;
  notes: string;
}

// ── Advisor Council ──────────────────────────────────────────

export interface AdvisorCouncilState {
  sessionId: string;
  advisors: AdvisorSessionParticipant[];
  consensusScore: number;
  disagreements: AdvisorDisagreement[];
  alignmentMap: Record<string, Record<string, number>>;
  dominantPerspective: string;
}

export interface AdvisorSessionParticipant {
  advisorId: string;
  domain: string;
  role: "lead" | "contributor" | "observer" | "challenger";
  confidenceInSession: number;
  recommendationsGiven: number;
  dissentsRaised: number;
  lastSpoke: string;
}

export interface AdvisorDisagreement {
  id: string;
  topic: string;
  advisorA: { id: string; position: string; confidence: number };
  advisorB: { id: string; position: string; confidence: number };
  severity: "minor" | "significant" | "fundamental";
  resolvedBy?: "consensus" | "owner-override" | "data-evidence" | "deferred";
  resolution?: string;
  impactOnDecision: string;
}

// ── Strategic Intelligence ───────────────────────────────────

export interface StrategicInsight {
  id: string;
  domain: string;
  category: "opportunity" | "risk" | "trend" | "anomaly" | "milestone" | "bottleneck";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  confidence: number;
  supportingData: Array<{ source: string; metric: string; value: number | string }>;
  recommendedActions: string[];
  urgency: "immediate" | "this-week" | "this-month" | "next-quarter";
  expiresAt?: string;
  generatedAt: string;
  advisorId: string;
}

export interface BoardroomBrief {
  id: string;
  sessionId: string;
  generatedAt: string;
  executiveSummary: string;
  topInsights: StrategicInsight[];
  kpiSnapshot: BoardroomKPISnapshot;
  riskRegister: BoardroomRiskItem[];
  actionItems: BoardroomActionItem[];
  carryoverItems: string[];
  overallHealth: "strong" | "stable" | "attention-needed" | "critical";
  trendDirection: "improving" | "stable" | "declining";
}

export interface BoardroomKPISnapshot {
  revenue: { current: number; target: number; trend: "up" | "flat" | "down" };
  cashPosition: { current: number; runway: string; trend: "up" | "flat" | "down" };
  pipelineValue: { total: number; weightedTotal: number; staleCount: number };
  customerHealth: { avgScore: number; atRiskCount: number; churnProbability: number };
  operationalLoad: { openTasks: number; overdueCount: number; automationRate: number };
  trustPosture: { score: number; openIncidents: number; proofCoverage: number };
}

export interface BoardroomRiskItem {
  id: string;
  domain: string;
  risk: string;
  severity: "critical" | "high" | "medium" | "low";
  likelihood: number;
  impact: number;
  mitigationPlan?: string;
  owner: string;
  status: "identified" | "mitigating" | "accepted" | "resolved";
  lastReviewed: string;
}

export interface BoardroomActionItem {
  id: string;
  sessionId: string;
  title: string;
  domain: string;
  assignee: string;
  dueDate: string;
  priority: "critical" | "high" | "medium" | "low";
  status: "pending" | "in-progress" | "completed" | "blocked";
  linkedDecisionId?: string;
  proofRequiredOnCompletion: boolean;
}

// ── Decision Governance ──────────────────────────────────────

export interface BoardroomDecision {
  id: string;
  sessionId: string;
  topic: string;
  domain: string;
  decision: string;
  rationale: string;
  alternativesConsidered: Array<{ option: string; pros: string[]; cons: string[]; rejectionReason: string }>;
  advisorsConsulted: string[];
  consensusLevel: "unanimous" | "majority" | "owner-override" | "split";
  confidenceAtDecision: number;
  dataPointsUsed: number;
  reversible: boolean;
  reviewDate?: string;
  linkedActionItems: string[];
  proofId: string;
  decidedAt: string;
  decidedBy: string;
}

export interface DecisionReviewSchedule {
  decisionId: string;
  reviewDate: string;
  reviewType: "effectiveness" | "course-correction" | "sunset";
  criteria: string[];
  status: "scheduled" | "overdue" | "completed";
  outcome?: string;
}

// ── Boardroom Analytics ──────────────────────────────────────

export interface BoardroomAnalytics {
  tenantId: string;
  period: { start: string; end: string };
  sessionsHeld: number;
  decisionsMade: number;
  avgSessionDuration: number;
  avgConsensusScore: number;
  disagreementRate: number;
  actionItemCompletionRate: number;
  carryoverRate: number;
  topDecisionDomains: Array<{ domain: string; count: number }>;
  advisorUtilization: Array<{ advisorId: string; participationRate: number; recommendationAcceptRate: number }>;
  decisionQualityTrend: Array<{ period: string; qualityScore: number }>;
}
