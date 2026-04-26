// ═══════════════════════════════════════════════════════════════
// SITA OS — Income Quality Scoring Engine
// ═══════════════════════════════════════════════════════════════

import type { IncomeQualityScore, IncomeQualityDimension } from "@/packages/finance-contracts/advanced-intelligence";

import type { IncomeQualityInput } from "@/domains/finance";

// Canonical type re-exports for backward compatibility.
// New code should import from `@/domains/finance` directly.
export type { IncomeQualityInput };

export function computeIncomeQuality(input: IncomeQualityInput): IncomeQualityScore {
  const dimensions: IncomeQualityDimension[] = [
    {
      key: "recurring", label: "Recurring Reliability",
      score: Math.min(100, Math.round(input.recurringIncomePct * 1.1)),
      insight: input.recurringIncomePct >= 80 ? "Strong recurring base" : input.recurringIncomePct >= 50 ? "Moderate recurring income" : "Income heavily project-dependent",
    },
    {
      key: "concentration", label: "Client Concentration",
      score: Math.max(0, 100 - Math.round(input.topClientConcentrationPct * 1.2)),
      insight: input.topClientConcentrationPct > 60 ? "Dangerous concentration — single client loss is devastating" : input.topClientConcentrationPct > 40 ? "Moderate concentration risk" : "Well-diversified income sources",
    },
    {
      key: "seasonality", label: "Seasonality",
      score: Math.max(0, 100 - Math.round(input.seasonalVariationPct * 2)),
      insight: input.seasonalVariationPct > 30 ? "High seasonal swings — plan reserves accordingly" : "Relatively stable across months",
    },
    {
      key: "payment-delay", label: "Payment Reliability",
      score: Math.max(0, 100 - input.avgPaymentDelayDays * 3),
      insight: input.avgPaymentDelayDays > 21 ? "Significant payment delays — cash timing risk" : input.avgPaymentDelayDays > 10 ? "Some payment lag" : "Payments received promptly",
    },
    {
      key: "one-time", label: "One-Time Dependency",
      score: Math.max(0, 100 - Math.round(input.oneTimeIncomePct * 1.5)),
      insight: input.oneTimeIncomePct > 40 ? "Heavy reliance on one-time income" : "Low one-time dependency",
    },
    {
      key: "household-unstable", label: "Household Stability",
      score: Math.max(0, 100 - Math.round(input.householdDependencyOnUnstablePct * 1.3)),
      insight: input.householdDependencyOnUnstablePct > 40 ? "Household heavily relies on unstable inflows" : "Household income base is stable",
    },
  ];

  const compositeScore = Math.round(dimensions.reduce((s, d) => s + d.score, 0) / dimensions.length);
  const grade = compositeScore >= 85 ? "A" : compositeScore >= 70 ? "B" : compositeScore >= 55 ? "C" : compositeScore >= 40 ? "D" : "F";
  const weakest = [...dimensions].sort((a, b) => a.score - b.score)[0];

  return {
    compositeScore, grade, dimensions,
    topRisk: weakest.label,
    recommendation: weakest.score < 50 ? `Address ${weakest.label.toLowerCase()} — ${weakest.insight}` : "Income quality is solid. Maintain diversification.",
  };
}
