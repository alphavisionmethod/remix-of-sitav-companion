// ═══════════════════════════════════════════════════════════════
// SITA OS — Finance OS: Committee Boardroom Inputs Service
// Investment committee briefing data
// ═══════════════════════════════════════════════════════════════

import type { CommitteeBriefing } from "@/domains/finance";

// Canonical type re-exports for backward compatibility.
// New code should import from `@/domains/finance` directly.
export type { CommitteeBriefing };

export function buildCommitteeBriefing(): CommitteeBriefing {
  return {
    sessionDate: new Date().toISOString(),
    marketSummary: "Risk-on regime continues. VIX at 18.5, yield curve positive. No immediate stress signals.",
    portfolioHighlights: [
      "Portfolio up 3.2% QTD vs benchmark 2.8%",
      "Equities underweight by 5% — rebalance recommended",
      "Real estate overweight by 3% — consider trimming",
    ],
    riskAlerts: [
      "Market factor contributes 45% of total risk — concentration risk",
      "Crypto at 5% — within 10% mandate limit",
    ],
    pendingDecisions: [
      { topic: "NVDA position increase", urgency: "medium", deadline: new Date(Date.now() + 7 * 86400000).toISOString() },
      { topic: "Q2 rebalance execution", urgency: "high", deadline: new Date(Date.now() + 14 * 86400000).toISOString() },
    ],
    performanceSummary: {
      period: "Q1 2026",
      returnPct: 3.2,
      benchmarkPct: 2.8,
      alpha: 0.4,
    },
    generatedAt: new Date().toISOString(),
  };
}

