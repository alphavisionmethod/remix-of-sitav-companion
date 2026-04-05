// ═══════════════════════════════════════════════════════════════
// SITA OS — Business Contracts: Deal (Expanded Canonical)
// ═══════════════════════════════════════════════════════════════

import type { MonetaryAmount, BusinessPriority, BusinessMetadata } from "./_contract-scaffold";

export type DealStage =
  | "discovery" | "qualification" | "proposal" | "negotiation"
  | "contract-review" | "closing" | "won" | "lost" | "on-hold";

export type DealCloseReason =
  | "budget" | "authority" | "need" | "timing" | "competitor"
  | "no-decision" | "champion-left" | "pricing" | "product-fit" | "other";

export interface DealStakeholder {
  contactId: string;
  name: string;
  role: "decision-maker" | "influencer" | "champion" | "gatekeeper" | "end-user" | "legal" | "finance";
  sentiment: "supportive" | "neutral" | "resistant" | "unknown";
  lastContactDays: number;
  engagementLevel: number;
}

export interface DealTimeline {
  stage: DealStage;
  enteredAt: string;
  exitedAt?: string;
  durationDays: number;
  movedBy: string;
  notes?: string;
}

export interface Deal {
  id: string;
  accountId: string;
  name: string;
  stage: DealStage;
  valueCents: number;
  currency: string;
  probability: number;
  weightedValueCents: number;
  expectedCloseDate: string;
  actualCloseDate?: string;
  closeReason?: DealCloseReason;
  priority: BusinessPriority;
  assignedTo: string;
  stakeholders: DealStakeholder[];
  timeline: DealTimeline[];
  competitorsMentioned: string[];
  nextAction?: string;
  nextActionDate?: string;
  tags: string[];
  quoteIds: string[];
  daysInCurrentStage: number;
  daysInPipeline: number;
  staleRisk: boolean;
  metadata: BusinessMetadata;
}

export interface DealForecast {
  dealId: string;
  projectedCloseDate: string;
  projectedValueCents: number;
  winProbability: number;
  confidence: number;
  riskFactors: string[];
  forecastedAt: string;
  modelVersion: string;
}
