// ═══════════════════════════════════════════════════════════════
// SITA OS — Business Contracts: Lead (Expanded Canonical)
// Richer version extending the inline Lead in index.ts
// ═══════════════════════════════════════════════════════════════

import type { BusinessPriority, BusinessMetadata } from "./_contract-scaffold";

export type LeadStatus = "new" | "contacted" | "qualified" | "nurturing" | "converted" | "disqualified" | "lost";
export type LeadSource = "website" | "referral" | "cold-outreach" | "event" | "advertising" | "social" | "partner" | "inbound-call" | "import" | "other";
export type LeadTemperature = "hot" | "warm" | "cool" | "cold" | "frozen";

export interface LeadScoreBreakdown {
  totalScore: number;
  fitScore: number;
  engagementScore: number;
  recencyScore: number;
  intentScore: number;
  tier: LeadTemperature;
  scoredAt: string;
  factors: Array<{ name: string; value: number; weight: number }>;
}

export interface LeadEnriched {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  title?: string;
  source: LeadSource;
  status: LeadStatus;
  priority: BusinessPriority;
  assignedTo?: string;
  score: LeadScoreBreakdown;
  lastContactAt?: string;
  nextFollowUpAt?: string;
  contactAttempts: number;
  estimatedValueCents: number;
  tags: string[];
  utmParams?: { source?: string; medium?: string; campaign?: string; content?: string; term?: string };
  notes: string[];
  conversionDate?: string;
  convertedToOpportunityId?: string;
  metadata: BusinessMetadata;
}

export interface LeadReactivationPlan {
  leadId: string;
  strategy: "personalized-email" | "value-offer" | "content-nurture" | "event-invite" | "partner-intro";
  steps: Array<{ order: number; action: string; channel: string; delayDays: number; template?: string }>;
  estimatedConversionProbability: number;
  estimatedValueCents: number;
  createdAt: string;
  status: "planned" | "executing" | "completed" | "abandoned";
}
