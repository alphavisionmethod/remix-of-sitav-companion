// ═══════════════════════════════════════════════════════════════
// SITA OS — Finance OS: Subscription Waste Detection
// ═══════════════════════════════════════════════════════════════

import type { SubscriptionRecord, WasteOpportunity } from "@/packages/finance-contracts";
import type { RenewalRisk } from "@/packages/finance-contracts/subscriptions";

export function detectWaste(subscriptions: SubscriptionRecord[]): WasteOpportunity[] {
  return subscriptions
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
}

export function assessRenewalRisks(subscriptions: SubscriptionRecord[]): RenewalRisk[] {
  return subscriptions
    .filter(s => s.status === "active")
    .map(s => {
      const daysUntilRenewal = 30; // simplified
      let riskLevel: RenewalRisk["riskLevel"] = "underutilized";
      let recommendedAction: RenewalRisk["recommendedAction"] = "review";

      if (s.isWaste) {
        riskLevel = "auto-renew-waste";
        recommendedAction = "cancel";
      }

      return {
        subscriptionId: s.id,
        name: s.name,
        renewalDate: s.lastChargeDate,
        daysUntilRenewal,
        annualCostCents: s.frequency === "annually" ? s.amountCents : s.amountCents * 12,
        usageScore: s.isWaste ? 20 : 70,
        alternativesAvailable: false,
        riskLevel,
        recommendedAction,
        potentialSavingsCents: s.savingsIfCancelled,
        detectedAt: new Date().toISOString(),
      };
    });
}

export function computeTotalWaste(opportunities: WasteOpportunity[]): number {
  return opportunities.reduce((sum, o) => sum + o.annualSavingsCents, 0);
}
