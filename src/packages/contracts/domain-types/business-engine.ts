// ═══════════════════════════════════════════════════════════════
// SITA OS — Business Engine Canonical Types
// Migrated from src/lib/domain-engines/business-os.ts
// ═══════════════════════════════════════════════════════════════

export interface BusinessLead {
  id: string;
  name: string;
  email?: string;
  source?: string;
  score?: number;
  engagementScore: number;
  recencyDays: number;
  fitScore: number;
  estimatedValue: number;
  status: "new" | "contacted" | "qualified" | "nurturing" | "lost";
  createdAt: number;
  lastContactAt?: number;
}

export interface Customer {
  id: string;
  name: string;
  totalRevenue: number;
  invoiceCount: number;
  overdueInvoices: number;
  avgPayDays: number;
  lastInteractionDays: number;
  healthScore?: number;
  churnRisk?: number;
  tier: "enterprise" | "mid-market" | "smb" | "starter";
  status: "active" | "at-risk" | "churned" | "onboarding";
  createdAt: number;
}

export interface PipelineOpportunity {
  id: string;
  name: string;
  stage: "discovery" | "qualification" | "proposal" | "negotiation" | "closing" | "won" | "lost";
  valueCents: number;
  probability: number;
  expectedCloseDate: number;
  daysInStage: number;
  lastActivityDays: number;
  assignedTo?: string;
}

export interface BusinessHealthResult {
  overallScore: number;
  revenueHealth: number;
  pipelineHealth: number;
  customerHealth: number;
  operationalHealth: number;
  risks: BusinessRisk[];
  opportunities: BusinessOpportunity[];
  summary: string;
}

export interface BusinessRisk {
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  affectedEntity?: string;
  suggestedAction: string;
}

export interface BusinessOpportunity {
  type: string;
  potential: "low" | "medium" | "high";
  description: string;
  estimatedValue?: number;
  suggestedAction: string;
}

export interface PipelineAnalysis {
  totalValue: number;
  weightedValue: number;
  stageBreakdown: Record<string, { count: number; value: number; weighted: number }>;
  staleDealCount: number;
  avgDaysInPipeline: number;
  conversionRate: number;
  velocityScore: number;
  healthIndicator: "healthy" | "sluggish" | "at-risk" | "critical";
}

export interface LeadScoreResult {
  totalScore: number;
  engagementWeight: number;
  recencyWeight: number;
  fitWeight: number;
  valueWeight: number;
  tier: "hot" | "warm" | "cool" | "cold";
  suggestedAction: string;
}

export interface RevenueForeccast {
  currentMonthProjected: number;
  nextMonthProjected: number;
  quarterProjected: number;
  trend: "growing" | "stable" | "declining";
  confidence: number;
  dataPoints: number;
}

export interface FollowUpItem {
  entityId: string;
  entityType: "lead" | "customer" | "opportunity";
  entityName: string;
  urgency: "immediate" | "today" | "this-week" | "next-week";
  reason: string;
  suggestedAction: string;
  daysSinceLastContact: number;
}

export interface ClientHealthResult {
  id: string;
  name: string;
  healthScore: number;
  churnRisk: number;
  revenueAtRisk: number;
  factors: { factor: string; impact: number; direction: "positive" | "negative" }[];
  suggestedAction: string;
}
