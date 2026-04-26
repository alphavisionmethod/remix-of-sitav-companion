// ═══════════════════════════════════════════════════════════════
// SITA OS — Canonical Finance Domain: Service-Output DTOs
//
// Derived/computed view types produced by Finance services and
// consumed by the UI layer. These are NOT persistent entities —
// persistent entities live in `@/packages/finance-contracts` and
// are re-exported via `../contracts`.
//
// Pure types only. No React, no runtime, no I/O. Domain depends
// on nothing.
// ═══════════════════════════════════════════════════════════════

import type {
  WasteOpportunity,
  ObligationRecord,
  AccountType,
  FinancialAccount,
  SafeToSpendResult,
} from "@/packages/finance-contracts";
import type { RenewalRisk } from "@/packages/finance-contracts/subscriptions/renewal-risk";
import type {
  MarketRegimeResult,
  RiskBudgetResult,
  FactorRiskDecomposition,
  TradeReviewPacket,
  CryptoExposureSummary,
} from "@/packages/finance-contracts/investment-office";
import type { EntityCapitalMap } from "@/packages/finance-contracts/family-office";

// ── Subscriptions / Waste ────────────────────────────────────

export interface WasteReport {
  totalWasteAnnualCents: number;
  totalWasteMonthCents: number;
  opportunities: WasteOpportunity[];
  topCategory: string;
  actionableCount: number;
  generatedAt: string;
}

export interface DetectedSubscription {
  merchantName: string;
  averageAmountCents: number;
  frequency: "monthly" | "quarterly" | "annually";
  occurrences: number;
  confidence: number;
  firstSeen: string;
  lastSeen: string;
}

export interface RenewalRiskReport {
  risks: RenewalRisk[];
  totalPotentialSavingsCents: number;
  highRiskCount: number;
  upcomingRenewals30Days: number;
  generatedAt: string;
}

// ── Categorization ───────────────────────────────────────────

export interface CategorizationRule {
  id: string;
  pattern: string;
  category: string;
  subcategory?: string;
  priority: number;
}

// ── Bills / obligations / receivables ───────────────────────

export interface DueSoonAlert {
  obligationId: string;
  name: string;
  amountCents: number;
  dueDate: string;
  daysUntilDue: number;
  severity: "info" | "warning" | "urgent";
  hasAutoPay: boolean;
  message: string;
}

export interface BillCalendarDay {
  date: string;
  obligations: ObligationRecord[];
  totalDueCents: number;
}

export interface BillCalendarMonth {
  month: string;
  days: BillCalendarDay[];
  totalDueCents: number;
  obligationCount: number;
}

export interface RecurringObligationSummary {
  totalMonthlyCommitmentCents: number;
  totalAnnualCommitmentCents: number;
  obligationCount: number;
  byFrequency: { frequency: string; count: number; monthlyCents: number }[];
  byCategory: { category: string; count: number; monthlyCents: number }[];
  autoPayCount: number;
  manualPayCount: number;
  generatedAt: string;
}

export interface ReceivableAgingReport {
  current: { count: number; totalCents: number };
  thirtyDay: { count: number; totalCents: number };
  sixtyDay: { count: number; totalCents: number };
  ninetyPlus: { count: number; totalCents: number };
  totalOutstandingCents: number;
  averageAgingDays: number;
  generatedAt: string;
}

// ── Accounts / sync ─────────────────────────────────────────

export interface AccountsByType {
  type: AccountType;
  accounts: FinancialAccount[];
  totalBalanceCents: number;
  count: number;
}

export interface SyncResult {
  accountId: string;
  previousBalanceCents: number;
  newBalanceCents: number;
  deltaCents: number;
  synced: boolean;
  syncedAt: string;
  discrepancy: boolean;
  discrepancyReason?: string;
}

export interface SyncHealthReport {
  totalAccounts: number;
  synced: number;
  failed: number;
  stale: number;
  avgSyncAgeMinutes: number;
  overallHealth: "healthy" | "degraded" | "critical";
  generatedAt: string;
}

// ── Cash / spending / peace ─────────────────────────────────

export interface SafeToSpendForecast {
  current: SafeToSpendResult;
  sevenDay: SafeToSpendResult;
  thirtyDay: SafeToSpendResult;
  trend: "improving" | "stable" | "tightening";
  recommendations: string[];
}

export interface PeaceScoreInput {
  reserveFundedPct: number;
  billsCoveredPct: number;
  debtToIncomeRatio: number;
  taxReservedPct: number;
  incomeStabilityScore: number;
  obligationPressurePct: number;
  discretionaryRoomPct: number;
  householdCoordinationScore: number;
}

export interface IncomeQualityInput {
  recurringIncomePct: number;
  topClientConcentrationPct: number;
  seasonalVariationPct: number;
  avgPaymentDelayDays: number;
  oneTimeIncomePct: number;
  householdDependencyOnUnstablePct: number;
}

export interface CashAllocatorInput {
  availableCashCents: number;
  billsDueCents: number;
  taxOwedCents: number;
  taxReservedCents: number;
  emergencyTargetCents: number;
  emergencyCurrentCents: number;
  debtBalanceCents: number;
  debtMinimumCents: number;
  sinkingFundTargetCents: number;
  sinkingFundCurrentCents: number;
  payrollNeededCents: number;
  payrollReservedCents: number;
}

export interface StressRadarInput {
  cashBalanceCents: number;
  monthlyIncomeCents: number;
  monthlyBurnCents: number;
  upcomingBills: Array<{ name: string; amountCents: number; dueDate: string }>;
  reserveFundedPct: number;
  reserveTargetCents: number;
  totalDebtCents: number;
  monthlyDebtPaymentCents: number;
  creditUtilizationPct: number;
  subscriptionMonthlyCents: number;
  subscriptionCountActive: number;
  taxReservedPct: number;
  taxOwedEstimateCents: number;
  founderDrawMonthlyCents: number;
  founderDrawStable: boolean;
  floatReliancePct: number;
}

// ── FX / regime ─────────────────────────────────────────────

export interface FxAlert {
  currency: string;
  type: "threshold-breach" | "volatility-spike" | "hedge-opportunity";
  message: string;
  severity: "info" | "warning" | "urgent";
  createdAt: string;
}

export interface RegimeHistory {
  regimes: { regime: string; startDate: string; endDate?: string; durationDays: number }[];
  currentRegime: MarketRegimeResult;
  avgRegimeDurationDays: number;
}

// ── Crypto exposure ─────────────────────────────────────────

export interface CryptoRiskAssessment {
  exposure: CryptoExposureSummary;
  percentOfPortfolio: number;
  mandateLimit: number;
  withinMandate: boolean;
  custodyScore: number;
  recommendations: string[];
}

// ── Portfolio risk ──────────────────────────────────────────

export interface PortfolioRiskReport {
  riskBudget: RiskBudgetResult;
  factorRisk: FactorRiskDecomposition;
  stressScenarios: { name: string; impactPct: number; severity: string }[];
  overallRiskLevel: "low" | "moderate" | "elevated" | "high";
  recommendations: string[];
  generatedAt: string;
}

// ── Execution ───────────────────────────────────────────────

export interface ExecutionQualityReport {
  trades: TradeReviewPacket[];
  avgSlippageBps: number;
  totalCommissionCents: number;
  bestExecution: boolean;
  recommendations: string[];
  generatedAt: string;
}

// ── Entity capital ──────────────────────────────────────────

export interface EntityCapitalReport {
  entity: EntityCapitalMap;
  debtToAssetRatio: number;
  jurisdictionCompliance: boolean;
  recommendations: string[];
}

// ── Boardroom committee briefing ────────────────────────────

export interface CommitteeBriefing {
  sessionDate: string;
  marketSummary: string;
  portfolioHighlights: string[];
  riskAlerts: string[];
  pendingDecisions: { topic: string; urgency: string; deadline: string }[];
  performanceSummary: { period: string; returnPct: number; benchmarkPct: number; alpha: number };
  generatedAt: string;
}

// ── Investment Office runtime ───────────────────────────────

export type RegimeType = "bull" | "bear" | "sideways" | "volatile" | "crisis" | "recovery";
export type SyncStatus = "synced" | "stale" | "error" | "syncing" | "disconnected";
export type InvestmentAction =
  | "rebalance"
  | "tax_harvest"
  | "dividend_reinvest"
  | "risk_review"
  | "regime_shift"
  | "allocation_drift";

export interface PortfolioSnapshot {
  id: string;
  capturedAt: string;
  totalValueCents: number;
  allocation: Record<string, number>;
  driftPercent: Record<string, number>;
  maxDrift: number;
  staleFields: string[];
  regime: RegimeType;
}

export interface ConnectorSyncState {
  connectorId: string;
  provider: string;
  status: SyncStatus;
  lastSyncAt: string;
  staleSinceMs: number;
  consecutiveErrors: number;
  lastError?: string;
  retryCount: number;
  circuitBroken: boolean;
}

export interface InvestmentProofReceipt {
  id: string;
  action: InvestmentAction;
  timestamp: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  durationMs: number;
  regime: RegimeType;
  confidence: number;
  approved: boolean;
  approvedBy?: string;
}

export interface RegimeSignal {
  indicator: string;
  value: number;
  threshold: number;
  direction: "bullish" | "bearish" | "neutral";
  weight: number;
}

export interface RegimeDetection {
  current: RegimeType;
  previous: RegimeType;
  changedAt: string;
  confidence: number;
  signals: RegimeSignal[];
  rebalanceSuggested: boolean;
}

export interface InvestmentOfficeSummary {
  portfolioValue: number;
  regime: RegimeType;
  maxDrift: number;
  driftAlert: boolean;
  connectorHealth: { total: number; synced: number; stale: number; error: number };
  pendingActions: number;
  lastRebalanceAt?: string;
  receiptsGenerated: number;
}

// ── Investment memory (advisor / thesis / portfolio / event) ─

export interface MemoryChange {
  id: string;
  domain: "user" | "advisor" | "thesis" | "portfolio" | "event";
  type: string;
  title: string;
  summary: string;
  severity: "info" | "warning" | "alert" | "positive";
  timestamp: string;
  relatedAssetIds?: string[];
  relatedAdvisorIds?: string[];
  relatedThesisId?: string;
  relatedDecisionId?: string;
}

export interface AdvisorMemoryState {
  advisorId: string;
  domain: string;
  currentStance: string;
  confidenceLevel: number;
  stanceHistory: { date: string; stance: string; confidence: number }[];
  whatChangedOverTime: string[];
  disagreementHistory: { date: string; topic: string; otherAdvisorId: string }[];
}

export interface ThesisMemoryState {
  thesisId: string;
  title: string;
  originalBelief: string;
  currentStatus: "active" | "invalidated" | "closed" | "watching";
  invalidationReason?: string;
  outcomeVsExpectation?: "better" | "worse" | "as-expected" | "pending";
  lessonsSummary?: string;
  assumptions: string[];
  validatedAssumptions: string[];
  invalidatedAssumptions: string[];
}

export interface PortfolioMemoryState {
  exposureShifts: { date: string; assetClass: string; from: number; to: number }[];
  regimeShifts: { date: string; from: string; to: string; confidence: number }[];
  drawdownHistory: { period: string; maxDrawdown: number; recovery: string }[];
  concentrationEvolution: { date: string; topHolding: string; weight: number }[];
}

export interface EventMemoryState {
  catalystsThatMattered: { id: string; title: string; outcome: string; portfolioImpact: string }[];
  eventsChangedOutcomes: { id: string; title: string; before: string; after: string }[];
  timingLessons: { lesson: string; context: string; confidence: number }[];
}

export interface StrategyDNAInference {
  traits: { trait: string; score: number; evidence: string }[];
  dominantStyle: string;
  alignmentScore: number;
  recentDeviations: string[];
}

export interface BehavioralFirewallState {
  overallHealth: number;
  activeDetections: { type: string; severity: string; evidence: string; suggestion: string }[];
  cooldownActive: boolean;
  recentPatterns: string[];
  disciplineScore: number;
}

// ── Revenue memory (business-finance bridge) ────────────────

export interface AdvisorMemoryEntry {
  advisorId: string;
  name: string;
  domain: string;
  stance: string;
  confidence: number;
  timestamp: string;
  whatChanged?: string;
  previousStance?: string;
  confidenceDelta?: number;
}

export interface GrowthDNATrait {
  trait: string;
  score: number;
  trend: "improving" | "declining" | "stable";
  evidenceCount: number;
  lastMeasured: string;
}

export interface WhatChangedItem {
  domain: string;
  description: string;
  impact: "positive" | "negative" | "neutral";
  timestamp: string;
  magnitude: number;
  advisorLinked?: string;
}

export interface GrowthFirewallAlert {
  ruleId: string;
  ruleName: string;
  severity: "warning" | "critical";
  description: string;
  triggerSignal: string;
  recommendation: string;
  timestamp: string;
}

export interface TimeMachineSnapshot {
  snapshotDate: string;
  metrics: {
    monthlyRevenue: number;
    pipelineValue: number;
    activeClients: number;
    conversionRate: number;
    churnRate: number;
    reputationScore: number;
    funnelHealth: number;
  };
  advisorStances: Array<{ name: string; stance: string; confidence: number }>;
  topRisks: string[];
  topOpportunities: string[];
}

export interface AdvisorDebate {
  topic: string;
  disagreements: Array<{
    advisorA: string;
    stanceA: string;
    confidenceA: number;
    advisorB: string;
    stanceB: string;
    confidenceB: number;
    severity: "mild" | "moderate" | "strong";
  }>;
  synthesis: string;
}

export interface AlignmentCluster {
  theme: string;
  advisors: string[];
  avgConfidence: number;
  direction: "bullish" | "bearish" | "neutral";
}