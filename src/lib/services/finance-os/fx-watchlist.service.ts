// ═══════════════════════════════════════════════════════════════
// SITA OS — Finance OS: FX Watchlist Service
// Foreign exchange exposure monitoring
// ═══════════════════════════════════════════════════════════════

import type { FxExposureSummary } from "@/packages/finance-contracts/investment-office";

import type { FxAlert } from "@/domains/finance";

// Canonical type re-exports for backward compatibility.
// New code should import from `@/domains/finance` directly.
export type { FxAlert };

export function monitorFxExposure(exposure: FxExposureSummary): FxAlert[] {
  const alerts: FxAlert[] = [];

  for (const exp of exposure.exposures) {
    if (exp.currency !== exposure.baseCurrency && exp.percentOfPortfolio > 5 && !exp.hedged) {
      alerts.push({
        currency: exp.currency,
        type: "hedge-opportunity",
        message: `${exp.currency} unhedged at ${exp.percentOfPortfolio}% of portfolio`,
        severity: exp.percentOfPortfolio > 10 ? "warning" : "info",
        createdAt: new Date().toISOString(),
      });
    }
  }

  if (exposure.totalUnhedgedPercent > 15) {
    alerts.push({
      currency: "MULTI",
      type: "threshold-breach",
      message: `Total unhedged FX exposure at ${exposure.totalUnhedgedPercent}% — exceeds 15% threshold`,
      severity: "urgent",
      createdAt: new Date().toISOString(),
    });
  }

  return alerts;
}

