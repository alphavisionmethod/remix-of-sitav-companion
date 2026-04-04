// ═══════════════════════════════════════════════════════════════
// SITA OS — Business Contracts: Customer Lifecycle State Machine
// Full lifecycle from prospect to win-back with transition rules,
// health score computation, and churn prediction inputs.
// ═══════════════════════════════════════════════════════════════

// ── Lifecycle Stages ────────────────────────────────────────

export type CustomerLifecycleStage =
  | "prospect"
  | "lead"
  | "qualified"
  | "onboarding"
  | "active"
  | "expansion"
  | "at-risk"
  | "churning"
  | "churned"
  | "win-back"
  | "dormant";

// ── Transition Rules ────────────────────────────────────────

export interface LifecycleTransitionRule {
  from: CustomerLifecycleStage;
  to: CustomerLifecycleStage;
  trigger: string;
  conditions: string[];
  requiresApproval: boolean;
  automatable: boolean;
}

export const LIFECYCLE_TRANSITIONS: LifecycleTransitionRule[] = [
  { from: "prospect", to: "lead", trigger: "engagement-detected", conditions: ["visited-site", "opened-email"], requiresApproval: false, automatable: true },
  { from: "lead", to: "qualified", trigger: "scoring-threshold-met", conditions: ["score >= 60", "budget-confirmed"], requiresApproval: false, automatable: true },
  { from: "qualified", to: "onboarding", trigger: "deal-closed", conditions: ["contract-signed", "payment-received"], requiresApproval: true, automatable: false },
  { from: "onboarding", to: "active", trigger: "onboarding-complete", conditions: ["setup-done", "first-value-achieved"], requiresApproval: false, automatable: true },
  { from: "active", to: "expansion", trigger: "expansion-opportunity", conditions: ["usage-growing", "satisfaction-high", "budget-available"], requiresApproval: false, automatable: true },
  { from: "active", to: "at-risk", trigger: "health-decline", conditions: ["engagement-dropping", "support-tickets-rising"], requiresApproval: false, automatable: true },
  { from: "expansion", to: "at-risk", trigger: "health-decline", conditions: ["usage-declining", "champion-left"], requiresApproval: false, automatable: true },
  { from: "at-risk", to: "churning", trigger: "cancellation-signal", conditions: ["cancel-request", "contract-expiring-no-renewal"], requiresApproval: false, automatable: true },
  { from: "at-risk", to: "active", trigger: "recovery-success", conditions: ["engagement-restored", "issue-resolved"], requiresApproval: false, automatable: true },
  { from: "churning", to: "churned", trigger: "contract-ended", conditions: ["final-invoice-paid", "data-exported"], requiresApproval: true, automatable: false },
  { from: "churning", to: "active", trigger: "save-success", conditions: ["new-deal-signed", "discount-applied"], requiresApproval: true, automatable: false },
  { from: "churned", to: "win-back", trigger: "re-engagement", conditions: ["responded-to-outreach", "new-need-identified"], requiresApproval: false, automatable: true },
  { from: "win-back", to: "onboarding", trigger: "re-signed", conditions: ["new-contract", "payment-received"], requiresApproval: true, automatable: false },
  { from: "win-back", to: "dormant", trigger: "no-response", conditions: ["outreach-exhausted", "90-days-no-contact"], requiresApproval: false, automatable: true },
  { from: "dormant", to: "win-back", trigger: "spontaneous-contact", conditions: ["inbound-inquiry"], requiresApproval: false, automatable: true },
];

// ── Lifecycle Event ─────────────────────────────────────────

export interface LifecycleEvent {
  id: string;
  customerId: string;
  fromStage: CustomerLifecycleStage;
  toStage: CustomerLifecycleStage;
  trigger: string;
  triggeredBy: "system" | "advisor" | "user";
  metadata: Record<string, unknown>;
  timestamp: string;
}

// ── Health Score ─────────────────────────────────────────────

export interface CustomerHealthDimension {
  name: string;
  score: number; // 0–100
  weight: number; // 0–1
  signals: string[];
  trend: "improving" | "stable" | "declining";
}

export interface CustomerHealthScore {
  customerId: string;
  overallScore: number; // 0–100
  grade: "A" | "B" | "C" | "D" | "F";
  dimensions: CustomerHealthDimension[];
  computedAt: string;
  nextReviewAt: string;
}

export function computeHealthGrade(score: number): "A" | "B" | "C" | "D" | "F" {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  if (score >= 40) return "D";
  return "F";
}

export function computeOverallHealth(dimensions: CustomerHealthDimension[]): number {
  const totalWeight = dimensions.reduce((sum, d) => sum + d.weight, 0);
  if (totalWeight === 0) return 0;
  const weighted = dimensions.reduce((sum, d) => sum + d.score * d.weight, 0);
  return Math.round(weighted / totalWeight);
}

// ── Churn Prediction ────────────────────────────────────────

export interface ChurnPredictionInput {
  customerId: string;
  daysSinceLastLogin: number;
  supportTicketsLast30Days: number;
  npsScore: number | null;
  contractDaysRemaining: number;
  usageTrendPct: number; // negative = declining
  paymentDelayDays: number;
  championPresent: boolean;
  competitorMentions: number;
  featureAdoptionPct: number;
}

export interface ChurnPrediction {
  customerId: string;
  churnProbability: number; // 0–1
  riskFactors: Array<{ factor: string; impact: number; description: string }>;
  suggestedActions: string[];
  predictedAt: string;
  modelVersion: string;
}

export function computeChurnRisk(input: ChurnPredictionInput): number {
  let risk = 0;
  if (input.daysSinceLastLogin > 30) risk += 0.15;
  if (input.daysSinceLastLogin > 60) risk += 0.15;
  if (input.supportTicketsLast30Days > 5) risk += 0.1;
  if (input.npsScore !== null && input.npsScore < 6) risk += 0.15;
  if (input.contractDaysRemaining < 30) risk += 0.1;
  if (input.usageTrendPct < -20) risk += 0.15;
  if (input.paymentDelayDays > 15) risk += 0.1;
  if (!input.championPresent) risk += 0.05;
  if (input.competitorMentions > 0) risk += 0.1;
  if (input.featureAdoptionPct < 30) risk += 0.1;
  return Math.min(1, Math.max(0, risk));
}

// ── Transition Validation ───────────────────────────────────

export function isValidTransition(from: CustomerLifecycleStage, to: CustomerLifecycleStage): boolean {
  return LIFECYCLE_TRANSITIONS.some(t => t.from === from && t.to === to);
}

export function getAvailableTransitions(from: CustomerLifecycleStage): LifecycleTransitionRule[] {
  return LIFECYCLE_TRANSITIONS.filter(t => t.from === from);
}

export function getTransitionRule(from: CustomerLifecycleStage, to: CustomerLifecycleStage): LifecycleTransitionRule | undefined {
  return LIFECYCLE_TRANSITIONS.find(t => t.from === from && t.to === to);
}

// ── Customer Lifecycle Record ───────────────────────────────

export interface CustomerLifecycleRecord {
  customerId: string;
  currentStage: CustomerLifecycleStage;
  stageEnteredAt: string;
  stageHistory: Array<{ stage: CustomerLifecycleStage; enteredAt: string; exitedAt: string; durationDays: number }>;
  healthScore: CustomerHealthScore;
  churnPrediction?: ChurnPrediction;
  assignedAdvisor?: string;
  nextCheckIn: string;
  lifetimeValueCents: number;
  tags: string[];
}
