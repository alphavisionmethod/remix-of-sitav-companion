// ═══════════════════════════════════════════════════════════════
// SITA OS — Advanced Financial Intelligence Contract Types
// Stress Radar, Life Events, Money Modes, Cash Allocation,
// Income Quality, Peace Score, Trust Graph, Opportunity Cost,
// Rituals, Emotional Finance
// ═══════════════════════════════════════════════════════════════

// ── Stress Radar ─────────────────────────────────────────────

export type StressSeverity = "critical" | "high" | "medium" | "low";
export type StressCategory =
  | "cash-squeeze" | "bill-collision" | "reserve-weakness"
  | "debt-inflection" | "cashflow-fragility" | "founder-draw"
  | "tax-shortfall" | "subscription-creep" | "float-reliance"
  | "utilization-danger";

export interface StressSignal {
  id: string;
  category: StressCategory;
  severity: StressSeverity;
  title: string;
  description: string;
  timing: string;
  impactCents: number;
  windowStart: string;
  windowEnd: string;
  mitigations: string[];
}

export interface StressRadarResult {
  signals: StressSignal[];
  overallStressLevel: StressSeverity;
  squeezeWindows: Array<{ start: string; end: string; shortfallCents: number }>;
  billCollisions: Array<{ date: string; bills: string[]; totalCents: number }>;
}

// ── Life Events ──────────────────────────────────────────────

export type LifeEventType =
  | "moving" | "having-child" | "starting-business" | "hiring"
  | "buying-home" | "taking-debt" | "job-change" | "launching-offer"
  | "seasonal-slowdown" | "health-event" | "travel";

export interface LifeEvent {
  type: LifeEventType;
  label: string;
  icon: string;
  description: string;
}

export interface LifeMoneyImpact {
  event: LifeEventType;
  cashflowImpactCents: number;
  safeToSpendChange: number;
  reserveNeedsCents: number;
  budgetShifts: Array<{ category: string; changePct: number }>;
  billPressureChange: number;
  riskWindows: Array<{ start: string; end: string; risk: string }>;
  suggestedChanges: string[];
}

// ── Money Modes ──────────────────────────────────────────────

export type MoneyModeId =
  | "stable" | "tighten" | "recovery" | "growth" | "expansion"
  | "debt-attack" | "tax-protection" | "founder-conservation"
  | "household-protection" | "launch-mode";

export interface MoneyMode {
  id: MoneyModeId;
  label: string;
  description: string;
  icon: string;
  safeToSpendPosture: "normal" | "conservative" | "aggressive" | "minimal";
  warningThreshold: "standard" | "elevated" | "strict";
  reserveTargetMultiplier: number;
  advisorTone: "supportive" | "cautious" | "aggressive" | "protective" | "ambitious";
  billPrioritization: string;
  discretionaryGuidance: string;
}

// ── Cash Allocation ──────────────────────────────────────────

export type AllocationBucket =
  | "bills" | "tax-reserve" | "emergency-reserve" | "debt-payoff"
  | "sinking-funds" | "payroll-reserve" | "discretionary"
  | "investments" | "expansion-reserve";

export interface AllocationEntry {
  bucket: AllocationBucket;
  label: string;
  amountCents: number;
  percentOfTotal: number;
  reasoning: string;
}

export type AllocationStrategy = "conservative" | "balanced" | "aggressive";

export interface CashAllocationPlan {
  strategy: AllocationStrategy;
  availableCashCents: number;
  allocations: AllocationEntry[];
  totalAllocatedCents: number;
  unallocatedCents: number;
}

// ── Income Quality ───────────────────────────────────────────

export interface IncomeQualityDimension {
  key: string;
  label: string;
  score: number; // 0-100
  insight: string;
}

export interface IncomeQualityScore {
  compositeScore: number;
  grade: string;
  dimensions: IncomeQualityDimension[];
  topRisk: string;
  recommendation: string;
}

// ── Peace Score ──────────────────────────────────────────────

export interface PeaceScoreDimension {
  key: string;
  label: string;
  score: number;
  weight: number;
  status: "strong" | "adequate" | "weak" | "critical";
  insight: string;
}

export interface PeaceScoreResult {
  compositeScore: number;
  grade: string;
  trend: "improving" | "stable" | "declining";
  dimensions: PeaceScoreDimension[];
  topStrength: string;
  topWeakness: string;
  guidance: string;
}

// ── Financial Trust Graph ────────────────────────────────────

export type TrustNodeType =
  | "account" | "bill" | "debt" | "reserve" | "income"
  | "tax" | "payroll" | "card" | "goal";

export type TrustEdgeHealth = "healthy" | "stressed" | "broken" | "unknown";

export interface FinancialTrustNode {
  id: string;
  type: TrustNodeType;
  label: string;
  valueCents: number;
  health: TrustEdgeHealth;
}

export interface FinancialTrustEdge {
  from: string;
  to: string;
  relationship: string;
  health: TrustEdgeHealth;
  description: string;
}

export interface FinancialTrustGraph {
  nodes: FinancialTrustNode[];
  edges: FinancialTrustEdge[];
  overallIntegrity: number;
}

// ── Opportunity Cost ─────────────────────────────────────────

export interface OpportunityCostEntry {
  category: string;
  spentCents: number;
  preventedReserveGrowthCents: number;
  delayedDebtPayoffDays: number;
  delayedGoalProgressPct: number;
  alternativeUse: string;
}

// ── Money Rituals ────────────────────────────────────────────

export type RitualFrequency = "daily" | "weekly" | "monthly" | "quarterly";

export interface MoneyRitual {
  id: string;
  name: string;
  description: string;
  frequency: RitualFrequency;
  steps: RitualStep[];
  lastCompleted?: string;
  nextDue: string;
  estimatedMinutes: number;
}

export interface RitualStep {
  id: string;
  label: string;
  description: string;
  completed: boolean;
}

// ── Emotional Finance ────────────────────────────────────────

export type EmotionalPatternType =
  | "panic-spending" | "guilt-spending" | "avoidance"
  | "stress-float" | "defer-pattern" | "feast-famine";

export interface EmotionalPattern {
  type: EmotionalPatternType;
  label: string;
  description: string;
  severity: StressSeverity;
  frequency: string;
  guidance: string;
  suggestedMode?: MoneyModeId;
}
