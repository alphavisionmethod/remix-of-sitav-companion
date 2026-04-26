// ═══════════════════════════════════════════════════════════════
// SITA OS — Finance OS: Regime Engine Service
// Market regime detection — enhances investment-office.service
// ═══════════════════════════════════════════════════════════════

import type { MarketRegimeResult } from "@/packages/finance-contracts/investment-office";

import type { RegimeHistory } from "@/domains/finance";

// Canonical type re-exports for backward compatibility.
// New code should import from `@/domains/finance` directly.
export type { RegimeHistory };

export function buildRegimeHistory(): RegimeHistory {
  const regimes = [
    { regime: "risk-off", startDate: "2024-08-01", endDate: "2024-11-15", durationDays: 106 },
    { regime: "transition", startDate: "2024-11-15", endDate: "2025-02-01", durationDays: 78 },
    { regime: "risk-on", startDate: "2025-02-01", endDate: "2025-09-15", durationDays: 226 },
    { regime: "transition", startDate: "2025-09-15", endDate: "2026-01-10", durationDays: 117 },
    { regime: "risk-on", startDate: "2026-01-10", durationDays: 83 },
  ];

  const avgDuration = Math.round(regimes.reduce((s, r) => s + r.durationDays, 0) / regimes.length);

  return {
    regimes,
    currentRegime: {
      currentRegime: "risk-on", confidence: 72,
      signals: [
        { indicator: "VIX", value: 18.5, interpretation: "Low volatility" },
        { indicator: "Yield Curve", value: 0.45, interpretation: "Positive slope" },
      ],
      suggestedPosture: "balanced",
      lastAssessedAt: new Date().toISOString(),
      previousRegime: "transition",
      transitionedAt: "2026-01-10T00:00:00.000Z",
    },
    avgRegimeDurationDays: avgDuration,
  };
}

export function shouldAdjustPosture(regime: MarketRegimeResult): { adjust: boolean; reason: string } {
  if (regime.confidence < 50) return { adjust: true, reason: "Low regime confidence — reduce risk exposure" };
  if (regime.currentRegime === "risk-off") return { adjust: true, reason: "Risk-off regime — shift to defensive posture" };
  return { adjust: false, reason: "Current posture aligned with regime" };
}

