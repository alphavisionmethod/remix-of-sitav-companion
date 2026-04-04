// ═══════════════════════════════════════════════════════════════
// SITA OS — Revenue Autopilot & Opportunity Engine Types
// Leakage detection, recovery, ranking, recovered value ledger
// ═══════════════════════════════════════════════════════════════

export type LeakageType =
  | "missed_callback"
  | "stale_lead"
  | "cold_repeat_customer"
  | "overdue_invoice"
  | "no_show_risk"
  | "underused_capacity"
  | "empty_schedule"
  | "subscription_waste"
  | "budget_drift"
  | "missed_savings"
  | "relationship_decay"
  | "time_misallocation"
  | "pricing_gap"
  | "upsell_missed"
  | "churn_risk";

export interface LeakageSignal {
  id: string;
  type: LeakageType;
  domain: string;
  title: string;
  description: string;
  estimatedValue: number;
  currency: string;
  detectedAt: string;
  expiresAt?: string;
  confidence: number;
  source: string;
  entityId?: string;
  relatedRecords: { type: string; id: string }[];
  suggestedAction: string;
  assignedAdvisor: string;
  status: "detected" | "proposed" | "in_recovery" | "recovered" | "expired" | "dismissed";
}

export interface RecoveredValue {
  id: string;
  leakageId: string;
  type: LeakageType;
  domain: string;
  title: string;
  recoveredAmount: number;
  currency: string;
  recoveredAt: string;
  method: string;
  advisorId: string;
  proofId: string;
  entityId?: string;
  effortLevel: "trivial" | "low" | "medium" | "high";
  automationLevel: "fully_automatic" | "advisor_guided" | "human_assisted";
}

export interface RecoveredValueLedger {
  totalRecovered: number;
  currency: string;
  period: string;
  byType: Record<LeakageType, number>;
  byDomain: Record<string, number>;
  byAdvisor: Record<string, number>;
  byMonth: { month: string; amount: number }[];
  automatedPercent: number;
  topRecoveries: RecoveredValue[];
}

export interface OpportunityRanking {
  opportunityId: string;
  rank: number;
  score: number;
  factors: {
    value: number;
    urgency: number;
    effort: number;
    trustRequirement: number;
    downstreamImpact: number;
    probability: number;
  };
}

// ── Capacity Monetization ───────────────────────────────────────
export interface CapacitySlot {
  id: string;
  type: "schedule" | "staff" | "resource" | "inventory";
  domain: string;
  label: string;
  available: boolean;
  utilizationPercent: number;
  monetizableValue: number;
  suggestedAction: string;
  timeWindow: { start: string; end: string };
}

// ── Negotiation & Savings ───────────────────────────────────────
export interface NegotiationOpportunity {
  id: string;
  vendorName: string;
  currentCost: number;
  estimatedSavings: number;
  confidence: number;
  category: string;
  lastNegotiated?: string;
  contractRenewalDate?: string;
  suggestedApproach: string;
  assignedAdvisor: string;
  status: "identified" | "in_progress" | "completed" | "declined";
}

// ── Revenue Autopilot Config ────────────────────────────────────
export interface RevenueAutopilotConfig {
  enabled: boolean;
  aggressiveness: "conservative" | "balanced" | "aggressive";
  autoRecoverBelow: number;
  autoFollowUpEnabled: boolean;
  followUpMaxAttempts: number;
  followUpCooldownHours: number;
  excludedCustomers: string[];
  excludedCategories: LeakageType[];
  dailyActionLimit: number;
  requireApprovalAbove: number;
}

// ── Outcome Tracking ────────────────────────────────────────────
export interface OutcomeRecord {
  id: string;
  type: "revenue_recovered" | "waste_removed" | "fee_avoided" | "capacity_filled" | "time_saved" | "opportunity_revived";
  title: string;
  value: number;
  currency: string;
  domain: string;
  advisorId: string;
  proofId: string;
  timestamp: string;
  userAcknowledged: boolean;
}
