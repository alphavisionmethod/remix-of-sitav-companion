// ═══════════════════════════════════════════════════════════════
// SITA OS — Business Contracts: Opportunity Record (Expanded)
// ═══════════════════════════════════════════════════════════════

import type { MonetaryAmount, BusinessPriority, BusinessMetadata } from "./_contract-scaffold";

export type OpportunityStage =
  | "identified" | "discovery" | "qualification" | "solution-design"
  | "proposal" | "negotiation" | "contract-review" | "closing"
  | "won" | "lost" | "on-hold";

export interface OpportunityRecord {
  id: string;
  accountId: string;
  accountName: string;
  title: string;
  description?: string;
  stage: OpportunityStage;
  valueCents: number;
  recurringValueCents?: number;
  probability: number;
  weightedValueCents: number;
  priority: BusinessPriority;
  expectedCloseDate: string;
  actualCloseDate?: string;
  loseReason?: string;
  assignedTo: string;
  teamMembers: string[];
  contactIds: string[];
  competitorIds: string[];
  quoteIds: string[];
  productLines: string[];
  tags: string[];
  source: string;
  campaignId?: string;
  nextAction?: string;
  nextActionDate?: string;
  lastActivityAt: string;
  daysInCurrentStage: number;
  daysInPipeline: number;
  staleRisk: boolean;
  score: number;
  metadata: BusinessMetadata;
}

export interface OpportunityActivity {
  id: string;
  opportunityId: string;
  type: "call" | "email" | "meeting" | "demo" | "proposal-sent" | "stage-change" | "note" | "document";
  title: string;
  description: string;
  actor: string;
  timestamp: string;
  durationMinutes?: number;
  outcome?: string;
  nextStep?: string;
}
