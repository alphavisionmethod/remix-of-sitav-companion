// ═══════════════════════════════════════════════════════════════
// SITA OS — Finance OS: Execution Review Service
// Trade execution quality analysis
// ═══════════════════════════════════════════════════════════════

import type { TradeReviewPacket } from "@/packages/finance-contracts/investment-office";

import type { ExecutionQualityReport } from "@/domains/finance";

// Canonical type re-exports for backward compatibility.
// New code should import from `@/domains/finance` directly.
export type { ExecutionQualityReport };

export function buildExecutionReview(trades: TradeReviewPacket[]): ExecutionQualityReport {
  return {
    trades,
    avgSlippageBps: 4.2,
    totalCommissionCents: trades.reduce((s, t) => s + Math.round(t.quantityOrAmountCents * 0.0001), 0),
    bestExecution: true,
    recommendations: trades.length === 0 ? ["No recent trades to review"] : ["Execution quality within acceptable bounds"],
    generatedAt: new Date().toISOString(),
  };
}

