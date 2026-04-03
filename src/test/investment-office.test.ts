import { describe, it, expect } from "vitest";
import {
  buildCapitalMap, analyzePortfolioRisk, detectRegime, calculatePositionSize,
  runStressScenarios, evaluateThesis, volatilityTargetSize, drawdownFromPeak,
  computeRiskBudget, concentrationRisk, correlationMatrix, rollingCorrelation,
  computeLiquidityLadder, liquidityBuffer, reserveProtectionCheck, obligationCoverageRatio,
  computeLeverageCap, monteCarloStress, historicalReplayStress, computeRebalance,
  computeFactorRisk, computeMandateCompliance, computeRobustOptimization,
  computeStopExitPolicy, computeSlippageFeeAdjustedReturn, estimateTradeCost,
  computeTaxReserve, computeCapitalCallPlan, computeNetWorth, computeEntityCapitalSeparation,
  computeDeployableCapital, computeVenueRisk, computeFxExposure, computeCryptoExposure,
  computeSectorConcentration, computeGeographicConcentration, computeCashPosture,
  computeReservePosture, computeLiquidityPosture, computeOpportunityScore,
  computeThesisScore, buildCommitteePacket, generateProofArtifact,
  applyWatchlistRegimeOverlay, buildResearchContext, linkTradeToJournal,
  computeCustodyBreakdown,
  type Position, type CapitalBucket, type Thesis, type RegimeState,
} from "@/lib/domain-engines/investment-office";
import { evaluatePolicy, type PolicyContext } from "@/lib/core-services/policy-engine";
import { INVESTMENT_POLICY_RULES } from "@/lib/core-services/investment-policy-rules";

const POSITIONS: Position[] = [
  { id: "1", symbol: "SPY", name: "S&P 500", assetClass: "equity", quantity: 10, avgCostBasis: 400, currentPrice: 450, currency: "USD", venue: "Schwab", custodyType: "brokerage" },
  { id: "2", symbol: "BTC", name: "Bitcoin", assetClass: "crypto", quantity: 0.5, avgCostBasis: 30000, currentPrice: 60000, currency: "USD", venue: "Coinbase", custodyType: "exchange" },
  { id: "3", symbol: "CASH", name: "Cash", assetClass: "cash", quantity: 10000, avgCostBasis: 1, currentPrice: 1, currency: "USD", venue: "Schwab", custodyType: "brokerage" },
];

const BUCKETS: CapitalBucket[] = [
  { id: "1", name: "Checking", type: "personal-cash", balance: 10000, currency: "USD", entityOwner: "Personal", ringfenced: false },
  { id: "2", name: "Emergency", type: "reserve-emergency", balance: 20000, targetBalance: 30000, currency: "USD", entityOwner: "Personal", ringfenced: true },
  { id: "3", name: "Investing", type: "investing-capital", balance: 50000, currency: "USD", entityOwner: "Personal", ringfenced: false },
];

const REGIME: RegimeState = detectRegime({ vix: 18, sp500Change30d: 2 });

const THESIS: Thesis = {
  id: "t1", title: "Test", asset: "SPY", direction: "long", rationale: "Test",
  catalysts: ["A", "B"], invalidationConditions: ["X"], sizeLogic: "10%",
  regimeContext: "normal", confidence: 0.7, status: "active", createdAt: Date.now(),
  approvalStatus: "approved", proofIds: [],
};

describe("Investment Office — 47 Deterministic Engines", () => {
  it("E1: buildCapitalMap", () => {
    const r = buildCapitalMap(BUCKETS);
    expect(r.totalCapital).toBe(80000);
    expect(r.deployableCapital).toBe(50000);
    expect(r.reserveCapital).toBe(20000);
  });

  it("E2: analyzePortfolioRisk", () => {
    const r = analyzePortfolioRisk(POSITIONS, 20000);
    expect(r.totalValue).toBeGreaterThan(0);
    expect(r.concentrationRisk).toBeDefined();
  });

  it("E3: detectRegime", () => {
    const r = detectRegime({ vix: 40, correlationIndex: 0.9 });
    expect(r.volatility).toBe("extreme");
    expect(r.correlation).toBe("crisis");
  });

  it("E4: calculatePositionSize", () => {
    const r = calculatePositionSize({ portfolioValue: 100000, riskBudgetPct: 0.02, entryPrice: 100, stopLossPrice: 95 });
    expect(r.shares).toBeGreaterThan(0);
    expect(r.acceptable).toBe(true);
  });

  it("E5: volatilityTargetSize", () => {
    const r = volatilityTargetSize({ portfolioValue: 100000, targetVolPct: 0.10, assetVolPct: 0.20 });
    expect(r.positionPct).toBeCloseTo(0.25, 1); // capped by maxPositionPct default 0.25
  });

  it("E6: drawdownFromPeak", () => {
    expect(drawdownFromPeak(100, 80).drawdownPct).toBeCloseTo(0.2);
    expect(drawdownFromPeak(100, 80).severity).toBe("severe");
  });

  it("E7: computeRiskBudget", () => {
    const r = computeRiskBudget({ totalBudget: 1, allocations: [{ name: "EQ", usedBudget: 0.6, limit: 0.5 }] });
    expect(r.breaches.length).toBe(1);
  });

  it("E8: concentrationRisk", () => {
    const r = concentrationRisk(POSITIONS);
    expect(r.overallRisk).toBeDefined();
  });

  it("E9: correlationMatrix", () => {
    const r = correlationMatrix({ A: [0.01, -0.02, 0.03], B: [0.02, -0.01, 0.02] });
    expect(r.matrix.length).toBe(2);
    expect(r.assets).toEqual(["A", "B"]);
  });

  it("E10: rollingCorrelation", () => {
    const r = rollingCorrelation([0.01, 0.02, -0.01, 0.03, 0.01], [0.02, 0.01, -0.02, 0.02, 0.01], 3);
    expect(r.correlations.length).toBeGreaterThan(0);
  });

  it("E11: computeLiquidityLadder", () => {
    const r = computeLiquidityLadder(POSITIONS, BUCKETS);
    expect(r.immediate).toBeGreaterThan(0);
    expect(r.adequacy).toBeDefined();
  });

  it("E12: liquidityBuffer", () => {
    const r = liquidityBuffer(50000, 8000, 6);
    expect(r.adequate).toBe(true);
  });

  it("E13: reserveProtectionCheck", () => {
    const r = reserveProtectionCheck(20000, 30000);
    expect(r.canAbsorb).toBe(false);
    expect(r.gapCents).toBe(10000);
  });

  it("E14: obligationCoverageRatio", () => {
    const r = obligationCoverageRatio([{ name: "Rent", amountCents: 200000, dueDate: "2025-01-01", recurring: true }], 500000);
    expect(r.coverageRatio).toBe(2.5);
  });

  it("E15: computeLeverageCap", () => {
    const r = computeLeverageCap({ currentLeverage: 1.2, policyMaxLeverage: 1.5, regime: REGIME });
    expect(r.breached).toBe(false);
  });

  it("E16: runStressScenarios", () => {
    const r = runStressScenarios(POSITIONS, 20000);
    expect(r.length).toBe(5);
  });

  it("E17: monteCarloStress", () => {
    const r = monteCarloStress({ portfolioValue: 100000, expectedReturnPct: 0.08, volatilityPct: 0.15, days: 252, paths: 100 });
    expect(r.probabilityOfLoss).toBeGreaterThanOrEqual(0);
    expect(r.probabilityOfLoss).toBeLessThanOrEqual(1);
  });

  it("E18: historicalReplayStress", () => {
    const r = historicalReplayStress({ portfolioValue: 100000, dailyReturns: [-0.03, -0.05, 0.02, -0.01, 0.04], scenarioName: "test", period: "test" });
    expect(r.finalValue).toBeGreaterThan(0);
  });

  it("E19: computeRebalance", () => {
    const r = computeRebalance(POSITIONS, [{ assetClass: "equity", targetPct: 0.6 }, { assetClass: "crypto", targetPct: 0.1 }]);
    expect(r.recommendations.length).toBe(2);
  });

  it("E20: computeFactorRisk", () => {
    const r = computeFactorRisk([{ name: "Market", beta: 1.0, weight: 0.6 }, { name: "Size", beta: 0.3, weight: 0.4 }]);
    expect(r.dominantFactor).toBe("Market");
  });

  it("E21: computeMandateCompliance", () => {
    const r = computeMandateCompliance(POSITIONS, [{ rule: "Max single 15%", field: "single-position", operator: "max", limitPct: 0.15 }]);
    expect(r.overallCompliant).toBeDefined();
  });

  it("E22: computeRobustOptimization", () => {
    const r = computeRobustOptimization({ assetClasses: [{ name: "EQ", expectedReturn: 0.08, volatility: 0.15, weight: 0.6 }, { name: "FI", expectedReturn: 0.03, volatility: 0.05, weight: 0.4 }] });
    expect(r.optimalWeights.length).toBe(2);
    expect(r.shrinkageApplied).toBe(true);
  });

  it("E23: computeStopExitPolicy", () => {
    const r = computeStopExitPolicy({ asset: "SPY", currentPrice: 450, peakPrice: 500, trailingStopPct: 0.1, hardStopPrice: 400, invalidationConditions: [] });
    expect(r.trailingStopPrice).toBe(450);
    expect(r.action).toBe("exit-partial");
  });

  it("E24: computeSlippageFeeAdjustedReturn", () => {
    const r = computeSlippageFeeAdjustedReturn({ grossReturnPct: 0.10, slippageBps: 10, commissionBps: 5, spreadBps: 5 });
    expect(r.netReturnPct).toBeLessThan(0.10);
  });

  it("E25: estimateTradeCost", () => {
    const r = estimateTradeCost({ amountCents: 100000, slippageBps: 10, commissionBps: 5, spreadBps: 5 });
    expect(r.totalFrictionCents).toBe(200);
  });

  it("E26: computeTaxReserve", () => {
    const r = computeTaxReserve({ realizedGainsCents: 100000, unrealizedGainsCents: 50000, shortTermRate: 0.35, longTermRate: 0.15, currentReserveCents: 30000 });
    expect(r.adequacy).toBeDefined();
  });

  it("E27: computeCapitalCallPlan", () => {
    const r = computeCapitalCallPlan({ commitments: [{ fundName: "PE", totalCents: 100000, calledCents: 60000, expectedCallDate: "2025-06-01", probability: 0.8 }], liquidReserveCents: 50000 });
    expect(r.totalUncalledCents).toBe(40000);
  });

  it("E28: computeNetWorth", () => {
    const r = computeNetWorth([{ entity: "P", valueCents: 100000 }], [{ entity: "P", valueCents: 30000 }]);
    expect(r.netWorth).toBe(70000);
  });

  it("E29: computeEntityCapitalSeparation", () => {
    const r = computeEntityCapitalSeparation(BUCKETS);
    expect(r.entities.length).toBe(1);
  });

  it("E30: computeDeployableCapital", () => {
    const r = computeDeployableCapital(BUCKETS, []);
    expect(r.deployable).toBeGreaterThan(0);
  });

  it("E31: computeVenueRisk", () => {
    const r = computeVenueRisk(POSITIONS);
    expect(r.venues.length).toBe(2);
  });

  it("E32: computeFxExposure", () => {
    const r = computeFxExposure(POSITIONS);
    expect(r.foreignPct).toBe(0);
  });

  it("E33: computeCryptoExposure", () => {
    const r = computeCryptoExposure(POSITIONS);
    expect(r.holdings.length).toBe(1);
  });

  it("E34: computeSectorConcentration", () => {
    const r = computeSectorConcentration(POSITIONS);
    expect(r.sectors.length).toBeGreaterThan(0);
  });

  it("E35: computeGeographicConcentration", () => {
    const r = computeGeographicConcentration(POSITIONS);
    expect(r.regions.length).toBeGreaterThan(0);
  });

  it("E36: computeCashPosture", () => {
    const r = computeCashPosture(POSITIONS, BUCKETS);
    expect(r.posture).toBeDefined();
  });

  it("E37: computeReservePosture", () => {
    const r = computeReservePosture(BUCKETS);
    expect(r.posture).toBeDefined();
  });

  it("E38: computeLiquidityPosture", () => {
    const r = computeLiquidityPosture(POSITIONS, BUCKETS);
    expect(r.posture).toBeDefined();
  });

  it("E39: computeOpportunityScore", () => {
    const r = computeOpportunityScore({ thesisStrength: 0.8, regimeAlignment: 0.7, riskRewardRatio: 2, liquidityScore: 0.9 });
    expect(r.compositeScore).toBeGreaterThan(0.5);
  });

  it("E40: computeThesisScore", () => {
    const r = computeThesisScore(THESIS, REGIME);
    expect(r.score).toBeGreaterThan(0);
  });

  it("E41: evaluateThesis", () => {
    const r = evaluateThesis(THESIS, REGIME);
    expect(r.stillValid).toBe(true);
  });

  it("E42: buildCommitteePacket", () => {
    const r = buildCommitteePacket({ positions: POSITIONS, buckets: BUCKETS, theses: [THESIS], regime: REGIME });
    expect(r.recommendations).toBeDefined();
  });

  it("E43: generateProofArtifact", () => {
    const r = generateProofArtifact({ decisionType: "trade", summary: "test", inputs: {}, outcome: "ok" });
    expect(r.hash.length).toBeGreaterThan(0);
  });

  it("E44: applyWatchlistRegimeOverlay", () => {
    const r = applyWatchlistRegimeOverlay([{ asset: "SPY", assetClass: "equity", direction: "long" }], REGIME);
    expect(r.entries.length).toBe(1);
  });

  it("E45: buildResearchContext", () => {
    const r = buildResearchContext({ asset: "SPY", sources: [{ title: "S", confidence: 0.8, date: "2025-01-01" }], contradictions: [] });
    expect(r.qualityScore).toBeGreaterThan(0);
  });

  it("E46: linkTradeToJournal", () => {
    const r = linkTradeToJournal({ tradeId: "t1", proofId: "p1", executionPrice: 100, direction: "buy" });
    expect(r.journalEntry.tradeId).toBe("t1");
  });

  it("E47: computeCustodyBreakdown", () => {
    const r = computeCustodyBreakdown(POSITIONS);
    expect(r.breakdown.length).toBe(2);
  });
});

describe("Investment Policy Rules — 16 Rules", () => {
  it("has exactly 16 rules", () => {
    expect(INVESTMENT_POLICY_RULES.length).toBe(16);
  });

  it("all rules have unique IDs", () => {
    const ids = INVESTMENT_POLICY_RULES.map(r => r.id);
    expect(new Set(ids).size).toBe(16);
  });

  it("kill switch blocks trades", () => {
    const ctx: PolicyContext = { domain: "investment", killSwitchActive: true, capabilityId: "trade-execute" };
    const r = evaluatePolicy(ctx);
    expect(r.effect).toBe("deny");
    expect(r.matchedRule?.id).toBe("inv-kill-switch");
  });

  it("trade execution requires approval", () => {
    const ctx: PolicyContext = { domain: "investment", capabilityId: "trade-review" };
    const r = evaluatePolicy(ctx);
    expect(["require-approval", "require-simulation"]).toContain(r.effect);
  });

  it("large trades require dual approval", () => {
    const ctx: PolicyContext = { domain: "investment", capabilityId: "trade-execute", amount: 15000, isSimulation: true };
    const r = evaluatePolicy(ctx);
    expect(r.effect).toBe("require-dual-approval");
  });

  it("crypto requires approval", () => {
    const ctx: PolicyContext = { domain: "investment", assetClass: "crypto", capabilityId: "position-open" };
    const r = evaluatePolicy(ctx);
    expect(r.effect).toBe("require-approval");
  });

  it("regime crisis blocks non-protective trades", () => {
    const ctx: PolicyContext = { domain: "investment", regimeCrisis: true, isProtectiveTrade: false, capabilityId: "open" };
    const r = evaluatePolicy(ctx);
    expect(r.effect).toBe("deny");
  });

  it("non-investment domain ignores investment rules", () => {
    const ctx: PolicyContext = { domain: "finance", amount: 100, capabilityId: "read" };
    const r = evaluatePolicy(ctx);
    expect(r.matchedRule?.id?.startsWith("inv-")).toBeFalsy();
  });
});
