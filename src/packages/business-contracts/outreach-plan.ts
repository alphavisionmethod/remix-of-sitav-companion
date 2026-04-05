// ═══════════════════════════════════════════════════════════════
// SITA OS — Business Contracts: Outreach Plan & Sequences
// ═══════════════════════════════════════════════════════════════

export type OutreachGoal = "acquire" | "nurture" | "reactivate" | "upsell" | "retain" | "refer" | "feedback";

export interface OutreachPlan {
  id: string;
  name: string;
  goal: OutreachGoal;
  targetAudience: OutreachAudienceFilter;
  steps: OutreachStep[];
  totalEnrolled: number;
  activeEnrollments: number;
  completedEnrollments: number;
  convertedCount: number;
  conversionRate: number;
  status: "draft" | "active" | "paused" | "completed" | "archived";
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface OutreachAudienceFilter {
  segments: string[];
  tags: string[];
  minScore?: number;
  maxScore?: number;
  lastContactDaysAgo?: number;
  excludeRecentlyContacted: boolean;
  customFilters: Record<string, unknown>;
}

export interface OutreachStep {
  order: number;
  type: "email" | "call" | "sms" | "linkedin" | "task" | "wait";
  templateId?: string;
  subject?: string;
  body?: string;
  waitDays?: number;
  condition?: string;
  abVariants?: Array<{ variant: string; weight: number; templateId: string }>;
  metrics: { sent: number; opened: number; clicked: number; replied: number; bounced: number };
}

export interface OutreachPerformanceReport {
  planId: string;
  period: string;
  totalSent: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  replyRate: number;
  bounceRate: number;
  unsubscribeRate: number;
  conversions: number;
  revenueAttributedCents: number;
  bestPerformingStep: number;
  worstPerformingStep: number;
  abTestResults: Array<{ stepOrder: number; winner: string; improvementPct: number }>;
}
