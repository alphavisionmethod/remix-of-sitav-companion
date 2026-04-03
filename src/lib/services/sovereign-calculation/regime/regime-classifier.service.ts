// SITA OS — Regime Classifier Service
export type MarketRegime = "bull" | "bear" | "sideways" | "crisis";
export interface RegimeClassification { regime: MarketRegime; confidence: number; signals: string[]; transitionProbabilities: Record<MarketRegime, number> }

export function classifyRegime(params: { sma50: number; sma200: number; currentPrice: number; vix: number; drawdownPct: number }): RegimeClassification {
  const { sma50, sma200, currentPrice, vix, drawdownPct } = params;
  if (vix > 35 || drawdownPct > 20) return { regime: "crisis", confidence: 0.9, signals: ["VIX elevated", "Significant drawdown"], transitionProbabilities: { bull: 0.1, bear: 0.3, sideways: 0.2, crisis: 0.4 } };
  if (currentPrice < sma200 && sma50 < sma200) return { regime: "bear", confidence: 0.82, signals: ["Price below 200 SMA", "Death cross"], transitionProbabilities: { bull: 0.15, bear: 0.5, sideways: 0.25, crisis: 0.1 } };
  if (currentPrice > sma200 && sma50 > sma200) return { regime: "bull", confidence: 0.85, signals: ["Price above 200 SMA", "Golden cross"], transitionProbabilities: { bull: 0.55, bear: 0.1, sideways: 0.25, crisis: 0.1 } };
  return { regime: "sideways", confidence: 0.7, signals: ["Mixed signals", "Narrow range"], transitionProbabilities: { bull: 0.3, bear: 0.2, sideways: 0.4, crisis: 0.1 } };
}
