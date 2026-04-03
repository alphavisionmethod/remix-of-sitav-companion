// ═══════════════════════════════════════════════════════════════
// SITA OS — Finance OS: Investment Overview Service
// High-level investment portfolio summary
// ═══════════════════════════════════════════════════════════════

import type { InvestmentSummary, AssetAllocation } from "@/packages/finance-contracts";

export function buildInvestmentOverview(): InvestmentSummary {
  return {
    totalValueCents: 250000000,
    totalCostBasisCents: 210000000,
    totalGainLossCents: 40000000,
    returnPercent: 19.05,
    allocations: [
      { assetClass: "Equities", valueCents: 125000000, percentOfPortfolio: 50, targetPercent: 55, drift: -5 },
      { assetClass: "Fixed Income", valueCents: 62500000, percentOfPortfolio: 25, targetPercent: 25, drift: 0 },
      { assetClass: "Real Estate", valueCents: 37500000, percentOfPortfolio: 15, targetPercent: 12, drift: 3 },
      { assetClass: "Cash", valueCents: 25000000, percentOfPortfolio: 10, targetPercent: 8, drift: 2 },
    ],
    lastUpdated: new Date().toISOString(),
  };
}

export function computeAllocationDrift(allocations: AssetAllocation[]): { totalDrift: number; maxDriftClass: string; rebalanceNeeded: boolean } {
  const totalDrift = allocations.reduce((s, a) => s + Math.abs(a.drift), 0);
  const maxDrift = allocations.sort((a, b) => Math.abs(b.drift) - Math.abs(a.drift))[0];
  return { totalDrift, maxDriftClass: maxDrift?.assetClass || "none", rebalanceNeeded: totalDrift > 10 };
}
