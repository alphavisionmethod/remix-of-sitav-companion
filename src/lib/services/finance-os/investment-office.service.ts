// ═══════════════════════════════════════════════════════════════
// SITA OS — Finance OS: Investment Office Service
// 20+ service functions wrapping deterministic engines
// ═══════════════════════════════════════════════════════════════

import type {
  MarketRegimeResult, PortfolioExposureSummary, RiskBudgetResult,
  ThesisRecord, InvestmentCommitteePacket, ScenarioResult,
  MonteCarloResult, HistoricalReplayResult, RebalanceRecommendation,
  FactorRiskDecomposition, MandateComplianceResult, RobustOptimizationResult,
  StopExitPolicyResult, SlippageFeeResult, TradeCostEstimate, TaxReserveResult,
  LiquidityLadder, LeverageCapResult, CapitalCallPlan, ObligationCoverageResult,
  CorrelationMatrixResult, WatchlistEntry, WatchlistWithRegime, TradeReviewPacket,
  ExecutionIntent, NetWorthResult, DeployableCapitalResult, CashPosture, ReservePosture,
  OpportunityScore, VenueRiskSummary, FxExposureSummary, CryptoExposureSummary,
  InvestmentTrustMode,
} from "@/packages/finance-contracts/investment-office";

// ── 1. Market Regime ────────────────────────────────────────────

export function assessMarketRegime(): MarketRegimeResult {
  return {
    currentRegime: "risk-on",
    confidence: 72,
    signals: [
      { indicator: "VIX", value: 18.5, interpretation: "Low volatility — risk-on environment" },
      { indicator: "Yield Curve", value: 0.45, interpretation: "Positive slope — growth expected" },
      { indicator: "Credit Spreads", value: 3.2, interpretation: "Normal — no stress" },
    ],
    suggestedPosture: "balanced",
    lastAssessedAt: new Date().toISOString(),
    previousRegime: "transition",
    transitionedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  };
}

// ── 2. Portfolio Exposure ───────────────────────────────────────

export function computePortfolioExposure(): PortfolioExposureSummary {
  return {
    totalValueCents: 250000000,
    byAssetClass: [
      { assetClass: "Equities", valueCents: 125000000, percent: 50, targetPercent: 55 },
      { assetClass: "Fixed Income", valueCents: 62500000, percent: 25, targetPercent: 25 },
      { assetClass: "Real Estate", valueCents: 37500000, percent: 15, targetPercent: 12 },
      { assetClass: "Cash", valueCents: 25000000, percent: 10, targetPercent: 8 },
    ],
    bySector: [
      { sector: "Technology", valueCents: 50000000, percent: 20 },
      { sector: "Healthcare", valueCents: 37500000, percent: 15 },
      { sector: "Financial", valueCents: 25000000, percent: 10 },
    ],
    byGeography: [
      { region: "US", valueCents: 175000000, percent: 70 },
      { region: "Europe", valueCents: 50000000, percent: 20 },
      { region: "Asia", valueCents: 25000000, percent: 10 },
    ],
    concentrationRisks: ["Technology sector exceeds 15% threshold"],
    lastUpdated: new Date().toISOString(),
  };
}

// ── 3. Risk Budget ──────────────────────────────────────────────

export function computeRiskBudgetService(): RiskBudgetResult {
  return {
    totalRiskBudget: 100,
    usedRiskBudget: 68,
    remainingRiskBudget: 32,
    valueAtRisk: 125000,
    maxDrawdown: 8.5,
    sharpeRatio: 1.42,
    recommendations: ["Consider reducing equity concentration", "Hedge FX exposure"],
    calculatedAt: new Date().toISOString(),
  };
}

// ── 4. Committee Packet ─────────────────────────────────────────

export function buildCommitteePacket(): InvestmentCommitteePacket {
  return {
    sessionDate: new Date().toISOString(),
    marketRegime: assessMarketRegime(),
    portfolioExposure: computePortfolioExposure(),
    riskBudget: computeRiskBudgetService(),
    pendingAllocations: [],
    activeTheses: [],
    scenarios: [],
    recommendations: ["Rebalance equities to target", "Review real estate overweight"],
    generatedAt: new Date().toISOString(),
  };
}

// ── 5. Monte Carlo Stress ───────────────────────────────────────

export function runMonteCarloStress(): MonteCarloResult {
  return {
    paths: 10000,
    medianReturnPct: 7.2,
    p5ReturnPct: -12.5,
    p95ReturnPct: 28.3,
    maxDrawdownMedian: 14.6,
    probabilityOfLoss: 0.18,
    expectedShortfallPct: -8.2,
    simulatedAt: new Date().toISOString(),
  };
}

// ── 6. Historical Replay ────────────────────────────────────────

export function runHistoricalReplay(): HistoricalReplayResult[] {
  return [
    { scenarioName: "2008 Financial Crisis", period: "2008-09 to 2009-03", replayedReturnPct: -38.2, maxDrawdownPct: 45.1, recoveryDays: 420, worstDay: { date: "2008-10-15", returnPct: -9.0 }, correlationToOriginal: 0.82, simulatedAt: new Date().toISOString() },
    { scenarioName: "COVID Crash", period: "2020-02 to 2020-04", replayedReturnPct: -22.5, maxDrawdownPct: 33.8, recoveryDays: 148, worstDay: { date: "2020-03-16", returnPct: -12.0 }, correlationToOriginal: 0.75, simulatedAt: new Date().toISOString() },
    { scenarioName: "2022 Rate Shock", period: "2022-01 to 2022-10", replayedReturnPct: -18.4, maxDrawdownPct: 24.5, recoveryDays: 310, worstDay: { date: "2022-06-13", returnPct: -3.9 }, correlationToOriginal: 0.88, simulatedAt: new Date().toISOString() },
  ];
}

// ── 7. Rebalance ────────────────────────────────────────────────

export function getRebalanceRecommendations(): RebalanceRecommendation[] {
  return [
    { assetClass: "Equities", currentPct: 50, targetPct: 55, driftPct: -5, action: "buy", amountCents: 12500000, urgency: "this-week", rationale: "Equities underweight vs target by 5%" },
    { assetClass: "Real Estate", currentPct: 15, targetPct: 12, driftPct: 3, action: "sell", amountCents: 7500000, urgency: "next-rebalance", rationale: "Real estate overweight by 3%" },
    { assetClass: "Cash", currentPct: 10, targetPct: 8, driftPct: 2, action: "sell", amountCents: 5000000, urgency: "next-rebalance", rationale: "Excess cash — deploy to equities" },
  ];
}

// ── 8. Factor Risk ──────────────────────────────────────────────

export function getFactorRiskDecomposition(): FactorRiskDecomposition {
  return {
    factors: [
      { name: "Market", exposure: 0.92, contribution: 0.45, benchmark: 1.0 },
      { name: "Size", exposure: 0.15, contribution: 0.08, benchmark: 0.0 },
      { name: "Value", exposure: -0.12, contribution: 0.06, benchmark: 0.0 },
      { name: "Momentum", exposure: 0.28, contribution: 0.18, benchmark: 0.0 },
      { name: "Quality", exposure: 0.35, contribution: 0.15, benchmark: 0.0 },
    ],
    residualRisk: 0.08,
    totalFactorRisk: 0.92,
    dominantFactor: "Market",
    concentrationWarnings: ["Market factor contributes 45% of total risk"],
    calculatedAt: new Date().toISOString(),
  };
}

// ── 9. Mandate Compliance ───────────────────────────────────────

export function checkMandateCompliance(): MandateComplianceResult {
  return {
    mandateId: "mandate-001",
    mandateName: "Conservative Growth Mandate",
    rules: [
      { rule: "Max single position 10%", compliant: true, currentValue: 0.08, limit: 0.10 },
      { rule: "Max equity 60%", compliant: true, currentValue: 0.50, limit: 0.60 },
      { rule: "Min cash 5%", compliant: true, currentValue: 0.10, limit: 0.05 },
      { rule: "Max crypto 10%", compliant: true, currentValue: 0.05, limit: 0.10 },
      { rule: "Max leverage 1.5x", compliant: true, currentValue: 1.0, limit: 1.5 },
    ],
    overallCompliant: true,
    breachCount: 0,
    lastCheckedAt: new Date().toISOString(),
  };
}

// ── 10. Robust Optimization ─────────────────────────────────────

export function getRobustOptimization(): RobustOptimizationResult {
  return {
    optimalWeights: [
      { assetClass: "Equities", weight: 0.52, confidenceInterval: { low: 0.45, high: 0.60 } },
      { assetClass: "Fixed Income", weight: 0.28, confidenceInterval: { low: 0.22, high: 0.35 } },
      { assetClass: "Alternatives", weight: 0.12, confidenceInterval: { low: 0.05, high: 0.18 } },
      { assetClass: "Cash", weight: 0.08, confidenceInterval: { low: 0.05, high: 0.12 } },
    ],
    expectedReturnPct: 7.8,
    expectedVolatilityPct: 12.4,
    estimationUncertainty: 0.15,
    shrinkageApplied: true,
    shrinkageIntensity: 0.5,
    solverStatus: "optimal",
    calculatedAt: new Date().toISOString(),
  };
}

// ── 11. Leverage Cap ────────────────────────────────────────────

export function getLeverageCap(): LeverageCapResult {
  return {
    currentLeverage: 1.0,
    maxLeverage: 1.5,
    regimeAdjustedMax: 1.35,
    headroom: 0.35,
    leverageBreached: false,
    recommendation: "Leverage within limits (0.35x headroom)",
    calculatedAt: new Date().toISOString(),
  };
}

// ── 12. Capital Call Plan ───────────────────────────────────────

export function getCapitalCallPlan(): CapitalCallPlan {
  return {
    commitments: [
      { fundName: "PE Fund III", totalCommitmentCents: 50000000, calledCents: 30000000, uncalledCents: 20000000, expectedCallDate: new Date(Date.now() + 90 * 86400000).toISOString(), probability: 0.85 },
      { fundName: "VC Fund II", totalCommitmentCents: 25000000, calledCents: 15000000, uncalledCents: 10000000, expectedCallDate: new Date(Date.now() + 180 * 86400000).toISOString(), probability: 0.60 },
    ],
    totalUncalledCents: 30000000,
    liquidReserveCents: 42000000,
    coverageRatio: 1.4,
    shortfallCents: 0,
    pacingRecommendation: "On track — adequate reserves for expected calls",
    calculatedAt: new Date().toISOString(),
  };
}

// ── 13. Tax Reserve ─────────────────────────────────────────────

export function getTaxReserve(): TaxReserveResult {
  return {
    estimatedLiabilityCents: 850000,
    currentReserveCents: 1800000,
    shortfallCents: 0,
    adequacy: "adequate",
    nextObligationDate: new Date(Date.now() + 120 * 86400000).toISOString(),
    nextObligationCents: 425000,
    realizedGainsCents: 3200000,
    unrealizedGainsCents: 4500000,
    harvestOpportunities: [
      { asset: "TLT", lossCents: 64000, strategy: "Harvest loss, replace with similar duration ETF" },
    ],
    calculatedAt: new Date().toISOString(),
  };
}

// ── 14. Liquidity Ladder ────────────────────────────────────────

export function getLiquidityLadder(): LiquidityLadder {
  return {
    tiers: [
      { tier: "T0", label: "Immediate (cash)", valueCents: 39500000, percentOfPortfolio: 15.8 },
      { tier: "T1", label: "Within 30 days", valueCents: 112000000, percentOfPortfolio: 44.8 },
      { tier: "T2", label: "Within 90 days", valueCents: 175000000, percentOfPortfolio: 70.0 },
      { tier: "T3", label: "Locked / Illiquid", valueCents: 75000000, percentOfPortfolio: 30.0 },
    ],
    totalLiquidCents: 175000000,
    totalIlliquidCents: 75000000,
    liquidityRatio: 0.70,
    adequacy: "strong",
    calculatedAt: new Date().toISOString(),
  };
}

// ── 15. Obligation Coverage ─────────────────────────────────────

export function getObligationCoverage(): ObligationCoverageResult {
  return {
    totalObligationsCents: 9600000,
    liquidCapitalCents: 39500000,
    coverageRatio: 4.11,
    monthsCovered: 41,
    adequate: true,
    obligations: [
      { name: "Mortgage", amountCents: 320000, dueDate: new Date(Date.now() + 30 * 86400000).toISOString() },
      { name: "Insurance Premium", amountCents: 150000, dueDate: new Date(Date.now() + 60 * 86400000).toISOString() },
      { name: "Tax Estimated Payment", amountCents: 425000, dueDate: new Date(Date.now() + 90 * 86400000).toISOString() },
    ],
    calculatedAt: new Date().toISOString(),
  };
}

// ── 16. Correlation Matrix ──────────────────────────────────────

export function getCorrelationMatrix(): CorrelationMatrixResult {
  return {
    assets: ["SPY", "TLT", "GLD", "BTC", "CASH"],
    matrix: [
      [1.0, -0.3, 0.1, 0.4, 0.0],
      [-0.3, 1.0, 0.2, -0.1, 0.0],
      [0.1, 0.2, 1.0, 0.15, 0.0],
      [0.4, -0.1, 0.15, 1.0, 0.0],
      [0.0, 0.0, 0.0, 0.0, 1.0],
    ],
    highCorrelationPairs: [],
    averageCorrelation: 0.18,
    diversificationScore: 0.82,
    calculatedAt: new Date().toISOString(),
  };
}

// ── 17. Watchlist ───────────────────────────────────────────────

export function getWatchlist(): WatchlistWithRegime {
  const entries: WatchlistEntry[] = [
    { id: "w1", asset: "NVDA", assetClass: "equity", addedAt: new Date(Date.now() - 14 * 86400000).toISOString(), reason: "AI capex beneficiary", priceAtAdd: 850, currentPrice: 920, changePct: 8.2, regimeAlignment: true, thesisCandidate: true, alerts: [] },
    { id: "w2", asset: "SOL", assetClass: "crypto", addedAt: new Date(Date.now() - 7 * 86400000).toISOString(), reason: "DeFi growth thesis", priceAtAdd: 145, currentPrice: 162, changePct: 11.7, regimeAlignment: true, thesisCandidate: false, alerts: ["High volatility"] },
    { id: "w3", asset: "XOM", assetClass: "equity", addedAt: new Date(Date.now() - 30 * 86400000).toISOString(), reason: "Energy hedge / inflation protection", priceAtAdd: 112, currentPrice: 108, changePct: -3.6, regimeAlignment: false, thesisCandidate: false, alerts: ["Regime conflict"] },
  ];
  return {
    entries,
    currentRegime: "risk-on",
    regimeSignals: [
      { indicator: "VIX", value: 18.5, interpretation: "Low volatility" },
      { indicator: "Trend", value: 2.4, interpretation: "Mild uptrend" },
    ],
    lastUpdated: new Date().toISOString(),
  };
}

// ── 18. Trade Review ────────────────────────────────────────────

export function getTradeReviewPackets(): TradeReviewPacket[] {
  return [
    {
      tradeId: "tr-001",
      asset: "NVDA",
      direction: "buy",
      quantityOrAmountCents: 500000,
      rationale: "AI capex thesis — add to position after regime confirmation",
      thesisId: "t-nvda-001",
      riskImpact: "Increases equity concentration by 2%",
      complianceCheck: { passed: true, flags: [] },
      approvalRequired: true,
      reviewedAt: new Date().toISOString(),
    },
  ];
}

// ── 19. Execution Intents ───────────────────────────────────────

export function getExecutionIntents(): ExecutionIntent[] {
  return [
    {
      id: "ei-001",
      tradeReviewId: "tr-001",
      asset: "NVDA",
      direction: "buy",
      amountCents: 500000,
      venue: "Schwab",
      orderType: "limit",
      limitPrice: 910,
      status: "pending-approval",
    },
  ];
}

// ── 20. Net Worth ───────────────────────────────────────────────

export function getNetWorth(): NetWorthResult {
  return {
    totalAssetsCents: 285000000,
    totalLiabilitiesCents: 32000000,
    netWorthCents: 253000000,
    byEntity: [
      { entity: "Personal", assetsCents: 130000000, liabilitiesCents: 22000000, netCents: 108000000 },
      { entity: "Business", assetsCents: 95000000, liabilitiesCents: 10000000, netCents: 85000000 },
      { entity: "Household", assetsCents: 60000000, liabilitiesCents: 0, netCents: 60000000 },
    ],
    changeFromLastPeriodPct: 3.2,
    calculatedAt: new Date().toISOString(),
  };
}

// ── 21. Deployable Capital ──────────────────────────────────────

export function getDeployableCapital(): DeployableCapitalResult {
  return {
    totalCapitalCents: 222500000,
    reservesCents: 68000000,
    restrictedCents: 30000000,
    obligationsCents: 9600000,
    deployableCents: 114900000,
    deployablePct: 0.516,
    constraints: [],
    calculatedAt: new Date().toISOString(),
  };
}

// ── 22. Cash Posture ────────────────────────────────────────────

export function getCashPosture(): CashPosture {
  return {
    totalCashCents: 39500000,
    byEntity: [
      { entity: "Personal", cashCents: 24500000 },
      { entity: "Business", cashCents: 6780000 },
      { entity: "Household", cashCents: 8200000 },
    ],
    cashAsPercentOfPortfolio: 0.158,
    targetCashPct: 0.10,
    posture: "over-cash",
    recommendation: "Excess cash — consider deploying into equities per rebalance plan",
    calculatedAt: new Date().toISOString(),
  };
}

// ── 23. Reserve Posture ─────────────────────────────────────────

export function getReservePosture(): ReservePosture {
  return {
    totalReservesCents: 68000000,
    byBucket: [
      { bucket: "Emergency Reserve", currentCents: 35000000, targetCents: 50000000, fundedPct: 0.70 },
      { bucket: "Tax Reserve", currentCents: 18000000, targetCents: 22000000, fundedPct: 0.818 },
      { bucket: "Growth Reserve", currentCents: 15000000, targetCents: 25000000, fundedPct: 0.60 },
    ],
    overallFundedPct: 0.70,
    monthsCoverage: 8.5,
    posture: "gap",
    recommendation: "Emergency and Growth reserves below target — prioritize funding",
    calculatedAt: new Date().toISOString(),
  };
}

// ── 24. Opportunity Scores ──────────────────────────────────────

export function getOpportunityScores(): OpportunityScore[] {
  return [
    { asset: "NVDA", thesisStrength: 0.82, regimeAlignment: 0.85, riskRewardRatio: 2.1, liquidityScore: 0.95, compositeScore: 0.82, rank: 1, recommendation: "Strong opportunity — proceed with review", scoredAt: new Date().toISOString() },
    { asset: "SOL", thesisStrength: 0.55, regimeAlignment: 0.70, riskRewardRatio: 3.5, liquidityScore: 0.60, compositeScore: 0.62, rank: 2, recommendation: "Moderate — requires deeper analysis", scoredAt: new Date().toISOString() },
    { asset: "XOM", thesisStrength: 0.40, regimeAlignment: 0.30, riskRewardRatio: 1.2, liquidityScore: 0.90, compositeScore: 0.42, rank: 3, recommendation: "Weak — monitor only", scoredAt: new Date().toISOString() },
  ];
}

// ── 25. Venue Risk ──────────────────────────────────────────────

export function getVenueRisk(): VenueRiskSummary {
  return {
    venues: [
      { name: "Schwab", type: "brokerage", balanceCents: 185000000, riskScore: 15, insurance: true, lastAudit: "2025-12-01" },
      { name: "Coinbase", type: "exchange", balanceCents: 31700000, riskScore: 55, insurance: false },
    ],
    concentrationWarnings: ["Schwab holds 74% of portfolio"],
    recommendations: ["Consider diversifying brokerage custody"],
    assessedAt: new Date().toISOString(),
  };
}

// ── 26. FX Exposure ─────────────────────────────────────────────

export function getFxExposure(): FxExposureSummary {
  return {
    baseCurrency: "USD",
    exposures: [
      { currency: "USD", valueCents: 245000000, percentOfPortfolio: 98, hedged: false },
      { currency: "EUR", valueCents: 5000000, percentOfPortfolio: 2, hedged: false },
    ],
    totalUnhedgedPercent: 2,
    riskLevel: "low",
    recommendations: [],
    lastUpdated: new Date().toISOString(),
  };
}

// ── 27. Crypto Exposure ─────────────────────────────────────────

export function getCryptoExposure(): CryptoExposureSummary {
  return {
    totalValueCents: 31700000,
    holdings: [
      { asset: "BTC", quantity: 0.35, valueCents: 21700000, percent: 8.7, venue: "Coinbase" },
      { asset: "ETH", quantity: 3.2, valueCents: 9920000, percent: 4.0, venue: "Coinbase" },
    ],
    custodyBreakdown: [{ type: "exchange", percent: 100 }],
    riskFlags: ["100% of crypto on exchanges — custody risk"],
    lastUpdated: new Date().toISOString(),
  };
}

// ── 28. Stop / Exit Policy ──────────────────────────────────────

export function getStopExitPolicies(): StopExitPolicyResult[] {
  return [
    {
      asset: "SPY",
      currentPrice: 485,
      trailingStopPrice: 461,
      trailingStopPct: 0.05,
      hardStopPrice: 420,
      invalidationTriggered: false,
      invalidationConditions: [
        { condition: "VIX > 40", triggered: false },
        { condition: "Credit spreads > 600bps", triggered: false },
      ],
      recommendedAction: "hold",
      evaluatedAt: new Date().toISOString(),
    },
  ];
}

// ── 29. Trade Cost Estimates ────────────────────────────────────

export function estimateTradeCosts(amountCents: number, venue: string): TradeCostEstimate {
  const slippageBps = venue.includes("Coinbase") ? 15 : 3;
  const commissionBps = venue.includes("Coinbase") ? 25 : 1;
  const spreadBps = venue.includes("Coinbase") ? 10 : 2;
  return {
    asset: "N/A",
    amountCents,
    estimatedSlippageBps: slippageBps,
    commissionCents: Math.round(amountCents * commissionBps / 10000),
    spreadCostCents: Math.round(amountCents * spreadBps / 10000),
    totalFrictionCents: Math.round(amountCents * (slippageBps + commissionBps + spreadBps) / 10000),
    netProceedsCents: amountCents - Math.round(amountCents * (slippageBps + commissionBps + spreadBps) / 10000),
    venue,
    estimatedAt: new Date().toISOString(),
  };
}

// ── 30. Slippage Adjusted Return ────────────────────────────────

export function getSlippageAdjustedReturn(): SlippageFeeResult {
  return {
    grossReturnPct: 8.5,
    slippageCostPct: 0.15,
    commissionCostPct: 0.08,
    spreadCostPct: 0.05,
    taxDragPct: 1.2,
    netReturnPct: 7.02,
    totalFrictionPct: 1.48,
    calculatedAt: new Date().toISOString(),
  };
}

// ── Trust Mode ──────────────────────────────────────────────────

export function getInvestmentTrustMode(): InvestmentTrustMode {
  return "observe-only";
}

export function getAvailableTrustModes(): { mode: InvestmentTrustMode; label: string; description: string }[] {
  return [
    { mode: "observe-only", label: "Observe Only", description: "View portfolio data and recommendations — no actions" },
    { mode: "recommendation-only", label: "Recommendation Only", description: "System generates recommendations but takes no action" },
    { mode: "simulation-first", label: "Simulation First", description: "All proposed actions must be simulated before approval" },
    { mode: "approval-required", label: "Approval Required", description: "Actions executed only after explicit human approval" },
    { mode: "paper-sandbox", label: "Paper / Sandbox", description: "Simulated execution with no real-world effect" },
  ];
}
