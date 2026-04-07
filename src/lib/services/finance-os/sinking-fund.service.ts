// ═══════════════════════════════════════════════════════════════
// SITA OS — Finance OS: Sinking Fund Service
// Individual sinking fund management and projections
// ═══════════════════════════════════════════════════════════════

import type { SinkingFund } from "@/packages/finance-contracts/reserves";

export function createSinkingFund(name: string, targetCents: number, targetDate: string, category: SinkingFund["category"], purpose: string): SinkingFund {
  const monthsRemaining = Math.max(1, Math.ceil((new Date(targetDate).getTime() - Date.now()) / (30 * 86400000)));
  const monthlyContribution = Math.ceil(targetCents / monthsRemaining);

  return {
    id: `sf-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name,
    targetCents,
    currentCents: 0,
    targetDate,
    monthlyContributionCents: monthlyContribution,
    purpose,
    category,
    onTrack: true,
    projectedShortfallCents: 0,
    createdAt: new Date().toISOString(),
  };
}

export function assessFundProgress(fund: SinkingFund): SinkingFund {
  const monthsRemaining = Math.max(1, Math.ceil((new Date(fund.targetDate).getTime() - Date.now()) / (30 * 86400000)));
  const projected = fund.currentCents + fund.monthlyContributionCents * monthsRemaining;
  const shortfall = Math.max(0, fund.targetCents - projected);

  return {
    ...fund,
    onTrack: shortfall === 0,
    projectedShortfallCents: shortfall,
  };
}

export function recommendContributionAdjustment(fund: SinkingFund): { adjustedContributionCents: number; reason: string } | null {
  const monthsRemaining = Math.max(1, Math.ceil((new Date(fund.targetDate).getTime() - Date.now()) / (30 * 86400000)));
  const remaining = fund.targetCents - fund.currentCents;
  const needed = Math.ceil(remaining / monthsRemaining);

  if (needed > fund.monthlyContributionCents * 1.1) {
    return { adjustedContributionCents: needed, reason: `Increase from $${(fund.monthlyContributionCents / 100).toFixed(0)} to $${(needed / 100).toFixed(0)}/mo to stay on track` };
  }
  return null;
}

