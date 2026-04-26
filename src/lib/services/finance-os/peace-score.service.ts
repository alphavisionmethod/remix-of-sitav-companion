// ═══════════════════════════════════════════════════════════════
// SITA OS — Financial Peace Score Engine
// Emotional + practical composite distinct from Health Pulse
// ═══════════════════════════════════════════════════════════════

import type { PeaceScoreResult, PeaceScoreDimension } from "@/packages/finance-contracts/advanced-intelligence";

import type { PeaceScoreInput } from "@/domains/finance";

// Canonical type re-exports for backward compatibility.
// New code should import from `@/domains/finance` directly.
export type { PeaceScoreInput };

function dimStatus(score: number): "strong" | "adequate" | "weak" | "critical" {
  if (score >= 80) return "strong";
  if (score >= 60) return "adequate";
  if (score >= 40) return "weak";
  return "critical";
}

export function computePeaceScore(input: PeaceScoreInput): PeaceScoreResult {
  const dimensions: PeaceScoreDimension[] = [
    {
      key: "reserves", label: "Reserve Strength", weight: 18,
      score: Math.min(100, input.reserveFundedPct),
      status: dimStatus(input.reserveFundedPct),
      insight: input.reserveFundedPct >= 80 ? "Well-protected against emergencies" : "Emergency fund needs attention",
    },
    {
      key: "bills", label: "Bill Safety", weight: 15,
      score: Math.min(100, input.billsCoveredPct),
      status: dimStatus(input.billsCoveredPct),
      insight: input.billsCoveredPct >= 100 ? "All upcoming bills fully covered" : "Some bills at risk of insufficient funds",
    },
    {
      key: "debt", label: "Debt Burden", weight: 15,
      score: Math.max(0, 100 - Math.round(input.debtToIncomeRatio * 250)),
      status: dimStatus(Math.max(0, 100 - Math.round(input.debtToIncomeRatio * 250))),
      insight: input.debtToIncomeRatio < 0.2 ? "Debt well under control" : input.debtToIncomeRatio < 0.36 ? "Manageable debt load" : "Debt pressure is concerning",
    },
    {
      key: "tax", label: "Tax Preparedness", weight: 12,
      score: Math.min(100, input.taxReservedPct),
      status: dimStatus(input.taxReservedPct),
      insight: input.taxReservedPct >= 90 ? "Tax obligations well-reserved" : "Tax set-aside needs topping up",
    },
    {
      key: "income", label: "Income Predictability", weight: 12,
      score: input.incomeStabilityScore,
      status: dimStatus(input.incomeStabilityScore),
      insight: input.incomeStabilityScore >= 70 ? "Income streams are reliable" : "Income variability creates uncertainty",
    },
    {
      key: "obligations", label: "Obligation Pressure", weight: 10,
      score: Math.max(0, 100 - Math.round(input.obligationPressurePct)),
      status: dimStatus(Math.max(0, 100 - Math.round(input.obligationPressurePct))),
      insight: input.obligationPressurePct < 50 ? "Healthy room beyond obligations" : "Fixed obligations consume most income",
    },
    {
      key: "breathing", label: "Breathing Room", weight: 10,
      score: Math.min(100, Math.round(input.discretionaryRoomPct * 3.3)),
      status: dimStatus(Math.min(100, Math.round(input.discretionaryRoomPct * 3.3))),
      insight: input.discretionaryRoomPct >= 20 ? "Good discretionary flexibility" : "Very tight discretionary room",
    },
    {
      key: "household", label: "Household Coordination", weight: 8,
      score: input.householdCoordinationScore,
      status: dimStatus(input.householdCoordinationScore),
      insight: input.householdCoordinationScore >= 70 ? "Household finances well-coordinated" : "Household alignment needs work",
    },
  ];

  const totalWeight = dimensions.reduce((s, d) => s + d.weight, 0);
  const compositeScore = Math.round(dimensions.reduce((s, d) => s + d.score * d.weight, 0) / totalWeight);
  const grade = compositeScore >= 85 ? "A" : compositeScore >= 70 ? "B" : compositeScore >= 55 ? "C" : compositeScore >= 40 ? "D" : "F";

  const sorted = [...dimensions].sort((a, b) => b.score - a.score);
  const weakest = [...dimensions].sort((a, b) => a.score - b.score)[0];

  return {
    compositeScore, grade,
    trend: compositeScore >= 70 ? "improving" : compositeScore >= 50 ? "stable" : "declining",
    dimensions,
    topStrength: sorted[0].label,
    topWeakness: weakest.label,
    guidance: compositeScore >= 80
      ? "Your financial life is well-organized. Maintain your rhythm."
      : compositeScore >= 60
      ? `Focus on strengthening ${weakest.label.toLowerCase()} to reach the next level.`
      : `Priority: stabilize ${weakest.label.toLowerCase()} and ${sorted[sorted.length - 2].label.toLowerCase()}.`,
  };
}
