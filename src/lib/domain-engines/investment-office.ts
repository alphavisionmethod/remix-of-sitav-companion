// ═══════════════════════════════════════════════════════════════
// SITA OS — Investment Office / Family Office Engine
// 47 deterministic engines — pure functions, no LLM, no side effects
// Canonical contracts: DomainId, ConfidenceMetadata from contracts
// ═══════════════════════════════════════════════════════════════

import type { DomainId, ConfidenceMetadata } from "@/packages/contracts";

export type { DomainId as InvestmentDomainId, ConfidenceMetadata as InvestmentConfidence };

// ── Types ────────────────────────────────────────────────────────

export interface Position {
  id: string;
  symbol: string;
  name: string;
  assetClass: "equity" | "fixed-income" | "commodity" | "crypto" | "forex" | "real-estate" | "cash" | "alternative";
  quantity: number;
  avgCostBasis: number;
  currentPrice: number;
  currency: string;
  venue: string;
  custodyType: "brokerage" | "exchange" | "wallet" | "bank" | "self-custody";
  sector?: string;
  geography?: string;
  dailyVolatility?: number;
  dailyVolume?: number;
  beta?: number;
}

export interface CapitalBucket {
  id: string;
  name: string;
  type: "personal-cash" | "household-cash" | "business-cash" | "reserve-emergency" | "reserve-operating" | "reserve-tax" | "reserve-growth" | "investing-capital" | "sinking-fund" | "restricted" | "deployable";
  balance: number;
  targetBalance?: number;
  currency: string;
  entityOwner: string;
  ringfenced: boolean;
}

export interface Thesis {
  id: string;
  title: string;
  asset: string;
  direction: "long" | "short" | "neutral" | "hedge";
  rationale: string;
  catalysts: string[];
  invalidationConditions: string[];
  sizeLogic: string;
  regimeContext: string;
  confidence: number;
  status: "active" | "invalidated" | "realized" | "expired" | "draft";
  createdAt: number;
  reviewedAt?: number;
  approvalStatus: "pending" | "approved" | "rejected";
  proofIds: string[];
}

export interface RegimeState {
  volatility: "compressed" | "normal" | "elevated" | "extreme";
  trend: "strong-up" | "up" | "sideways" | "down" | "strong-down";
  liquidity: "abundant" | "normal" | "tightening" | "stressed";
  correlation: "low" | "normal" | "high" | "crisis";
  riskAppetite: "risk-on" | "neutral" | "risk-off" | "flight-to-safety";
  macroEvent: "none" | "data-release" | "policy-meeting" | "geopolitical" | "crisis";
  instability: "stable" | "fragile" | "dislocating" | "crisis";
  timestamp: number;
  confidence: number;
  dataFreshness: "live" | "delayed" | "stale" | "unavailable";
}

export interface PortfolioRiskMetrics {
  totalValue: number;
  totalCostBasis: number;
  unrealizedPnL: number;
  unrealizedPnLPct: number;
  largestPosition: { symbol: string; pct: number };
  concentrationRisk: "low" | "moderate" | "high" | "critical";
  assetClassExposure: Record<string, number>;
  currencyExposure: Record<string, number>;
  venueExposure: Record<string, number>;
  drawdownFromPeak: number;
  reserveCoverage: number;
  riskBudgetUsed: number;
  cashPct: number;
}

export interface StressScenario {
  id: string;
  name: string;
  description: string;
  shocks: Record<string, number>;
  portfolioImpact: number;
  portfolioImpactPct: number;
  breachesReserve: boolean;
  breachesRiskBudget: boolean;
}

export interface Obligation {
  name: string;
  amountCents: number;
  dueDate: string;
  recurring: boolean;
}

export interface MandateRule {
  rule: string;
  field: "assetClass" | "sector" | "geography" | "single-position" | "leverage" | "cash-minimum";
  operator: "max" | "min" | "eq";
  limitPct: number;
}

export interface FactorExposureInput {
  name: string;
  beta: number;
  weight: number;
}

// ═══════════════════════════════════════════════════════════════
// ENGINE 1: Capital Map
// ═══════════════════════════════════════════════════════════════

export function buildCapitalMap(buckets: CapitalBucket[]): {
  totalCapital: number;
  deployableCapital: number;
  restrictedCapital: number;
  reserveCapital: number;
  investingCapital: number;
  cashPositions: number;
  byEntity: Record<string, number>;
  reserveCoverageMonths: number;
  fundingGaps: { bucket: string; shortfall: number }[];
} {
  const totalCapital = buckets.reduce((s, b) => s + b.balance, 0);
  const deployableCapital = buckets.filter(b => b.type === "deployable" || b.type === "investing-capital").reduce((s, b) => s + b.balance, 0);
  const restrictedCapital = buckets.filter(b => b.ringfenced || b.type === "restricted").reduce((s, b) => s + b.balance, 0);
  const reserveCapital = buckets.filter(b => b.type.startsWith("reserve-")).reduce((s, b) => s + b.balance, 0);
  const investingCapital = buckets.filter(b => b.type === "investing-capital").reduce((s, b) => s + b.balance, 0);
  const cashPositions = buckets.filter(b => b.type.includes("cash")).reduce((s, b) => s + b.balance, 0);
  const byEntity: Record<string, number> = {};
  buckets.forEach(b => { byEntity[b.entityOwner] = (byEntity[b.entityOwner] ?? 0) + b.balance; });
  const monthlyObligations = 8000;
  const reserveCoverageMonths = reserveCapital / monthlyObligations;
  const fundingGaps = buckets
    .filter(b => b.targetBalance && b.balance < b.targetBalance * 0.8)
    .map(b => ({ bucket: b.name, shortfall: (b.targetBalance ?? 0) - b.balance }));
  return { totalCapital, deployableCapital, restrictedCapital, reserveCapital, investingCapital, cashPositions, byEntity, reserveCoverageMonths, fundingGaps };
}

// ═══════════════════════════════════════════════════════════════
// ENGINE 2: Portfolio Risk Analysis
// ═══════════════════════════════════════════════════════════════

export function analyzePortfolioRisk(positions: Position[], reserves: number, monthlyObligations: number = 8000): PortfolioRiskMetrics {
  const totalValue = positions.reduce((s, p) => s + p.quantity * p.currentPrice, 0);
  const totalCostBasis = positions.reduce((s, p) => s + p.quantity * p.avgCostBasis, 0);
  const unrealizedPnL = totalValue - totalCostBasis;
  const unrealizedPnLPct = totalCostBasis > 0 ? unrealizedPnL / totalCostBasis : 0;
  const positionValues = positions.map(p => ({ symbol: p.symbol, value: p.quantity * p.currentPrice }));
  positionValues.sort((a, b) => b.value - a.value);
  const largestPct = totalValue > 0 ? (positionValues[0]?.value ?? 0) / totalValue : 0;
  const concentrationRisk: PortfolioRiskMetrics["concentrationRisk"] =
    largestPct > 0.4 ? "critical" : largestPct > 0.25 ? "high" : largestPct > 0.15 ? "moderate" : "low";
  const assetClassExposure: Record<string, number> = {};
  positions.forEach(p => { const v = p.quantity * p.currentPrice; assetClassExposure[p.assetClass] = (assetClassExposure[p.assetClass] ?? 0) + v; });
  const currencyExposure: Record<string, number> = {};
  positions.forEach(p => { const v = p.quantity * p.currentPrice; currencyExposure[p.currency] = (currencyExposure[p.currency] ?? 0) + v; });
  const venueExposure: Record<string, number> = {};
  positions.forEach(p => { const v = p.quantity * p.currentPrice; venueExposure[p.venue] = (venueExposure[p.venue] ?? 0) + v; });
  const cashValue = positions.filter(p => p.assetClass === "cash").reduce((s, p) => s + p.quantity * p.currentPrice, 0);
  const cashPct = totalValue > 0 ? cashValue / totalValue : 0;
  const reserveCoverage = monthlyObligations > 0 ? reserves / monthlyObligations : 0;
  return {
    totalValue, totalCostBasis, unrealizedPnL, unrealizedPnLPct,
    largestPosition: { symbol: positionValues[0]?.symbol ?? "—", pct: largestPct },
    concentrationRisk, assetClassExposure, currencyExposure, venueExposure,
    drawdownFromPeak: 0, reserveCoverage, riskBudgetUsed: Math.min(1, (1 - cashPct) * 0.8), cashPct,
  };
}

// ═══════════════════════════════════════════════════════════════
// ENGINE 3: Regime Detection
// ═══════════════════════════════════════════════════════════════

export function detectRegime(params: {
  vix?: number; sp500Change30d?: number; yieldSpread?: number;
  correlationIndex?: number; pendingEvents?: string[];
}): RegimeState {
  const { vix = 18, sp500Change30d = 0, yieldSpread = 1.5, correlationIndex = 0.4, pendingEvents = [] } = params;
  const volatility: RegimeState["volatility"] = vix > 35 ? "extreme" : vix > 25 ? "elevated" : vix > 15 ? "normal" : "compressed";
  const trend: RegimeState["trend"] = sp500Change30d > 5 ? "strong-up" : sp500Change30d > 1 ? "up" : sp500Change30d < -5 ? "strong-down" : sp500Change30d < -1 ? "down" : "sideways";
  const liquidity: RegimeState["liquidity"] = yieldSpread < 0 ? "stressed" : yieldSpread < 0.5 ? "tightening" : yieldSpread < 2 ? "normal" : "abundant";
  const correlation: RegimeState["correlation"] = correlationIndex > 0.8 ? "crisis" : correlationIndex > 0.6 ? "high" : correlationIndex > 0.3 ? "normal" : "low";
  const riskAppetite: RegimeState["riskAppetite"] =
    volatility === "extreme" || correlation === "crisis" ? "flight-to-safety" :
    volatility === "elevated" ? "risk-off" :
    trend === "strong-up" && volatility === "compressed" ? "risk-on" : "neutral";
  const macroEvent: RegimeState["macroEvent"] =
    pendingEvents.some(e => e.includes("crisis")) ? "crisis" :
    pendingEvents.some(e => e.includes("fed") || e.includes("fomc")) ? "policy-meeting" :
    pendingEvents.some(e => e.includes("nfp") || e.includes("cpi")) ? "data-release" :
    pendingEvents.length > 0 ? "geopolitical" : "none";
  const instability: RegimeState["instability"] =
    volatility === "extreme" && correlation === "crisis" ? "crisis" :
    volatility === "extreme" || correlation === "high" ? "dislocating" :
    volatility === "elevated" ? "fragile" : "stable";
  const confidence = volatility === "extreme" ? 0.5 : volatility === "elevated" ? 0.65 : 0.8;
  return { volatility, trend, liquidity, correlation, riskAppetite, macroEvent, instability, timestamp: Date.now(), confidence, dataFreshness: "delayed" };
}

// ═══════════════════════════════════════════════════════════════
// ENGINE 4: Position Sizing (risk-budget based)
// ═══════════════════════════════════════════════════════════════

export function calculatePositionSize(params: {
  portfolioValue: number; riskBudgetPct: number; entryPrice: number;
  stopLossPrice: number; maxPositionPct?: number;
}): { shares: number; dollarRisk: number; positionValue: number; positionPct: number; acceptable: boolean; reason?: string } {
  const { portfolioValue, riskBudgetPct, entryPrice, stopLossPrice, maxPositionPct = 0.1 } = params;
  const riskPerShare = Math.abs(entryPrice - stopLossPrice);
  if (riskPerShare <= 0) return { shares: 0, dollarRisk: 0, positionValue: 0, positionPct: 0, acceptable: false, reason: "Stop loss cannot equal entry price" };
  const dollarRiskBudget = portfolioValue * riskBudgetPct;
  let shares = Math.floor(dollarRiskBudget / riskPerShare);
  let positionValue = shares * entryPrice;
  let positionPct = positionValue / portfolioValue;
  if (positionPct > maxPositionPct) {
    shares = Math.floor((portfolioValue * maxPositionPct) / entryPrice);
    positionValue = shares * entryPrice;
    positionPct = positionValue / portfolioValue;
  }
  const dollarRisk = shares * riskPerShare;
  const acceptable = shares > 0 && positionPct <= maxPositionPct && dollarRisk <= dollarRiskBudget;
  return { shares, dollarRisk, positionValue, positionPct, acceptable, reason: acceptable ? undefined : "Position exceeds risk budget" };
}

// ═══════════════════════════════════════════════════════════════
// ENGINE 5: Volatility Target Position Sizing
// ═══════════════════════════════════════════════════════════════

export function volatilityTargetSize(params: {
  portfolioValue: number; targetVolPct: number; assetVolPct: number;
  maxPositionPct?: number;
}): { positionValue: number; positionPct: number; shares?: number; acceptable: boolean } {
  const { portfolioValue, targetVolPct, assetVolPct, maxPositionPct = 0.25 } = params;
  if (assetVolPct <= 0) return { positionValue: 0, positionPct: 0, acceptable: false };
  const rawPct = targetVolPct / assetVolPct;
  const cappedPct = Math.min(rawPct, maxPositionPct);
  const positionValue = portfolioValue * cappedPct;
  return { positionValue, positionPct: cappedPct, acceptable: cappedPct > 0 };
}

// ═══════════════════════════════════════════════════════════════
// ENGINE 6: Drawdown From Peak
// ═══════════════════════════════════════════════════════════════

export function drawdownFromPeak(peakValue: number, currentValue: number): { drawdownPct: number; drawdownDollars: number; severity: "none" | "mild" | "moderate" | "severe" | "extreme" } {
  if (peakValue <= 0) return { drawdownPct: 0, drawdownDollars: 0, severity: "none" };
  const dd = (peakValue - currentValue) / peakValue;
  const severity = dd <= 0 ? "none" : dd < 0.05 ? "mild" : dd < 0.15 ? "moderate" : dd < 0.3 ? "severe" : "extreme";
  return { drawdownPct: Math.max(0, dd), drawdownDollars: Math.max(0, peakValue - currentValue), severity };
}

// ═══════════════════════════════════════════════════════════════
// ENGINE 7: Risk Budget Allocation
// ═══════════════════════════════════════════════════════════════

export function computeRiskBudget(params: {
  totalBudget: number; allocations: { name: string; usedBudget: number; limit: number }[];
}): { totalUsed: number; remaining: number; utilization: number; breaches: string[]; recommendations: string[] } {
  const totalUsed = params.allocations.reduce((s, a) => s + a.usedBudget, 0);
  const remaining = params.totalBudget - totalUsed;
  const utilization = params.totalBudget > 0 ? totalUsed / params.totalBudget : 0;
  const breaches = params.allocations.filter(a => a.usedBudget > a.limit).map(a => `${a.name} exceeds limit (${a.usedBudget.toFixed(2)} > ${a.limit.toFixed(2)})`);
  const recommendations: string[] = [];
  if (utilization > 0.9) recommendations.push("Risk budget >90% utilized — reduce exposure");
  if (utilization < 0.3) recommendations.push("Risk budget underutilized — opportunity to deploy");
  return { totalUsed, remaining, utilization, breaches, recommendations };
}

// ═══════════════════════════════════════════════════════════════
// ENGINE 8: Concentration Risk
// ═══════════════════════════════════════════════════════════════

export function concentrationRisk(positions: Position[], thresholds: { single: number; sector: number; geography: number } = { single: 0.15, sector: 0.3, geography: 0.5 }): {
  singlePositionRisks: { symbol: string; pct: number; breached: boolean }[];
  sectorRisks: { sector: string; pct: number; breached: boolean }[];
  geographyRisks: { geography: string; pct: number; breached: boolean }[];
  overallRisk: "low" | "moderate" | "high" | "critical";
} {
  const totalValue = positions.reduce((s, p) => s + p.quantity * p.currentPrice, 0);
  if (totalValue <= 0) return { singlePositionRisks: [], sectorRisks: [], geographyRisks: [], overallRisk: "low" };

  const singlePositionRisks = positions.map(p => {
    const pct = (p.quantity * p.currentPrice) / totalValue;
    return { symbol: p.symbol, pct, breached: pct > thresholds.single };
  }).sort((a, b) => b.pct - a.pct);

  const sectorMap: Record<string, number> = {};
  positions.forEach(p => { sectorMap[p.sector ?? p.assetClass] = (sectorMap[p.sector ?? p.assetClass] ?? 0) + (p.quantity * p.currentPrice) / totalValue; });
  const sectorRisks = Object.entries(sectorMap).map(([sector, pct]) => ({ sector, pct, breached: pct > thresholds.sector })).sort((a, b) => b.pct - a.pct);

  const geoMap: Record<string, number> = {};
  positions.forEach(p => { geoMap[p.geography ?? "Unknown"] = (geoMap[p.geography ?? "Unknown"] ?? 0) + (p.quantity * p.currentPrice) / totalValue; });
  const geographyRisks = Object.entries(geoMap).map(([geography, pct]) => ({ geography, pct, breached: pct > thresholds.geography })).sort((a, b) => b.pct - a.pct);

  const breachCount = singlePositionRisks.filter(r => r.breached).length + sectorRisks.filter(r => r.breached).length + geographyRisks.filter(r => r.breached).length;
  const overallRisk = breachCount >= 3 ? "critical" : breachCount >= 2 ? "high" : breachCount >= 1 ? "moderate" : "low";
  return { singlePositionRisks, sectorRisks, geographyRisks, overallRisk };
}

// ═══════════════════════════════════════════════════════════════
// ENGINE 9: Correlation Matrix
// ═══════════════════════════════════════════════════════════════

export function correlationMatrix(returns: Record<string, number[]>): {
  assets: string[]; matrix: number[][]; highPairs: { a: string; b: string; corr: number }[]; avgCorrelation: number; diversificationScore: number;
} {
  const assets = Object.keys(returns);
  const n = assets.length;
  const matrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  const highPairs: { a: string; b: string; corr: number }[] = [];
  let corrSum = 0;
  let corrCount = 0;

  for (let i = 0; i < n; i++) {
    matrix[i][i] = 1;
    for (let j = i + 1; j < n; j++) {
      const r1 = returns[assets[i]];
      const r2 = returns[assets[j]];
      const len = Math.min(r1.length, r2.length);
      if (len < 2) { matrix[i][j] = 0; matrix[j][i] = 0; continue; }
      const m1 = r1.slice(0, len).reduce((s, v) => s + v, 0) / len;
      const m2 = r2.slice(0, len).reduce((s, v) => s + v, 0) / len;
      let cov = 0, v1 = 0, v2 = 0;
      for (let k = 0; k < len; k++) {
        const d1 = r1[k] - m1, d2 = r2[k] - m2;
        cov += d1 * d2; v1 += d1 * d1; v2 += d2 * d2;
      }
      const corr = v1 > 0 && v2 > 0 ? cov / Math.sqrt(v1 * v2) : 0;
      matrix[i][j] = corr; matrix[j][i] = corr;
      corrSum += Math.abs(corr); corrCount++;
      if (Math.abs(corr) > 0.7) highPairs.push({ a: assets[i], b: assets[j], corr });
    }
  }
  const avgCorrelation = corrCount > 0 ? corrSum / corrCount : 0;
  const diversificationScore = Math.max(0, 1 - avgCorrelation);
  return { assets, matrix, highPairs, avgCorrelation, diversificationScore };
}

// ═══════════════════════════════════════════════════════════════
// ENGINE 10: Rolling Correlation
// ═══════════════════════════════════════════════════════════════

export function rollingCorrelation(returns1: number[], returns2: number[], windowSize: number = 30): { correlations: number[]; current: number; trend: "increasing" | "stable" | "decreasing" } {
  const correlations: number[] = [];
  for (let i = windowSize; i <= returns1.length && i <= returns2.length; i++) {
    const r1 = returns1.slice(i - windowSize, i);
    const r2 = returns2.slice(i - windowSize, i);
    const m1 = r1.reduce((s, v) => s + v, 0) / windowSize;
    const m2 = r2.reduce((s, v) => s + v, 0) / windowSize;
    let cov = 0, v1 = 0, v2 = 0;
    for (let k = 0; k < windowSize; k++) {
      const d1 = r1[k] - m1, d2 = r2[k] - m2;
      cov += d1 * d2; v1 += d1 * d1; v2 += d2 * d2;
    }
    correlations.push(v1 > 0 && v2 > 0 ? cov / Math.sqrt(v1 * v2) : 0);
  }
  const current = correlations[correlations.length - 1] ?? 0;
  const prev = correlations[Math.max(0, correlations.length - 6)] ?? 0;
  const trend = current - prev > 0.1 ? "increasing" : current - prev < -0.1 ? "decreasing" : "stable";
  return { correlations, current, trend };
}

// ═══════════════════════════════════════════════════════════════
// ENGINE 11: Liquidity Ladder
// ═══════════════════════════════════════════════════════════════

export function computeLiquidityLadder(positions: Position[], cashBuckets: CapitalBucket[]): {
  immediate: number; within30d: number; within90d: number; locked: number; total: number; ratio: number;
  adequacy: "strong" | "adequate" | "tight" | "stressed";
} {
  const cashTotal = cashBuckets.reduce((s, b) => s + b.balance, 0);
  const liquid = positions.filter(p => ["equity", "forex", "cash"].includes(p.assetClass)).reduce((s, p) => s + p.quantity * p.currentPrice, 0);
  const semi = positions.filter(p => ["fixed-income", "commodity"].includes(p.assetClass)).reduce((s, p) => s + p.quantity * p.currentPrice, 0);
  const illiquid = positions.filter(p => ["real-estate", "alternative"].includes(p.assetClass)).reduce((s, p) => s + p.quantity * p.currentPrice, 0);
  const crypto = positions.filter(p => p.assetClass === "crypto").reduce((s, p) => s + p.quantity * p.currentPrice, 0);

  const immediate = cashTotal + positions.filter(p => p.assetClass === "cash").reduce((s, p) => s + p.quantity * p.currentPrice, 0);
  const within30d = immediate + liquid + crypto;
  const within90d = within30d + semi;
  const locked = illiquid;
  const total = within90d + locked;
  const ratio = total > 0 ? within30d / total : 0;
  const adequacy = ratio > 0.5 ? "strong" : ratio > 0.3 ? "adequate" : ratio > 0.15 ? "tight" : "stressed";
  return { immediate, within30d, within90d, locked, total, ratio, adequacy };
}

// ═══════════════════════════════════════════════════════════════
// ENGINE 12: Liquidity Buffer Check
// ═══════════════════════════════════════════════════════════════

export function liquidityBuffer(liquidCash: number, monthlyBurn: number, minimumMonths: number = 6): {
  monthsCovered: number; adequate: boolean; shortfall: number; recommendation: string;
} {
  const monthsCovered = monthlyBurn > 0 ? liquidCash / monthlyBurn : Infinity;
  const adequate = monthsCovered >= minimumMonths;
  const shortfall = adequate ? 0 : (minimumMonths - monthsCovered) * monthlyBurn;
  const recommendation = adequate ? "Liquidity buffer adequate" : `Need $${Math.round(shortfall).toLocaleString()} more to reach ${minimumMonths}-month buffer`;
  return { monthsCovered, adequate, shortfall, recommendation };
}

// ═══════════════════════════════════════════════════════════════
// ENGINE 13: Reserve Protection Check
// ═══════════════════════════════════════════════════════════════

export function reserveProtectionCheck(reservesCents: number, projectedDrawdownCents: number): {
  canAbsorb: boolean; coverageRatio: number; gapCents: number; recommendation: string;
} {
  const coverageRatio = projectedDrawdownCents > 0 ? reservesCents / projectedDrawdownCents : Infinity;
  const canAbsorb = reservesCents >= projectedDrawdownCents;
  const gapCents = canAbsorb ? 0 : projectedDrawdownCents - reservesCents;
  const recommendation = canAbsorb ? "Reserves can absorb projected drawdown" : `Reserve shortfall of $${(gapCents / 100).toFixed(0)} — reduce exposure or add reserves`;
  return { canAbsorb, coverageRatio, gapCents, recommendation };
}

// ═══════════════════════════════════════════════════════════════
// ENGINE 14: Obligation Coverage Ratio
// ═══════════════════════════════════════════════════════════════

export function obligationCoverageRatio(obligations: Obligation[], liquidCapitalCents: number): {
  totalObligationsCents: number; coverageRatio: number; monthsCovered: number; adequate: boolean;
} {
  const totalObligationsCents = obligations.reduce((s, o) => s + o.amountCents, 0);
  const monthlyObligation = obligations.filter(o => o.recurring).reduce((s, o) => s + o.amountCents, 0);
  const coverageRatio = totalObligationsCents > 0 ? liquidCapitalCents / totalObligationsCents : Infinity;
  const monthsCovered = monthlyObligation > 0 ? liquidCapitalCents / monthlyObligation : Infinity;
  const adequate = coverageRatio >= 1.5;
  return { totalObligationsCents, coverageRatio, monthsCovered, adequate };
}

// ═══════════════════════════════════════════════════════════════
// ENGINE 15: Leverage Cap
// ═══════════════════════════════════════════════════════════════

export function computeLeverageCap(params: {
  currentLeverage: number; policyMaxLeverage: number; regime: RegimeState;
}): { maxLeverage: number; regimeAdjustedMax: number; headroom: number; breached: boolean; recommendation: string } {
  const regimePenalty = params.regime.volatility === "extreme" ? 0.5 : params.regime.volatility === "elevated" ? 0.75 : 1.0;
  const regimeAdjustedMax = params.policyMaxLeverage * regimePenalty;
  const headroom = regimeAdjustedMax - params.currentLeverage;
  const breached = params.currentLeverage > regimeAdjustedMax;
  const recommendation = breached ? `Reduce leverage from ${params.currentLeverage.toFixed(2)}x to below ${regimeAdjustedMax.toFixed(2)}x` : `Leverage within limits (${headroom.toFixed(2)}x headroom)`;
  return { maxLeverage: params.policyMaxLeverage, regimeAdjustedMax, headroom, breached, recommendation };
}

// ═══════════════════════════════════════════════════════════════
// ENGINE 16: Stress Scenarios
// ═══════════════════════════════════════════════════════════════

export function runStressScenarios(positions: Position[], reserves: number, riskBudgetMax: number = 0.15): StressScenario[] {
  const totalValue = positions.reduce((s, p) => s + p.quantity * p.currentPrice, 0);
  const scenarios: Omit<StressScenario, "portfolioImpact" | "portfolioImpactPct" | "breachesReserve" | "breachesRiskBudget">[] = [
    { id: "bear-market", name: "Bear Market (-20%)", description: "Broad market decline of 20%", shocks: Object.fromEntries(positions.map(p => [p.symbol, p.assetClass === "cash" ? 0 : p.assetClass === "fixed-income" ? -0.05 : -0.2])) },
    { id: "crash", name: "Flash Crash (-35%)", description: "Severe sudden market crash", shocks: Object.fromEntries(positions.map(p => [p.symbol, p.assetClass === "cash" ? 0 : p.assetClass === "fixed-income" ? -0.1 : -0.35])) },
    { id: "crypto-winter", name: "Crypto Winter (-60%)", description: "Major crypto drawdown", shocks: Object.fromEntries(positions.map(p => [p.symbol, p.assetClass === "crypto" ? -0.6 : p.assetClass === "cash" ? 0 : -0.05])) },
    { id: "rate-shock", name: "Rate Shock", description: "Sudden rate increase", shocks: Object.fromEntries(positions.map(p => [p.symbol, p.assetClass === "fixed-income" ? -0.15 : p.assetClass === "cash" ? 0 : -0.08])) },
    { id: "stagflation", name: "Stagflation", description: "High inflation + low growth", shocks: Object.fromEntries(positions.map(p => [p.symbol, p.assetClass === "commodity" ? 0.15 : p.assetClass === "cash" ? -0.03 : -0.12])) },
  ];
  return scenarios.map(sc => {
    const impact = positions.reduce((s, p) => s + p.quantity * p.currentPrice * (sc.shocks[p.symbol] ?? 0), 0);
    return { ...sc, portfolioImpact: impact, portfolioImpactPct: totalValue > 0 ? impact / totalValue : 0, breachesReserve: (totalValue + impact) < reserves, breachesRiskBudget: Math.abs(impact / totalValue) > riskBudgetMax };
  });
}

// ═══════════════════════════════════════════════════════════════
// ENGINE 17: Monte Carlo Stress
// ═══════════════════════════════════════════════════════════════

export function monteCarloStress(params: {
  portfolioValue: number; expectedReturnPct: number; volatilityPct: number;
  days: number; paths: number; seed?: number;
}): { medianReturn: number; p5Return: number; p95Return: number; maxDrawdownMedian: number; probabilityOfLoss: number } {
  const { portfolioValue, expectedReturnPct, volatilityPct, days, paths } = params;
  const dailyReturn = expectedReturnPct / 252;
  const dailyVol = volatilityPct / Math.sqrt(252);
  const finalValues: number[] = [];
  const maxDrawdowns: number[] = [];
  // Simple deterministic pseudo-random for reproducibility
  let rngState = params.seed ?? 42;
  const nextRng = () => { rngState = (rngState * 1664525 + 1013904223) & 0x7fffffff; return (rngState / 0x7fffffff) * 2 - 1; };

  for (let p = 0; p < paths; p++) {
    let value = portfolioValue;
    let peak = value;
    let maxDD = 0;
    for (let d = 0; d < days; d++) {
      const shock = dailyReturn + dailyVol * nextRng();
      value *= (1 + shock);
      if (value > peak) peak = value;
      const dd = (peak - value) / peak;
      if (dd > maxDD) maxDD = dd;
    }
    finalValues.push(value);
    maxDrawdowns.push(maxDD);
  }
  finalValues.sort((a, b) => a - b);
  maxDrawdowns.sort((a, b) => a - b);
  const median = finalValues[Math.floor(paths / 2)];
  const p5 = finalValues[Math.floor(paths * 0.05)];
  const p95 = finalValues[Math.floor(paths * 0.95)];
  const lossCount = finalValues.filter(v => v < portfolioValue).length;
  return {
    medianReturn: (median - portfolioValue) / portfolioValue,
    p5Return: (p5 - portfolioValue) / portfolioValue,
    p95Return: (p95 - portfolioValue) / portfolioValue,
    maxDrawdownMedian: maxDrawdowns[Math.floor(paths / 2)],
    probabilityOfLoss: lossCount / paths,
  };
}

// ═══════════════════════════════════════════════════════════════
// ENGINE 18: Historical Replay Stress
// ═══════════════════════════════════════════════════════════════

export function historicalReplayStress(params: {
  portfolioValue: number; dailyReturns: number[]; scenarioName: string; period: string;
}): { finalValue: number; returnPct: number; maxDrawdownPct: number; recoveryDays: number; worstDay: { index: number; returnPct: number } } {
  let value = params.portfolioValue;
  let peak = value;
  let maxDD = 0;
  let worstDay = { index: 0, returnPct: 0 };
  let ddStart = -1;
  let recoveryDays = 0;
  let maxRecovery = 0;

  for (let i = 0; i < params.dailyReturns.length; i++) {
    const ret = params.dailyReturns[i];
    value *= (1 + ret);
    if (ret < worstDay.returnPct) worstDay = { index: i, returnPct: ret };
    if (value > peak) {
      if (ddStart >= 0) { const rd = i - ddStart; if (rd > maxRecovery) maxRecovery = rd; }
      peak = value; ddStart = -1;
    } else {
      const dd = (peak - value) / peak;
      if (dd > maxDD) { maxDD = dd; ddStart = i; }
    }
  }
  recoveryDays = maxRecovery;
  const returnPct = (value - params.portfolioValue) / params.portfolioValue;
  return { finalValue: value, returnPct, maxDrawdownPct: maxDD, recoveryDays, worstDay };
}

// ═══════════════════════════════════════════════════════════════
// ENGINE 19: Rebalance Recommendations
// ═══════════════════════════════════════════════════════════════

export function computeRebalance(positions: Position[], targets: { assetClass: string; targetPct: number }[], driftThreshold: number = 0.03): {
  recommendations: { assetClass: string; currentPct: number; targetPct: number; driftPct: number; action: "buy" | "sell" | "hold"; amountDollars: number }[];
  totalDrift: number; rebalanceNeeded: boolean;
} {
  const totalValue = positions.reduce((s, p) => s + p.quantity * p.currentPrice, 0);
  const currentAlloc: Record<string, number> = {};
  positions.forEach(p => { currentAlloc[p.assetClass] = (currentAlloc[p.assetClass] ?? 0) + (p.quantity * p.currentPrice); });
  let totalDrift = 0;
  const recommendations = targets.map(t => {
    const current = (currentAlloc[t.assetClass] ?? 0) / (totalValue || 1);
    const drift = current - t.targetPct;
    totalDrift += Math.abs(drift);
    const action: "buy" | "sell" | "hold" = drift > driftThreshold ? "sell" : drift < -driftThreshold ? "buy" : "hold";
    return { assetClass: t.assetClass, currentPct: current, targetPct: t.targetPct, driftPct: drift, action, amountDollars: Math.abs(drift) * totalValue };
  });
  return { recommendations, totalDrift, rebalanceNeeded: totalDrift > driftThreshold * 2 };
}

// ═══════════════════════════════════════════════════════════════
// ENGINE 20: Factor Risk Decomposition
// ═══════════════════════════════════════════════════════════════

export function computeFactorRisk(factors: FactorExposureInput[]): {
  factors: { name: string; exposure: number; contribution: number }[];
  residualRisk: number; totalFactorRisk: number; dominantFactor: string; warnings: string[];
} {
  const totalWeight = factors.reduce((s, f) => s + Math.abs(f.weight * f.beta), 0);
  const result = factors.map(f => {
    const contribution = Math.abs(f.weight * f.beta);
    return { name: f.name, exposure: f.beta * f.weight, contribution: totalWeight > 0 ? contribution / totalWeight : 0 };
  }).sort((a, b) => b.contribution - a.contribution);
  const dominantFactor = result[0]?.name ?? "none";
  const residualRisk = Math.max(0, 1 - result.reduce((s, r) => s + r.contribution, 0));
  const warnings: string[] = [];
  if (result[0]?.contribution > 0.5) warnings.push(`Heavy ${dominantFactor} factor concentration (${(result[0].contribution * 100).toFixed(0)}%)`);
  return { factors: result, residualRisk, totalFactorRisk: 1 - residualRisk, dominantFactor, warnings };
}

// ═══════════════════════════════════════════════════════════════
// ENGINE 21: Mandate Compliance
// ═══════════════════════════════════════════════════════════════

export function computeMandateCompliance(positions: Position[], mandateRules: MandateRule[]): {
  rules: { rule: string; compliant: boolean; currentValue: number; limit: number }[];
  overallCompliant: boolean; breachCount: number;
} {
  const totalValue = positions.reduce((s, p) => s + p.quantity * p.currentPrice, 0);
  if (totalValue <= 0) return { rules: mandateRules.map(r => ({ rule: r.rule, compliant: true, currentValue: 0, limit: r.limitPct })), overallCompliant: true, breachCount: 0 };

  const results = mandateRules.map(r => {
    let currentValue = 0;
    if (r.field === "assetClass") {
      const match = positions.filter(p => r.rule.toLowerCase().includes(p.assetClass)).reduce((s, p) => s + p.quantity * p.currentPrice, 0);
      currentValue = match / totalValue;
    } else if (r.field === "single-position") {
      const max = Math.max(...positions.map(p => (p.quantity * p.currentPrice) / totalValue));
      currentValue = max;
    } else if (r.field === "cash-minimum") {
      currentValue = positions.filter(p => p.assetClass === "cash").reduce((s, p) => s + p.quantity * p.currentPrice, 0) / totalValue;
    } else {
      currentValue = 0;
    }
    const compliant = r.operator === "max" ? currentValue <= r.limitPct : r.operator === "min" ? currentValue >= r.limitPct : Math.abs(currentValue - r.limitPct) < 0.01;
    return { rule: r.rule, compliant, currentValue, limit: r.limitPct };
  });
  const breachCount = results.filter(r => !r.compliant).length;
  return { rules: results, overallCompliant: breachCount === 0, breachCount };
}

// ═══════════════════════════════════════════════════════════════
// ENGINE 22: Robust Portfolio Optimization
// ═══════════════════════════════════════════════════════════════

export function computeRobustOptimization(params: {
  assetClasses: { name: string; expectedReturn: number; volatility: number; weight: number }[];
  shrinkageIntensity?: number; riskAversion?: number;
}): {
  optimalWeights: { name: string; weight: number; ci: { low: number; high: number } }[];
  expectedReturn: number; expectedVol: number; shrinkageApplied: boolean;
} {
  const { assetClasses, shrinkageIntensity = 0.5, riskAversion = 2 } = params;
  const totalWeight = assetClasses.reduce((s, a) => s + a.weight, 0);
  const globalMeanReturn = totalWeight > 0 ? assetClasses.reduce((s, a) => s + a.expectedReturn * a.weight, 0) / totalWeight : 0;

  const optimalWeights = assetClasses.map(a => {
    const shrunkReturn = a.expectedReturn * (1 - shrinkageIntensity) + globalMeanReturn * shrinkageIntensity;
    const riskAdjusted = a.volatility > 0 ? shrunkReturn / (riskAversion * a.volatility * a.volatility) : 0;
    return { name: a.name, rawWeight: Math.max(0, riskAdjusted), vol: a.volatility };
  });

  const totalRaw = optimalWeights.reduce((s, w) => s + w.rawWeight, 0);
  const normalized = optimalWeights.map(w => {
    const weight = totalRaw > 0 ? w.rawWeight / totalRaw : 1 / assetClasses.length;
    return { name: w.name, weight, ci: { low: Math.max(0, weight - 0.05), high: Math.min(1, weight + 0.05) } };
  });

  const expectedReturn = normalized.reduce((s, w) => {
    const ac = assetClasses.find(a => a.name === w.name)!;
    return s + ac.expectedReturn * w.weight;
  }, 0);
  const expectedVol = Math.sqrt(normalized.reduce((s, w) => {
    const ac = assetClasses.find(a => a.name === w.name)!;
    return s + (ac.volatility * w.weight) ** 2;
  }, 0));

  return { optimalWeights: normalized, expectedReturn, expectedVol, shrinkageApplied: shrinkageIntensity > 0 };
}

// ═══════════════════════════════════════════════════════════════
// ENGINE 23: Stop / Exit Policy
// ═══════════════════════════════════════════════════════════════

export function computeStopExitPolicy(params: {
  asset: string; currentPrice: number; peakPrice: number;
  trailingStopPct: number; hardStopPrice: number;
  invalidationConditions: { condition: string; triggered: boolean }[];
}): { trailingStopPrice: number; triggered: boolean; invalidationTriggered: boolean; action: "hold" | "tighten-stop" | "exit-partial" | "exit-full" } {
  const trailingStopPrice = params.peakPrice * (1 - params.trailingStopPct);
  const trailingTriggered = params.currentPrice <= trailingStopPrice;
  const hardTriggered = params.currentPrice <= params.hardStopPrice;
  const invalidationTriggered = params.invalidationConditions.some(c => c.triggered);
  const triggered = trailingTriggered || hardTriggered;
  const action = hardTriggered || invalidationTriggered ? "exit-full" : trailingTriggered ? "exit-partial" : params.currentPrice < params.peakPrice * 0.95 ? "tighten-stop" : "hold";
  return { trailingStopPrice, triggered, invalidationTriggered, action };
}

// ═══════════════════════════════════════════════════════════════
// ENGINE 24: Slippage & Fee Adjusted Return
// ═══════════════════════════════════════════════════════════════

export function computeSlippageFeeAdjustedReturn(params: {
  grossReturnPct: number; slippageBps: number; commissionBps: number;
  spreadBps: number; taxDragPct?: number;
}): { netReturnPct: number; totalFrictionPct: number } {
  const slippage = params.slippageBps / 10000;
  const commission = params.commissionBps / 10000;
  const spread = params.spreadBps / 10000;
  const taxDrag = params.taxDragPct ?? 0;
  const totalFriction = slippage + commission + spread + taxDrag;
  return { netReturnPct: params.grossReturnPct - totalFriction, totalFrictionPct: totalFriction };
}

// ═══════════════════════════════════════════════════════════════
// ENGINE 25: Trade Cost Estimate
// ═══════════════════════════════════════════════════════════════

export function estimateTradeCost(params: {
  amountCents: number; slippageBps: number; commissionBps: number; spreadBps: number;
}): { slippageCents: number; commissionCents: number; spreadCents: number; totalFrictionCents: number; netProceedsCents: number } {
  const slippageCents = Math.round(params.amountCents * params.slippageBps / 10000);
  const commissionCents = Math.round(params.amountCents * params.commissionBps / 10000);
  const spreadCents = Math.round(params.amountCents * params.spreadBps / 10000);
  const totalFrictionCents = slippageCents + commissionCents + spreadCents;
  return { slippageCents, commissionCents, spreadCents, totalFrictionCents, netProceedsCents: params.amountCents - totalFrictionCents };
}

// ═══════════════════════════════════════════════════════════════
// ENGINE 26: Tax Reserve Computation
// ═══════════════════════════════════════════════════════════════

export function computeTaxReserve(params: {
  realizedGainsCents: number; unrealizedGainsCents: number;
  shortTermRate: number; longTermRate: number;
  currentReserveCents: number; shortTermPct?: number;
}): { estimatedLiabilityCents: number; shortfallCents: number; adequacy: "adequate" | "marginal" | "underfunded" | "critically-underfunded"; harvestOpportunities: number } {
  const shortPct = params.shortTermPct ?? 0.4;
  const shortTermTax = Math.round(params.realizedGainsCents * shortPct * params.shortTermRate);
  const longTermTax = Math.round(params.realizedGainsCents * (1 - shortPct) * params.longTermRate);
  const estimatedLiabilityCents = shortTermTax + longTermTax;
  const shortfallCents = Math.max(0, estimatedLiabilityCents - params.currentReserveCents);
  const ratio = estimatedLiabilityCents > 0 ? params.currentReserveCents / estimatedLiabilityCents : Infinity;
  const adequacy = ratio >= 1 ? "adequate" : ratio >= 0.7 ? "marginal" : ratio >= 0.4 ? "underfunded" : "critically-underfunded";
  const harvestOpportunities = params.unrealizedGainsCents < 0 ? 1 : 0;
  return { estimatedLiabilityCents, shortfallCents, adequacy, harvestOpportunities };
}

// ═══════════════════════════════════════════════════════════════
// ENGINE 27: Capital Call Plan
// ═══════════════════════════════════════════════════════════════

export function computeCapitalCallPlan(params: {
  commitments: { fundName: string; totalCents: number; calledCents: number; expectedCallDate: string; probability: number }[];
  liquidReserveCents: number;
}): { totalUncalledCents: number; weightedUncalledCents: number; coverageRatio: number; shortfallCents: number; pacingOk: boolean } {
  const totalUncalled = params.commitments.reduce((s, c) => s + (c.totalCents - c.calledCents), 0);
  const weighted = params.commitments.reduce((s, c) => s + (c.totalCents - c.calledCents) * c.probability, 0);
  const coverageRatio = weighted > 0 ? params.liquidReserveCents / weighted : Infinity;
  const shortfallCents = Math.max(0, weighted - params.liquidReserveCents);
  return { totalUncalledCents: totalUncalled, weightedUncalledCents: weighted, coverageRatio, shortfallCents, pacingOk: coverageRatio >= 1.2 };
}

// ═══════════════════════════════════════════════════════════════
// ENGINE 28: Net Worth
// ═══════════════════════════════════════════════════════════════

export function computeNetWorth(assets: { entity: string; valueCents: number }[], liabilities: { entity: string; valueCents: number }[]): {
  totalAssets: number; totalLiabilities: number; netWorth: number;
  byEntity: { entity: string; assets: number; liabilities: number; net: number }[];
} {
  const entityMap: Record<string, { assets: number; liabilities: number }> = {};
  assets.forEach(a => { entityMap[a.entity] = entityMap[a.entity] ?? { assets: 0, liabilities: 0 }; entityMap[a.entity].assets += a.valueCents; });
  liabilities.forEach(l => { entityMap[l.entity] = entityMap[l.entity] ?? { assets: 0, liabilities: 0 }; entityMap[l.entity].liabilities += l.valueCents; });
  const totalAssets = assets.reduce((s, a) => s + a.valueCents, 0);
  const totalLiabilities = liabilities.reduce((s, l) => s + l.valueCents, 0);
  const byEntity = Object.entries(entityMap).map(([entity, v]) => ({ entity, assets: v.assets, liabilities: v.liabilities, net: v.assets - v.liabilities }));
  return { totalAssets, totalLiabilities, netWorth: totalAssets - totalLiabilities, byEntity };
}

// ═══════════════════════════════════════════════════════════════
// ENGINE 29: Entity Capital Separation
// ═══════════════════════════════════════════════════════════════

export function computeEntityCapitalSeparation(buckets: CapitalBucket[]): {
  entities: { entity: string; capital: number; reserves: number; deployable: number; restricted: boolean }[];
  isolationScore: number; warnings: string[];
} {
  const entityMap: Record<string, { capital: number; reserves: number; deployable: number; hasRingfenced: boolean }> = {};
  buckets.forEach(b => {
    const e = entityMap[b.entityOwner] = entityMap[b.entityOwner] ?? { capital: 0, reserves: 0, deployable: 0, hasRingfenced: false };
    e.capital += b.balance;
    if (b.type.startsWith("reserve-")) e.reserves += b.balance;
    if (b.type === "deployable" || b.type === "investing-capital") e.deployable += b.balance;
    if (b.ringfenced) e.hasRingfenced = true;
  });
  const entities = Object.entries(entityMap).map(([entity, v]) => ({ entity, capital: v.capital, reserves: v.reserves, deployable: v.deployable, restricted: v.hasRingfenced }));
  const entitiesWithReserves = entities.filter(e => e.reserves > 0).length;
  const isolationScore = entities.length > 0 ? entitiesWithReserves / entities.length : 0;
  const warnings: string[] = [];
  entities.forEach(e => { if (e.reserves === 0 && e.capital > 10000) warnings.push(`${e.entity} has no reserve allocation`); });
  return { entities, isolationScore, warnings };
}

// ═══════════════════════════════════════════════════════════════
// ENGINE 30: Deployable Capital
// ═══════════════════════════════════════════════════════════════

export function computeDeployableCapital(buckets: CapitalBucket[], obligations: Obligation[]): {
  totalCapital: number; reserves: number; restricted: number; obligations: number; deployable: number; deployablePct: number; constraints: string[];
} {
  const totalCapital = buckets.reduce((s, b) => s + b.balance, 0);
  const reserves = buckets.filter(b => b.type.startsWith("reserve-")).reduce((s, b) => s + b.balance, 0);
  const restricted = buckets.filter(b => b.ringfenced || b.type === "restricted").reduce((s, b) => s + b.balance, 0);
  const obligationTotal = obligations.reduce((s, o) => s + o.amountCents / 100, 0);
  const deployable = Math.max(0, totalCapital - reserves - restricted - obligationTotal);
  const constraints: string[] = [];
  if (reserves > totalCapital * 0.5) constraints.push("Reserves exceed 50% of total capital");
  if (restricted > totalCapital * 0.3) constraints.push("Restricted capital exceeds 30%");
  return { totalCapital, reserves, restricted, obligations: obligationTotal, deployable, deployablePct: totalCapital > 0 ? deployable / totalCapital : 0, constraints };
}

// ═══════════════════════════════════════════════════════════════
// ENGINE 31: Venue Risk Assessment
// ═══════════════════════════════════════════════════════════════

export function computeVenueRisk(positions: Position[]): {
  venues: { name: string; valueDollars: number; pct: number; riskScore: number; custodyType: string }[];
  concentrationWarnings: string[];
} {
  const totalValue = positions.reduce((s, p) => s + p.quantity * p.currentPrice, 0);
  const venueMap: Record<string, { value: number; custody: string }> = {};
  positions.forEach(p => {
    venueMap[p.venue] = venueMap[p.venue] ?? { value: 0, custody: p.custodyType };
    venueMap[p.venue].value += p.quantity * p.currentPrice;
  });
  const venues = Object.entries(venueMap).map(([name, v]) => {
    const pct = totalValue > 0 ? v.value / totalValue : 0;
    const riskScore = v.custody === "self-custody" ? 30 : v.custody === "exchange" ? 70 : v.custody === "wallet" ? 50 : 20;
    return { name, valueDollars: v.value, pct, riskScore, custodyType: v.custody };
  }).sort((a, b) => b.pct - a.pct);
  const concentrationWarnings = venues.filter(v => v.pct > 0.4).map(v => `${v.name} holds ${(v.pct * 100).toFixed(0)}% of portfolio — concentration risk`);
  return { venues, concentrationWarnings };
}

// ═══════════════════════════════════════════════════════════════
// ENGINE 32: FX Exposure
// ═══════════════════════════════════════════════════════════════

export function computeFxExposure(positions: Position[], baseCurrency: string = "USD"): {
  exposures: { currency: string; valueDollars: number; pct: number }[];
  foreignPct: number; riskLevel: "low" | "moderate" | "high";
} {
  const totalValue = positions.reduce((s, p) => s + p.quantity * p.currentPrice, 0);
  const currMap: Record<string, number> = {};
  positions.forEach(p => { currMap[p.currency] = (currMap[p.currency] ?? 0) + p.quantity * p.currentPrice; });
  const exposures = Object.entries(currMap).map(([currency, v]) => ({ currency, valueDollars: v, pct: totalValue > 0 ? v / totalValue : 0 })).sort((a, b) => b.pct - a.pct);
  const foreignPct = exposures.filter(e => e.currency !== baseCurrency).reduce((s, e) => s + e.pct, 0);
  const riskLevel = foreignPct > 0.4 ? "high" : foreignPct > 0.15 ? "moderate" : "low";
  return { exposures, foreignPct, riskLevel };
}

// ═══════════════════════════════════════════════════════════════
// ENGINE 33: Crypto Exposure
// ═══════════════════════════════════════════════════════════════

export function computeCryptoExposure(positions: Position[]): {
  totalValue: number; holdings: { asset: string; value: number; pct: number; venue: string }[];
  custodyBreakdown: { type: string; pct: number }[];
  riskFlags: string[];
} {
  const totalPortfolio = positions.reduce((s, p) => s + p.quantity * p.currentPrice, 0);
  const cryptoPositions = positions.filter(p => p.assetClass === "crypto");
  const totalValue = cryptoPositions.reduce((s, p) => s + p.quantity * p.currentPrice, 0);
  const holdings = cryptoPositions.map(p => ({ asset: p.symbol, value: p.quantity * p.currentPrice, pct: totalPortfolio > 0 ? (p.quantity * p.currentPrice) / totalPortfolio : 0, venue: p.venue }));
  const custMap: Record<string, number> = {};
  cryptoPositions.forEach(p => { custMap[p.custodyType] = (custMap[p.custodyType] ?? 0) + p.quantity * p.currentPrice; });
  const custodyBreakdown = Object.entries(custMap).map(([type, v]) => ({ type, pct: totalValue > 0 ? v / totalValue : 0 }));
  const riskFlags: string[] = [];
  const cryptoPct = totalPortfolio > 0 ? totalValue / totalPortfolio : 0;
  if (cryptoPct > 0.2) riskFlags.push(`Crypto allocation ${(cryptoPct * 100).toFixed(0)}% exceeds 20% limit`);
  if (custodyBreakdown.find(c => c.type === "exchange" && c.pct > 0.5)) riskFlags.push("Over 50% of crypto on exchanges — custody risk");
  return { totalValue, holdings, custodyBreakdown, riskFlags };
}

// ═══════════════════════════════════════════════════════════════
// ENGINE 34: Sector Concentration
// ═══════════════════════════════════════════════════════════════

export function computeSectorConcentration(positions: Position[], maxPct: number = 0.3): {
  sectors: { sector: string; pct: number; breached: boolean }[];
  warnings: string[];
} {
  const totalValue = positions.reduce((s, p) => s + p.quantity * p.currentPrice, 0);
  const sectorMap: Record<string, number> = {};
  positions.forEach(p => { sectorMap[p.sector ?? p.assetClass] = (sectorMap[p.sector ?? p.assetClass] ?? 0) + p.quantity * p.currentPrice; });
  const sectors = Object.entries(sectorMap).map(([sector, v]) => ({ sector, pct: totalValue > 0 ? v / totalValue : 0, breached: totalValue > 0 ? v / totalValue > maxPct : false })).sort((a, b) => b.pct - a.pct);
  const warnings = sectors.filter(s => s.breached).map(s => `${s.sector} at ${(s.pct * 100).toFixed(0)}% exceeds ${(maxPct * 100).toFixed(0)}% limit`);
  return { sectors, warnings };
}

// ═══════════════════════════════════════════════════════════════
// ENGINE 35: Geographic Concentration
// ═══════════════════════════════════════════════════════════════

export function computeGeographicConcentration(positions: Position[], maxPct: number = 0.6): {
  regions: { region: string; pct: number; breached: boolean }[];
  warnings: string[];
} {
  const totalValue = positions.reduce((s, p) => s + p.quantity * p.currentPrice, 0);
  const geoMap: Record<string, number> = {};
  positions.forEach(p => { geoMap[p.geography ?? "Unknown"] = (geoMap[p.geography ?? "Unknown"] ?? 0) + p.quantity * p.currentPrice; });
  const regions = Object.entries(geoMap).map(([region, v]) => ({ region, pct: totalValue > 0 ? v / totalValue : 0, breached: totalValue > 0 ? v / totalValue > maxPct : false })).sort((a, b) => b.pct - a.pct);
  const warnings = regions.filter(r => r.breached).map(r => `${r.region} at ${(r.pct * 100).toFixed(0)}% exceeds ${(maxPct * 100).toFixed(0)}% limit`);
  return { regions, warnings };
}

// ═══════════════════════════════════════════════════════════════
// ENGINE 36: Cash Posture
// ═══════════════════════════════════════════════════════════════

export function computeCashPosture(positions: Position[], buckets: CapitalBucket[], targetCashPct: number = 0.1): {
  totalCash: number; cashPct: number; posture: "over-cash" | "on-target" | "under-cash" | "critically-low"; recommendation: string;
} {
  const portfolioValue = positions.reduce((s, p) => s + p.quantity * p.currentPrice, 0);
  const cashFromPositions = positions.filter(p => p.assetClass === "cash").reduce((s, p) => s + p.quantity * p.currentPrice, 0);
  const cashFromBuckets = buckets.filter(b => b.type.includes("cash")).reduce((s, b) => s + b.balance, 0);
  const totalCash = cashFromPositions + cashFromBuckets;
  const totalValue = portfolioValue + cashFromBuckets;
  const cashPct = totalValue > 0 ? totalCash / totalValue : 0;
  const posture = cashPct > targetCashPct * 1.5 ? "over-cash" : cashPct >= targetCashPct * 0.8 ? "on-target" : cashPct >= targetCashPct * 0.3 ? "under-cash" : "critically-low";
  const recommendation = posture === "over-cash" ? "Excess cash — consider deploying" : posture === "on-target" ? "Cash allocation on target" : `Cash below target — need ${((targetCashPct - cashPct) * totalValue).toFixed(0)} more`;
  return { totalCash, cashPct, posture, recommendation };
}

// ═══════════════════════════════════════════════════════════════
// ENGINE 37: Reserve Posture
// ═══════════════════════════════════════════════════════════════

export function computeReservePosture(buckets: CapitalBucket[], monthlyObligations: number = 8000): {
  totalReserves: number; byBucket: { name: string; current: number; target: number; fundedPct: number }[];
  overallFundedPct: number; monthsCoverage: number;
  posture: "fully-funded" | "adequate" | "gap" | "critical-gap";
} {
  const reserveBuckets = buckets.filter(b => b.type.startsWith("reserve-"));
  const totalReserves = reserveBuckets.reduce((s, b) => s + b.balance, 0);
  const totalTarget = reserveBuckets.reduce((s, b) => s + (b.targetBalance ?? b.balance), 0);
  const byBucket = reserveBuckets.map(b => ({ name: b.name, current: b.balance, target: b.targetBalance ?? b.balance, fundedPct: (b.targetBalance ?? b.balance) > 0 ? b.balance / (b.targetBalance ?? b.balance) : 1 }));
  const overallFundedPct = totalTarget > 0 ? totalReserves / totalTarget : 1;
  const monthsCoverage = monthlyObligations > 0 ? totalReserves / monthlyObligations : Infinity;
  const posture = overallFundedPct >= 1 ? "fully-funded" : overallFundedPct >= 0.8 ? "adequate" : overallFundedPct >= 0.5 ? "gap" : "critical-gap";
  return { totalReserves, byBucket, overallFundedPct, monthsCoverage, posture };
}

// ═══════════════════════════════════════════════════════════════
// ENGINE 38: Liquidity Posture
// ═══════════════════════════════════════════════════════════════

export function computeLiquidityPosture(positions: Position[], buckets: CapitalBucket[]): {
  immediate: number; within30d: number; within90d: number; locked: number;
  ratio: number; posture: "strong" | "adequate" | "tight" | "stressed";
} {
  const result = computeLiquidityLadder(positions, buckets);
  return { immediate: result.immediate, within30d: result.within30d, within90d: result.within90d, locked: result.locked, ratio: result.ratio, posture: result.adequacy };
}

// ═══════════════════════════════════════════════════════════════
// ENGINE 39: Opportunity Scoring
// ═══════════════════════════════════════════════════════════════

export function computeOpportunityScore(params: {
  thesisStrength: number; regimeAlignment: number; riskRewardRatio: number; liquidityScore: number;
}): { compositeScore: number; rank: string; recommendation: string } {
  const { thesisStrength, regimeAlignment, riskRewardRatio, liquidityScore } = params;
  const compositeScore = thesisStrength * 0.3 + regimeAlignment * 0.25 + Math.min(1, riskRewardRatio / 3) * 0.25 + liquidityScore * 0.2;
  const rank = compositeScore > 0.7 ? "A" : compositeScore > 0.5 ? "B" : compositeScore > 0.3 ? "C" : "D";
  const recommendation = compositeScore > 0.7 ? "Strong opportunity — proceed with review" : compositeScore > 0.5 ? "Moderate — requires deeper analysis" : "Weak — monitor only";
  return { compositeScore, rank, recommendation };
}

// ═══════════════════════════════════════════════════════════════
// ENGINE 40: Thesis Scoring
// ═══════════════════════════════════════════════════════════════

export function computeThesisScore(thesis: Thesis, regime: RegimeState): {
  score: number; factors: { name: string; value: number; weight: number }[];
  recommendation: string;
} {
  const regimeAlignment = !(
    (thesis.direction === "long" && (regime.trend === "strong-down" || regime.riskAppetite === "flight-to-safety")) ||
    (thesis.direction === "short" && regime.trend === "strong-up")
  ) ? 0.8 : 0.2;
  const catalystScore = Math.min(1, thesis.catalysts.length / 3);
  const invalidationClarity = Math.min(1, thesis.invalidationConditions.length / 2);
  const factors = [
    { name: "Confidence", value: thesis.confidence, weight: 0.3 },
    { name: "Regime Alignment", value: regimeAlignment, weight: 0.25 },
    { name: "Catalyst Strength", value: catalystScore, weight: 0.2 },
    { name: "Invalidation Clarity", value: invalidationClarity, weight: 0.15 },
    { name: "Approval Status", value: thesis.approvalStatus === "approved" ? 1 : 0.3, weight: 0.1 },
  ];
  const score = factors.reduce((s, f) => s + f.value * f.weight, 0);
  const recommendation = score > 0.7 ? "Strong thesis — maintain" : score > 0.5 ? "Moderate — monitor closely" : "Weak — consider closing";
  return { score, factors, recommendation };
}

// ═══════════════════════════════════════════════════════════════
// ENGINE 41: Thesis Evaluation (legacy compat)
// ═══════════════════════════════════════════════════════════════

export function evaluateThesis(thesis: Thesis, currentRegime: RegimeState): {
  stillValid: boolean; warningFlags: string[]; regimeAligned: boolean;
  recommendedAction: "hold" | "reduce" | "add" | "close" | "review";
} {
  const warningFlags: string[] = [];
  if (thesis.confidence < 0.4) warningFlags.push("Low confidence — review thesis rationale");
  if (currentRegime.volatility === "extreme") warningFlags.push("Extreme volatility regime — elevated caution");
  if (currentRegime.instability === "crisis" || currentRegime.instability === "dislocating") warningFlags.push("Market instability — thesis may be invalidated by regime shift");
  if (thesis.status === "invalidated") warningFlags.push("Thesis already invalidated");
  const regimeAligned = !((thesis.direction === "long" && (currentRegime.trend === "strong-down" || currentRegime.riskAppetite === "flight-to-safety")) || (thesis.direction === "short" && currentRegime.trend === "strong-up"));
  if (!regimeAligned) warningFlags.push("Thesis direction conflicts with current regime");
  const stillValid = thesis.status === "active" && warningFlags.length < 3 && thesis.confidence >= 0.3;
  const recommendedAction = !stillValid ? "close" : warningFlags.length >= 2 ? "reduce" : regimeAligned && thesis.confidence > 0.7 ? "add" : warningFlags.length > 0 ? "review" : "hold";
  return { stillValid, warningFlags, regimeAligned, recommendedAction };
}

// ═══════════════════════════════════════════════════════════════
// ENGINE 42: Committee Packet Builder
// ═══════════════════════════════════════════════════════════════

export function buildCommitteePacket(params: {
  positions: Position[]; buckets: CapitalBucket[]; theses: Thesis[]; regime: RegimeState;
}): {
  regimeSummary: string; concentrationRisk: string; reservePosture: string;
  activeThesesCount: number; validThesesCount: number; recommendations: string[];
} {
  const risk = analyzePortfolioRisk(params.positions, params.buckets.filter(b => b.type.startsWith("reserve-")).reduce((s, b) => s + b.balance, 0));
  const validTheses = params.theses.filter(t => evaluateThesis(t, params.regime).stillValid);
  const recommendations: string[] = [];
  if (risk.concentrationRisk === "high" || risk.concentrationRisk === "critical") recommendations.push("Reduce concentration in " + risk.largestPosition.symbol);
  if (risk.reserveCoverage < 6) recommendations.push("Increase reserve coverage to 6+ months");
  if (params.regime.volatility === "elevated" || params.regime.volatility === "extreme") recommendations.push("Reduce position sizes for current volatility regime");
  return {
    regimeSummary: `${params.regime.riskAppetite} / ${params.regime.volatility} vol / ${params.regime.instability}`,
    concentrationRisk: risk.concentrationRisk,
    reservePosture: `${risk.reserveCoverage.toFixed(1)} months`,
    activeThesesCount: params.theses.filter(t => t.status === "active").length,
    validThesesCount: validTheses.length,
    recommendations,
  };
}

// ═══════════════════════════════════════════════════════════════
// ENGINE 43: Proof Artifact Generation
// ═══════════════════════════════════════════════════════════════

export function generateProofArtifact(params: {
  decisionType: string; summary: string; inputs: Record<string, unknown>; outcome: string;
}): { id: string; hash: string; createdAt: string } {
  const createdAt = new Date().toISOString();
  const hashInput = JSON.stringify({ ...params, createdAt });
  let hash = 0;
  for (let i = 0; i < hashInput.length; i++) { hash = ((hash << 5) - hash + hashInput.charCodeAt(i)) | 0; }
  return { id: `proof-${Math.abs(hash).toString(36)}`, hash: Math.abs(hash).toString(16).padStart(16, "0"), createdAt };
}

// ═══════════════════════════════════════════════════════════════
// ENGINE 44: Watchlist Regime Overlay
// ═══════════════════════════════════════════════════════════════

export function applyWatchlistRegimeOverlay(entries: { asset: string; assetClass: string; direction: "long" | "short" | "neutral" }[], regime: RegimeState): {
  entries: { asset: string; regimeAligned: boolean; warning?: string }[];
} {
  return {
    entries: entries.map(e => {
      const aligned = !((e.direction === "long" && regime.riskAppetite === "flight-to-safety") || (e.direction === "short" && regime.trend === "strong-up"));
      return { asset: e.asset, regimeAligned: aligned, warning: aligned ? undefined : "Direction conflicts with current regime" };
    }),
  };
}

// ═══════════════════════════════════════════════════════════════
// ENGINE 45: Research Context Builder
// ═══════════════════════════════════════════════════════════════

export function buildResearchContext(params: {
  asset: string; sources: { title: string; confidence: number; date: string }[];
  contradictions: string[];
}): { confidenceSummary: { low: number; mid: number; high: number }; hasContradictions: boolean; qualityScore: number } {
  const low = params.sources.filter(s => s.confidence < 0.4).length;
  const mid = params.sources.filter(s => s.confidence >= 0.4 && s.confidence < 0.7).length;
  const high = params.sources.filter(s => s.confidence >= 0.7).length;
  const avgConf = params.sources.length > 0 ? params.sources.reduce((s, src) => s + src.confidence, 0) / params.sources.length : 0;
  const qualityScore = avgConf * (params.contradictions.length === 0 ? 1 : 0.7);
  return { confidenceSummary: { low, mid, high }, hasContradictions: params.contradictions.length > 0, qualityScore };
}

// ═══════════════════════════════════════════════════════════════
// ENGINE 46: Trade Journal Linking
// ═══════════════════════════════════════════════════════════════

export function linkTradeToJournal(params: {
  tradeId: string; thesisId?: string; proofId: string; executionPrice: number; direction: "buy" | "sell";
}): { journalEntry: { tradeId: string; thesisId: string | null; proofId: string; linkedAt: string } } {
  return { journalEntry: { tradeId: params.tradeId, thesisId: params.thesisId ?? null, proofId: params.proofId, linkedAt: new Date().toISOString() } };
}

// ═══════════════════════════════════════════════════════════════
// ENGINE 47: Custody Breakdown
// ═══════════════════════════════════════════════════════════════

export function computeCustodyBreakdown(positions: Position[]): {
  breakdown: { type: string; valueDollars: number; pct: number }[];
  riskScore: number; warnings: string[];
} {
  const totalValue = positions.reduce((s, p) => s + p.quantity * p.currentPrice, 0);
  const custMap: Record<string, number> = {};
  positions.forEach(p => { custMap[p.custodyType] = (custMap[p.custodyType] ?? 0) + p.quantity * p.currentPrice; });
  const breakdown = Object.entries(custMap).map(([type, v]) => ({ type, valueDollars: v, pct: totalValue > 0 ? v / totalValue : 0 })).sort((a, b) => b.pct - a.pct);
  const exchangePct = breakdown.find(b => b.type === "exchange")?.pct ?? 0;
  const selfCustodyPct = breakdown.find(b => b.type === "self-custody")?.pct ?? 0;
  const riskScore = exchangePct * 70 + selfCustodyPct * 30 + (1 - exchangePct - selfCustodyPct) * 20;
  const warnings: string[] = [];
  if (exchangePct > 0.5) warnings.push("Over 50% held on exchanges — consider cold storage");
  return { breakdown, riskScore, warnings };
}
