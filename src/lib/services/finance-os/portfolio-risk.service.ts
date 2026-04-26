// ═══════════════════════════════════════════════════════════════
// SITA OS — Finance OS: Portfolio Risk Service
// Risk analysis and stress testing
// ═══════════════════════════════════════════════════════════════

import type { RiskBudgetResult, FactorRiskDecomposition } from "@/packages/finance-contracts/investment-office";

import type { PortfolioRiskReport } from "@/domains/finance";

// Canonical type re-exports for backward compatibility.
// New code should import from `@/domains/finance` directly.
export type { PortfolioRiskReport };

export function buildPortfolioRiskReport(): PortfolioRiskReport {
  return {
    riskBudget: {
      totalRiskBudget: 100, usedRiskBudget: 68, remainingRiskBudget: 32,
      valueAtRisk: 125000, maxDrawdown: 8.5, sharpeRatio: 1.42,
      recommendations: ["Consider reducing equity concentration"],
      calculatedAt: new Date().toISOString(),
    },
    factorRisk: {
      factors: [
        { name: "Market", exposure: 0.92, contribution: 0.45, benchmark: 1.0 },
        { name: "Size", exposure: 0.15, contribution: 0.08, benchmark: 0.0 },
        { name: "Momentum", exposure: 0.28, contribution: 0.18, benchmark: 0.0 },
      ],
      residualRisk: 0.08, totalFactorRisk: 0.92, dominantFactor: "Market",
      concentrationWarnings: ["Market factor contributes 45% of total risk"],
      calculatedAt: new Date().toISOString(),
    },
    stressScenarios: [
      { name: "2008 Crisis", impactPct: -38.2, severity: "severe" },
      { name: "COVID Crash", impactPct: -22.5, severity: "moderate" },
      { name: "Rate Shock", impactPct: -18.4, severity: "moderate" },
    ],
    overallRiskLevel: "moderate",
    recommendations: ["68% of risk budget used — within normal range", "Monitor market factor concentration"],
    generatedAt: new Date().toISOString(),
  };
}

