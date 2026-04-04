// ═══════════════════════════════════════════════════════════════
// SITA OS — Self-Learning Domain Types
// ═══════════════════════════════════════════════════════════════

import type { BaseContract, Timestamped, TenantScoped, DomainId } from "../_contract-scaffold";

export type LearningEventType = "correction" | "preference-shift" | "pattern-detected" | "feedback" | "outcome-observed" | "policy-updated";

export type PatternConfidence = "high" | "medium" | "low" | "speculative";

export interface LearningEvent extends Timestamped, TenantScoped {
  type: LearningEventType;
  domain: DomainId;
  source: string;
  description: string;
  beforeState: Record<string, unknown>;
  afterState: Record<string, unknown>;
  confidence: number;
  appliedAutomatically: boolean;
  approvalRequired: boolean;
  approvalId?: string;
  impactScore: number;
  relatedEntityIds: string[];
}

export interface CorrectionRecord extends Timestamped, TenantScoped {
  originalOutput: string;
  correctedOutput: string;
  domain: DomainId;
  advisorId: string;
  reason: string;
  category: "factual" | "preference" | "policy" | "tone" | "format" | "logic";
  severity: "minor" | "moderate" | "major" | "critical";
  propagated: boolean;
  propagatedTo: string[];
}

export interface PatternMatch extends BaseContract, TenantScoped {
  patternId: string;
  patternName: string;
  domain: DomainId;
  confidence: PatternConfidence;
  occurrences: number;
  firstSeen: string;
  lastSeen: string;
  description: string;
  suggestedAction?: string;
  actionTaken: boolean;
  features: Record<string, unknown>;
}

export interface LearningProfile extends BaseContract, TenantScoped {
  totalCorrections: number;
  totalPatterns: number;
  topDomains: { domain: DomainId; eventCount: number }[];
  adaptationRate: number;
  lastLearningEvent: string;
  preferences: Record<string, unknown>;
}
