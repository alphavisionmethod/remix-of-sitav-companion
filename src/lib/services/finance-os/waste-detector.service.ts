// ═══════════════════════════════════════════════════════════════
// SITA OS — Finance OS: Waste Detector Service
// Identifies unused/underutilized subscriptions
// ═══════════════════════════════════════════════════════════════

import type { SubscriptionRecord } from "@/packages/finance-contracts";
import type { WasteReport } from "@/domains/finance";

// Canonical type re-export for backward compatibility.
// New code should import from `@/domains/finance` directly.
export type { WasteReport };

export function buildWasteReport(subscriptions: SubscriptionRecord[]): WasteReport {
  const opportunities = subscriptions
    .filter(s => s.isWaste && s.status === "active")
    .map(s => ({
      subscriptionId: s.id,
      name: s.name,
      monthlyCostCents: s.frequency === "annually" ? Math.round(s.amountCents / 12) : s.amountCents,
      annualSavingsCents: s.savingsIfCancelled,
      reason: s.wasteReason || "Low usage detected",
      confidence: 75,
      detectedAt: new Date().toISOString(),
    }));

  const totalAnnual = opportunities.reduce((s, o) => s + o.annualSavingsCents, 0);
  const categoryCount = new Map<string, number>();
  subscriptions.filter(s => s.isWaste).forEach(s => {
    categoryCount.set(s.category, (categoryCount.get(s.category) || 0) + 1);
  });
  const topCategory = Array.from(categoryCount.entries()).sort(([, a], [, b]) => b - a)[0]?.[0] || "none";

  return {
    totalWasteAnnualCents: totalAnnual,
    totalWasteMonthCents: Math.round(totalAnnual / 12),
    opportunities,
    topCategory,
    actionableCount: opportunities.length,
    generatedAt: new Date().toISOString(),
  };
}

