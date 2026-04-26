// ═══════════════════════════════════════════════════════════════
// SITA OS — Finance OS: Crypto Exposure Service
// Cryptocurrency position tracking and risk analysis
// ═══════════════════════════════════════════════════════════════

import type { CryptoExposureSummary } from "@/packages/finance-contracts/investment-office";

import type { CryptoRiskAssessment } from "@/domains/finance";

// Canonical type re-exports for backward compatibility.
// New code should import from `@/domains/finance` directly.
export type { CryptoRiskAssessment };

export function assessCryptoRisk(exposure: CryptoExposureSummary, totalPortfolioCents: number, mandateLimitPct: number = 10): CryptoRiskAssessment {
  const pct = totalPortfolioCents > 0 ? (exposure.totalValueCents / totalPortfolioCents) * 100 : 0;
  const exchangePercent = exposure.custodyBreakdown.filter(c => c.type === "exchange").reduce((s, c) => s + c.percent, 0);
  const custodyScore = 100 - exchangePercent; // higher = better (more self-custody)

  const recommendations: string[] = [];
  if (pct > mandateLimitPct) recommendations.push(`Crypto at ${pct.toFixed(1)}% — exceeds ${mandateLimitPct}% mandate limit`);
  if (exchangePercent > 50) recommendations.push("Consider moving crypto to self-custody — reduce exchange risk");
  if (exposure.holdings.length === 1) recommendations.push("Single-asset concentration — consider diversifying crypto allocation");

  return {
    exposure,
    percentOfPortfolio: Math.round(pct * 10) / 10,
    mandateLimit: mandateLimitPct,
    withinMandate: pct <= mandateLimitPct,
    custodyScore,
    recommendations,
  };
}

