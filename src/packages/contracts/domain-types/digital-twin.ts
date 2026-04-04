// ═══════════════════════════════════════════════════════════════
// SITA OS — Digital Twin, Boardroom, & Scenario Intelligence
// ═══════════════════════════════════════════════════════════════

export type TwinType = "business" | "money" | "household" | "unified" | "operating";

export interface DigitalTwin {
  id: string;
  type: TwinType;
  entityId: string;
  lastUpdated: string;
  healthScore: number;
  signals: TwinSignal[];
  projections: TwinProjection[];
  bottlenecks: TwinBottleneck[];
  risks: TwinRisk[];
  opportunities: string[];
}

export interface TwinSignal {
  id: string;
  category: "bottleneck" | "overload" | "revenue_risk" | "cash_pressure" | "schedule_strain" | "invisible_labor" | "prep_risk" | "underused_capacity" | "opportunity_concentration";
  severity: "info" | "warning" | "critical";
  title: string;
  description: string;
  value?: number;
  trend: "improving" | "stable" | "worsening";
  detectedAt: string;
}

export interface TwinProjection {
  metric: string;
  current: number;
  projected30d: number;
  projected90d: number;
  confidence: number;
  assumptions: string[];
}

export interface TwinBottleneck {
  id: string;
  area: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  impact: string;
  suggestedAction: string;
  estimatedResolutionDays: number;
}

export interface TwinRisk {
  id: string;
  category: string;
  probability: number;
  impact: number;
  description: string;
  mitigations: string[];
}

// ── Boardroom ───────────────────────────────────────────────────
export type BoardroomType = "founder" | "business_operator" | "money" | "family" | "concierge" | "executive" | "enterprise_governance";

export interface BoardroomSession {
  id: string;
  type: BoardroomType;
  entityId: string;
  startedAt: string;
  completedAt?: string;
  agenda: BoardroomAgendaItem[];
  decisions: BoardroomDecision[];
  unresolvedCarryover: string[];
  actionQueue: BoardroomAction[];
  participatingAdvisors: string[];
  memorySnapshot: string;
  confidence: number;
}

export interface BoardroomAgendaItem {
  id: string;
  title: string;
  domain: string;
  priority: "critical" | "high" | "medium" | "low";
  briefing: string;
  dataPoints: { label: string; value: string; trend?: string }[];
  advisorRecommendations: { advisorId: string; recommendation: string; confidence: number }[];
  requiredDecision?: string;
}

export interface BoardroomDecision {
  id: string;
  agendaItemId: string;
  decision: string;
  reasoning: string;
  confidence: number;
  madeBy: string;
  supportingAdvisors: string[];
  dissentingAdvisors: string[];
  proofId: string;
  executionPlan?: string;
  deadline?: string;
}

export interface BoardroomAction {
  id: string;
  decisionId: string;
  action: string;
  assignedTo: string;
  deadline?: string;
  status: "pending" | "in_progress" | "completed" | "blocked";
  completedAt?: string;
  proofId?: string;
}

export interface BoardroomTemplate {
  id: string;
  type: BoardroomType;
  name: string;
  description: string;
  defaultAgenda: Omit<BoardroomAgendaItem, "id">[];
  suitableFor: string[];
  frequency: "daily" | "weekly" | "monthly" | "quarterly" | "on_demand";
}

export interface BoardroomPacket {
  sessionId: string;
  preparedAt: string;
  summary: string;
  keyMetrics: { label: string; value: string; trend: string; alert: boolean }[];
  agenda: BoardroomAgendaItem[];
  unresolved: string[];
  recentDecisions: BoardroomDecision[];
  advisorBriefs: { advisorId: string; brief: string }[];
}

// ── Scenario Intelligence ───────────────────────────────────────
export type ScenarioType = "decision" | "forecast" | "tradeoff" | "stress_test" | "spillover";

export interface ScenarioSimulation {
  id: string;
  type: ScenarioType;
  title: string;
  description: string;
  domain: string;
  inputs: Record<string, unknown>;
  outcomes: ScenarioOutcome[];
  confidence: number;
  evidenceIds: string[];
  advisorReasoning: { advisorId: string; reasoning: string }[];
  createdAt: string;
  templateId?: string;
}

export interface ScenarioOutcome {
  label: string;
  probability: number;
  impact: { revenue?: number; cost?: number; time?: number; trust?: number; risk?: number };
  tradeoffs: string[];
  recommendation: string;
  confidence: number;
}

export interface ScenarioTemplate {
  id: string;
  type: ScenarioType;
  name: string;
  description: string;
  requiredInputs: { field: string; label: string; type: string; default?: unknown }[];
  domain: string;
  suitableFor: string[];
}
