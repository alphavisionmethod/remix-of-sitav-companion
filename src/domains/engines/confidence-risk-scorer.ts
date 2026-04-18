// ═══════════════════════════════════════════════════════════════
// SITA OS — Confidence & Risk Scoring Engine
// 8-dimension scoring for every recommendation/action
// ═══════════════════════════════════════════════════════════════

export interface ConfidenceProfile {
  confidence: number;        // 0-100 — how certain is this recommendation
  urgency: number;           // 0-100 — how time-sensitive
  businessImpact: number;    // 0-100 — scale of business effect
  reversibility: number;     // 0-100 — how easy to undo
  profitRelevance: number;   // 0-100 — direct profit impact
  relationshipRisk: number;  // 0-100 — client relationship risk
  operationalRisk: number;   // 0-100 — operational disruption risk
  clarity: number;           // 0-100 — how clear is the path to act
  compositeScore: number;    // weighted average
  automationEligible: boolean;
  approvalRequired: boolean;
  displayTier: "routine" | "notable" | "important" | "critical";
}

export interface ScoringInput {
  confidence: number;
  urgency: "low" | "medium" | "high" | "critical";
  estimatedValue?: number;
  riskFlags?: string[];
  domain?: string;
  isClientFacing?: boolean;
  isFinancial?: boolean;
  isReversible?: boolean;
  suggestedActionsCount?: number;
}

const URGENCY_MAP: Record<string, number> = { low: 20, medium: 50, high: 75, critical: 95 };

export class ConfidenceRiskScorer {
  private automationThreshold = 70;
  private approvalThreshold = 55;

  score(input: ScoringInput): ConfidenceProfile {
    const confidence = Math.round(input.confidence * 100);
    const urgency = URGENCY_MAP[input.urgency] ?? 50;
    const businessImpact = this.computeBusinessImpact(input);
    const reversibility = input.isReversible !== false ? 80 : 25;
    const profitRelevance = this.computeProfitRelevance(input);
    const relationshipRisk = input.isClientFacing ? 65 : 20;
    const operationalRisk = (input.riskFlags?.length ?? 0) > 2 ? 70 : (input.riskFlags?.length ?? 0) > 0 ? 40 : 15;
    const clarity = Math.min(100, (input.suggestedActionsCount ?? 1) * 30 + 10);

    // Weighted composite
    const compositeScore = Math.round(
      confidence * 0.2 +
      urgency * 0.15 +
      businessImpact * 0.15 +
      reversibility * 0.1 +
      profitRelevance * 0.15 +
      (100 - relationshipRisk) * 0.1 +
      (100 - operationalRisk) * 0.05 +
      clarity * 0.1
    );

    const automationEligible =
      confidence >= this.automationThreshold &&
      relationshipRisk < 40 &&
      operationalRisk < 40 &&
      reversibility > 60;

    const approvalRequired =
      !automationEligible ||
      input.isFinancial === true ||
      relationshipRisk >= 50 ||
      businessImpact >= 70;

    const displayTier: ConfidenceProfile["displayTier"] =
      compositeScore >= 80 ? "critical" :
      compositeScore >= 60 ? "important" :
      compositeScore >= 40 ? "notable" : "routine";

    return {
      confidence, urgency, businessImpact, reversibility,
      profitRelevance, relationshipRisk, operationalRisk, clarity,
      compositeScore, automationEligible, approvalRequired, displayTier,
    };
  }

  scoreBatch(inputs: ScoringInput[]): ConfidenceProfile[] {
    return inputs.map(i => this.score(i));
  }

  private computeBusinessImpact(input: ScoringInput): number {
    const value = input.estimatedValue ?? 0;
    if (value > 50000) return 95;
    if (value > 20000) return 80;
    if (value > 5000) return 60;
    if (value > 1000) return 40;
    return 20;
  }

  private computeProfitRelevance(input: ScoringInput): number {
    if (input.isFinancial) return 85;
    if (input.domain === "crm" || input.domain === "sales") return 70;
    if (input.estimatedValue && input.estimatedValue > 5000) return 75;
    return 35;
  }
}

let _instance: ConfidenceRiskScorer | null = null;
export function getConfidenceRiskScorer(): ConfidenceRiskScorer {
  if (!_instance) _instance = new ConfidenceRiskScorer();
  return _instance;
}
