// ═══════════════════════════════════════════════════════════════
// SITA OS — Money Projection Service
// Cash position + obligations + reserves
// ═══════════════════════════════════════════════════════════════

export interface MoneyProjection {
  timestamp: string;
  cashPosition: { totalCents: number; checking: number; savings: number; investments: number };
  obligations: { dueSoonCents: number; overdueCount: number; recurringMonthlyCents: number };
  reserves: { targetCents: number; currentCents: number; fundedPct: number };
  safeToSpend: number;
  subscriptionWaste: { totalMonthlyCents: number; flaggedCount: number };
  burnMultiple: number;
  runwayMonths: number;
}

export function generateMoneyProjection(): MoneyProjection {
  const checking = 14500000;
  const savings = 8700000;
  const investments = 24300000;
  const recurringMonthly = 4200000;
  const reserveTarget = 12600000;
  const reserveCurrent = 8700000;

  return {
    timestamp: new Date().toISOString(),
    cashPosition: { totalCents: checking + savings + investments, checking, savings, investments },
    obligations: { dueSoonCents: 345000, overdueCount: 1, recurringMonthlyCents: recurringMonthly },
    reserves: { targetCents: reserveTarget, currentCents: reserveCurrent, fundedPct: (reserveCurrent / reserveTarget) * 100 },
    safeToSpend: checking - recurringMonthly - (reserveTarget - reserveCurrent),
    subscriptionWaste: { totalMonthlyCents: 12500, flaggedCount: 3 },
    burnMultiple: 2.4,
    runwayMonths: Math.floor((checking + savings) / recurringMonthly),
  };
}

