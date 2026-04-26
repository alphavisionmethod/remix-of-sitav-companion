// ═══════════════════════════════════════════════════════════════
// SITA OS — Finance OS: Renewal Risk Service
// Scores upcoming subscription renewals for risk
// ═══════════════════════════════════════════════════════════════

import type { SubscriptionRecord } from "@/packages/finance-contracts";
import type { RenewalRisk } from "@/packages/finance-contracts/subscriptions/renewal-risk";
import type { RenewalRiskReport } from "@/domains/finance";

// Canonical type re-export for backward compatibility.
// New code should import from `@/domains/finance` directly.
export type { RenewalRiskReport };

export function buildRenewalRiskReport(subscriptions: SubscriptionRecord[]): RenewalRiskReport {
  const risks = subscriptions.filter(s => s.status === "active").map(s => {
    const daysUntilRenewal = 30; // simplified
    let riskLevel: RenewalRisk["riskLevel"] = "underutilized";
    let recommendedAction: RenewalRisk["recommendedAction"] = "review";
    let potentialSavings = 0;

    if (s.isWaste) {
      riskLevel = "auto-renew-waste";
      recommendedAction = "cancel";
      potentialSavings = s.savingsIfCancelled;
    } else if (daysUntilRenewal < 14) {
      riskLevel = "price-increase";
      recommendedAction = "negotiate";
    }

    return {
      subscriptionId: s.id, name: s.name, renewalDate: s.lastChargeDate,
      daysUntilRenewal, annualCostCents: s.frequency === "annually" ? s.amountCents : s.amountCents * 12,
      usageScore: s.isWaste ? 20 : 70, alternativesAvailable: false,
      riskLevel, recommendedAction, potentialSavingsCents: potentialSavings,
      detectedAt: new Date().toISOString(),
    };
  });

  return {
    risks,
    totalPotentialSavingsCents: risks.reduce((s, r) => s + r.potentialSavingsCents, 0),
    highRiskCount: risks.filter(r => r.riskLevel === "auto-renew-waste").length,
    upcomingRenewals30Days: risks.filter(r => r.daysUntilRenewal <= 30).length,
    generatedAt: new Date().toISOString(),
  };
}

