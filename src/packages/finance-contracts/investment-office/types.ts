// ═══════════════════════════════════════════════════════════════
// SITA OS — Investment Office Contracts
// Full type system for family office, portfolio, risk, regime,
// thesis, committee, execution, and proof-backed investment ops
// ═══════════════════════════════════════════════════════════════

// ── Market Regime ───────────────────────────────────────────────

export type MarketRegime = "risk-on" | "risk-off" | "transition" | "crisis" | "recovery";

export interface MarketRegimeResult {
  currentRegime: MarketRegime;
  confidence: number;
  signals: { indicator: string; value: number; interpretation: string }[];
  suggestedPosture: "aggressive" | "balanced" | "defensive" | "cash-heavy";
  lastAssessedAt: string;
  previousRegime: MarketRegime;
  transitionedAt?: string;
}

// ── Portfolio Exposure ──────────────────────────────────────────

export interface PortfolioExposureSummary {
  totalValueCents: number;
  byAssetClass: { assetClass: string; valueCents: number; percent: number; targetPercent: number }[];
  bySector: { sector: string; valueCents: number; percent: number }[];
  byGeography: { region: string; valueCents: number; percent: number }[];
  concentrationRisks: string[];
  lastUpdated: string;
}

// ── Risk Budget ─────────────────────────────────────────────────

export interface RiskBudgetResult {
  totalRiskBudget: number;
  usedRiskBudget: number;
  remainingRiskBudget: number;
  valueAtRisk: number;
  maxDrawdown: number;
  sharpeRatio: number;
  recommendations: string[];
  calculatedAt: string;
}

// ── Scenario & Stress ───────────────────────────────────────────

export interface ScenarioResult {
  scenarioName: string;
  description: string;
  assumptions: Record<string, number>;
  projectedImpactCents: number;
  projectedReturnPercent: number;
  probability: number;
  riskLevel: "low" | "moderate" | "high" | "extreme";
  recommendedActions: string[];
  simulatedAt: string;
}

export interface MonteCarloResult {
  paths: number;
  medianReturnPct: number;
  p5ReturnPct: number;
  p95ReturnPct: number;
  maxDrawdownMedian: number;
  probabilityOfLoss: number;
  expectedShortfallPct: number;
  simulatedAt: string;
}

export interface HistoricalReplayResult {
  scenarioName: string;
  period: string;
  replayedReturnPct: number;
  maxDrawdownPct: number;
  recoveryDays: number;
  worstDay: { date: string; returnPct: number };
  correlationToOriginal: number;
  simulatedAt: string;
}

// ── Allocation ──────────────────────────────────────────────────

export interface AllocationSuggestion {
  fromAssetClass: string;
  toAssetClass: string;
  amountCents: number;
  rationale: string;
  expectedImpact: string;
  urgency: "immediate" | "this-week" | "this-month" | "next-rebalance";
  requiresApproval: boolean;
  confidence: number;
}

export interface RebalanceRecommendation {
  assetClass: string;
  currentPct: number;
  targetPct: number;
  driftPct: number;
  action: "buy" | "sell" | "hold";
  amountCents: number;
  urgency: "immediate" | "this-week" | "next-rebalance";
  rationale: string;
}

// ── Thesis ──────────────────────────────────────────────────────

export interface ThesisRecord {
  id: string;
  title: string;
  assetClass: string;
  thesis: string;
  timeHorizon: string;
  entryConditions: string[];
  exitConditions: string[];
  riskFactors: string[];
  status: "active" | "monitoring" | "closed" | "invalidated";
  createdAt: string;
  lastReviewedAt: string;
  performance?: { returnPercent: number; vsExpected: string };
}

export interface ThesisCandidate {
  assetClass: string;
  asset: string;
  direction: "long" | "short" | "neutral";
  rationale: string;
  catalysts: string[];
  contradictions: string[];
  confidenceBand: { low: number; mid: number; high: number };
  regimeAlignment: boolean;
  suggestedSize: string;
  sourceIds: string[];
}

// ── Committee ───────────────────────────────────────────────────

export interface InvestmentCommitteePacket {
  sessionDate: string;
  marketRegime: MarketRegimeResult;
  portfolioExposure: PortfolioExposureSummary;
  riskBudget: RiskBudgetResult;
  pendingAllocations: AllocationSuggestion[];
  activeTheses: ThesisRecord[];
  scenarios: ScenarioResult[];
  recommendations: string[];
  generatedAt: string;
}

// ── Trade & Execution ───────────────────────────────────────────

export interface TradeReviewPacket {
  tradeId: string;
  asset: string;
  direction: "buy" | "sell";
  quantityOrAmountCents: number;
  rationale: string;
  thesisId?: string;
  riskImpact: string;
  complianceCheck: { passed: boolean; flags: string[] };
  approvalRequired: boolean;
  reviewedAt: string;
}

export interface ExecutionIntent {
  id: string;
  tradeReviewId: string;
  asset: string;
  direction: "buy" | "sell";
  amountCents: number;
  venue: string;
  orderType: "market" | "limit" | "stop";
  limitPrice?: number;
  expiresAt?: string;
  status: "pending-approval" | "approved" | "submitted" | "filled" | "cancelled" | "failed";
  submittedAt?: string;
  filledAt?: string;
  fillPrice?: number;
}

export interface TradeCostEstimate {
  asset: string;
  amountCents: number;
  estimatedSlippageBps: number;
  commissionCents: number;
  spreadCostCents: number;
  totalFrictionCents: number;
  netProceedsCents: number;
  venue: string;
  estimatedAt: string;
}

export interface SlippageFeeResult {
  grossReturnPct: number;
  slippageCostPct: number;
  commissionCostPct: number;
  spreadCostPct: number;
  taxDragPct: number;
  netReturnPct: number;
  totalFrictionPct: number;
  calculatedAt: string;
}

// ── Stop / Exit ─────────────────────────────────────────────────

export interface StopExitPolicyResult {
  asset: string;
  currentPrice: number;
  trailingStopPrice: number;
  trailingStopPct: number;
  hardStopPrice: number;
  invalidationTriggered: boolean;
  invalidationConditions: { condition: string; triggered: boolean }[];
  recommendedAction: "hold" | "tighten-stop" | "exit-partial" | "exit-full";
  evaluatedAt: string;
}

// ── Factor Risk ─────────────────────────────────────────────────

export interface FactorRiskDecomposition {
  factors: { name: string; exposure: number; contribution: number; benchmark: number }[];
  residualRisk: number;
  totalFactorRisk: number;
  dominantFactor: string;
  concentrationWarnings: string[];
  calculatedAt: string;
}

// ── Mandate Compliance ──────────────────────────────────────────

export interface MandateComplianceResult {
  mandateId: string;
  mandateName: string;
  rules: { rule: string; compliant: boolean; currentValue: number; limit: number; breachSeverity?: "minor" | "major" | "critical" }[];
  overallCompliant: boolean;
  breachCount: number;
  lastCheckedAt: string;
}

// ── Robust Optimization ─────────────────────────────────────────

export interface RobustOptimizationResult {
  optimalWeights: { assetClass: string; weight: number; confidenceInterval: { low: number; high: number } }[];
  expectedReturnPct: number;
  expectedVolatilityPct: number;
  estimationUncertainty: number;
  shrinkageApplied: boolean;
  shrinkageIntensity: number;
  solverStatus: "optimal" | "sub-optimal" | "infeasible";
  calculatedAt: string;
}

// ── Leverage ────────────────────────────────────────────────────

export interface LeverageCapResult {
  currentLeverage: number;
  maxLeverage: number;
  regimeAdjustedMax: number;
  headroom: number;
  leverageBreached: boolean;
  recommendation: string;
  calculatedAt: string;
}

// ── Capital Call / Commitment Pacing ────────────────────────────

export interface CapitalCallPlan {
  commitments: { fundName: string; totalCommitmentCents: number; calledCents: number; uncalledCents: number; expectedCallDate: string; probability: number }[];
  totalUncalledCents: number;
  liquidReserveCents: number;
  coverageRatio: number;
  shortfallCents: number;
  pacingRecommendation: string;
  calculatedAt: string;
}

export interface CommitmentPacing {
  vintageYear: number;
  totalCommittedCents: number;
  deployedCents: number;
  deploymentRate: number;
  targetDeploymentRate: number;
  onTrack: boolean;
  recommendation: string;
}

// ── Tax Reserve ─────────────────────────────────────────────────

export interface TaxReserveResult {
  estimatedLiabilityCents: number;
  currentReserveCents: number;
  shortfallCents: number;
  adequacy: "adequate" | "marginal" | "underfunded" | "critically-underfunded";
  nextObligationDate: string;
  nextObligationCents: number;
  realizedGainsCents: number;
  unrealizedGainsCents: number;
  harvestOpportunities: { asset: string; lossCents: number; strategy: string }[];
  calculatedAt: string;
}

// ── Liquidity ───────────────────────────────────────────────────

export interface LiquidityLadder {
  tiers: { tier: string; label: string; valueCents: number; percentOfPortfolio: number }[];
  totalLiquidCents: number;
  totalIlliquidCents: number;
  liquidityRatio: number;
  adequacy: "strong" | "adequate" | "tight" | "stressed";
  calculatedAt: string;
}

export interface ReserveProtectionResult {
  reservesCents: number;
  projectedDrawdownCents: number;
  canAbsorb: boolean;
  coverageRatio: number;
  gapCents: number;
  recommendation: string;
  calculatedAt: string;
}

export interface ObligationCoverageResult {
  totalObligationsCents: number;
  liquidCapitalCents: number;
  coverageRatio: number;
  monthsCovered: number;
  adequate: boolean;
  obligations: { name: string; amountCents: number; dueDate: string }[];
  calculatedAt: string;
}

// ── Correlation ─────────────────────────────────────────────────

export interface CorrelationMatrixResult {
  assets: string[];
  matrix: number[][];
  highCorrelationPairs: { asset1: string; asset2: string; correlation: number }[];
  averageCorrelation: number;
  diversificationScore: number;
  calculatedAt: string;
}

// ── FX / Crypto / Venue ─────────────────────────────────────────

export interface FxExposureSummary {
  baseCurrency: string;
  exposures: { currency: string; valueCents: number; percentOfPortfolio: number; hedged: boolean }[];
  totalUnhedgedPercent: number;
  riskLevel: "low" | "moderate" | "high";
  recommendations: string[];
  lastUpdated: string;
}

export interface CryptoExposureSummary {
  totalValueCents: number;
  holdings: { asset: string; quantity: number; valueCents: number; percent: number; venue: string }[];
  custodyBreakdown: { type: "exchange" | "cold-wallet" | "defi"; percent: number }[];
  riskFlags: string[];
  lastUpdated: string;
}

export interface VenueRiskSummary {
  venues: { name: string; type: string; balanceCents: number; riskScore: number; insurance: boolean; lastAudit?: string }[];
  concentrationWarnings: string[];
  recommendations: string[];
  assessedAt: string;
}

// ── Watchlist & Research ────────────────────────────────────────

export interface WatchlistEntry {
  id: string;
  asset: string;
  assetClass: string;
  addedAt: string;
  reason: string;
  priceAtAdd: number;
  currentPrice: number;
  changePct: number;
  regimeAlignment: boolean;
  thesisCandidate: boolean;
  alerts: string[];
}

export interface WatchlistWithRegime {
  entries: WatchlistEntry[];
  currentRegime: MarketRegime;
  regimeSignals: { indicator: string; value: number; interpretation: string }[];
  lastUpdated: string;
}

export interface ResearchContext {
  id: string;
  asset: string;
  savedAt: string;
  notes: string;
  sources: { title: string; url?: string; date: string; confidence: number }[];
  contradictions: string[];
  confidenceSummary: { low: number; mid: number; high: number };
  linkedThesisIds: string[];
}

// ── Net Worth & Entity ──────────────────────────────────────────

export interface NetWorthResult {
  totalAssetsCents: number;
  totalLiabilitiesCents: number;
  netWorthCents: number;
  byEntity: { entity: string; assetsCents: number; liabilitiesCents: number; netCents: number }[];
  changeFromLastPeriodPct: number;
  calculatedAt: string;
}

export interface EntityCapitalSeparation {
  entities: { entityId: string; entityName: string; capitalCents: number; reservesCents: number; deployableCents: number; restricted: boolean }[];
  totalCrossBorderRisk: number;
  isolationScore: number;
  warnings: string[];
  calculatedAt: string;
}

export interface DeployableCapitalResult {
  totalCapitalCents: number;
  reservesCents: number;
  restrictedCents: number;
  obligationsCents: number;
  deployableCents: number;
  deployablePct: number;
  constraints: string[];
  calculatedAt: string;
}

// ── Cash & Reserve Posture ──────────────────────────────────────

export interface CashPosture {
  totalCashCents: number;
  byEntity: { entity: string; cashCents: number }[];
  cashAsPercentOfPortfolio: number;
  targetCashPct: number;
  posture: "over-cash" | "on-target" | "under-cash" | "critically-low";
  recommendation: string;
  calculatedAt: string;
}

export interface ReservePosture {
  totalReservesCents: number;
  byBucket: { bucket: string; currentCents: number; targetCents: number; fundedPct: number }[];
  overallFundedPct: number;
  monthsCoverage: number;
  posture: "fully-funded" | "adequate" | "gap" | "critical-gap";
  recommendation: string;
  calculatedAt: string;
}

export interface LiquidityPosture {
  immediateCents: number;
  within30dCents: number;
  within90dCents: number;
  lockedCents: number;
  totalPortfolioCents: number;
  liquidityRatio: number;
  posture: "strong" | "adequate" | "tight" | "stressed";
  calculatedAt: string;
}

// ── Opportunity Scoring ─────────────────────────────────────────

export interface OpportunityScore {
  asset: string;
  thesisStrength: number;
  regimeAlignment: number;
  riskRewardRatio: number;
  liquidityScore: number;
  compositeScore: number;
  rank: number;
  recommendation: string;
  scoredAt: string;
}

// ── Connector Sync Contracts ────────────────────────────────────

export interface BrokerageSyncResult {
  provider: string;
  syncedAt: string;
  accountCount: number;
  positionCount: number;
  balanceCents: number;
  status: "success" | "partial" | "failed";
  errors: string[];
}

export interface CryptoExchangeSyncResult {
  exchange: string;
  syncedAt: string;
  holdingCount: number;
  totalValueCents: number;
  status: "success" | "partial" | "failed";
  errors: string[];
}

export interface MarketDataSnapshot {
  provider: string;
  assetCount: number;
  lastPriceAt: string;
  staleness: "live" | "delayed" | "stale";
  status: "success" | "partial" | "failed";
}

export interface BankSyncResult {
  institution: string;
  syncedAt: string;
  accountCount: number;
  totalBalanceCents: number;
  transactionsSynced: number;
  status: "success" | "partial" | "failed";
  errors: string[];
}

// ── Proof Artifacts ─────────────────────────────────────────────

export interface InvestmentDecisionProof {
  id: string;
  decisionType: "trade" | "rebalance" | "thesis-change" | "regime-review" | "allocation-change";
  summary: string;
  inputs: Record<string, unknown>;
  outcome: string;
  approvalId?: string;
  correlationId: string;
  createdAt: string;
  hash: string;
}

// ── Trust Mode ──────────────────────────────────────────────────

export type InvestmentTrustMode =
  | "observe-only"
  | "recommendation-only"
  | "simulation-first"
  | "approval-required"
  | "constrained-execution"
  | "paper-sandbox";
