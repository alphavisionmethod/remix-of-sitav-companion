// ═══════════════════════════════════════════════════════════════
// SITA OS — Finance OS: Liquidity Service
// Liquidity planning and stress testing
// ═══════════════════════════════════════════════════════════════

import type { LiquiditySummary } from "@/packages/finance-contracts/family-office/types";
import type { FinancialAccount } from "@/packages/finance-contracts";

export function computeLiquidity(accounts: FinancialAccount[]): LiquiditySummary {
  const immediate = accounts.filter(a => a.type === "checking").reduce((s, a) => s + a.availableCents, 0);
  const savings = accounts.filter(a => a.type === "savings").reduce((s, a) => s + a.availableCents, 0);
  const investments = accounts.filter(a => a.type === "investment").reduce((s, a) => s + a.availableCents, 0);
  const locked = accounts.filter(a => a.type === "retirement").reduce((s, a) => s + a.balanceCents, 0);

  const total = immediate + savings + investments + locked;
  const liquid = immediate + savings + investments;
  const ratio = total > 0 ? liquid / total : 1;

  const recommendations: string[] = [];
  if (ratio < 0.3) recommendations.push("Liquidity critically low — increase liquid holdings");
  if (immediate < 1000000) recommendations.push("Checking balance low — ensure operating cash coverage");

  return {
    immediateLiquidCents: immediate,
    within30DaysCents: immediate + savings,
    within90DaysCents: liquid,
    lockedCents: locked,
    totalCents: total,
    liquidityRatio: Math.round(ratio * 100) / 100,
    stressTestResult: ratio > 0.5 ? "pass" : ratio > 0.3 ? "marginal" : "fail",
    recommendations,
    calculatedAt: new Date().toISOString(),
  };
}

export function runLiquidityStressTest(accounts: FinancialAccount[], shockPercent: number = 30): LiquiditySummary {
  const shocked = accounts.map(a => ({
    ...a,
    availableCents: a.type === "investment" ? Math.round(a.availableCents * (1 - shockPercent / 100)) : a.availableCents,
  }));
  return computeLiquidity(shocked);
}

