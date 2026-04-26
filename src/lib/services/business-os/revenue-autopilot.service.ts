// ═══════════════════════════════════════════════════════════════
// SITA OS — Business OS: Revenue Autopilot Service
// ═══════════════════════════════════════════════════════════════

import type {
  Invoice,
  RevenueLeakRecord,
  RevenueAutopilotKpiSummary,
  CollectionsEscalationPacket,
} from "@/domains/business";

export function detectLeaks(invoices: Invoice[]): RevenueLeakRecord[] {
  return invoices.filter(inv => inv.status === "overdue").map(inv => {
    const agingDays = Math.floor((Date.now() - new Date(inv.dueDate).getTime()) / 86400000);
    return {
      id: `leak-${inv.id}`, category: "uncollected-invoice" as const, entityId: inv.id, entityType: "invoice" as const,
      leakAmountCents: inv.amount * 100, detectedAt: new Date().toISOString(),
      confidence: Math.min(95, 60 + agingDays),
      description: `Invoice overdue by ${agingDays} days — $${inv.amount.toFixed(2)} outstanding`,
      suggestedRecoveryAction: agingDays > 60 ? "Escalate to collections" : "Send reminder",
      status: "detected" as const,
    };
  });
}

export function buildCollectionsEscalation(inv: Invoice): CollectionsEscalationPacket {
  const agingDays = Math.floor((Date.now() - new Date(inv.dueDate).getTime()) / 86400000);
  let level: 1 | 2 | 3 = 1;
  let action: CollectionsEscalationPacket["recommendedAction"] = "final-notice";
  if (agingDays > 90) { level = 3; action = "legal-review"; }
  else if (agingDays > 60) { level = 2; action = "payment-plan"; }

  return {
    id: `esc-${inv.id}`, invoiceId: inv.id, accountId: inv.accountId, accountName: "",
    outstandingCents: inv.amount * 100, agingDays, agingBucket: agingDays > 90 ? "90-plus" : agingDays > 60 ? "60-day" : "30-day",
    previousAttempts: 0, escalationLevel: level, recommendedAction: action,
    approvalRequired: level >= 2, createdAt: new Date().toISOString(), status: "pending",
  };
}

export function computeKpiSummary(leaks: RevenueLeakRecord[], period: string): RevenueAutopilotKpiSummary {
  const totalLeaks = leaks.reduce((sum, l) => sum + l.leakAmountCents, 0);
  const recovered = leaks.filter(l => l.status === "recovered");
  const totalRecovered = recovered.reduce((sum, l) => sum + (l.recoveredCents || 0), 0);

  return {
    period, totalLeaksDetectedCents: totalLeaks, totalRecoveredCents: totalRecovered,
    recoveryRate: totalLeaks > 0 ? Math.round((totalRecovered / totalLeaks) * 100) : 0,
    activeRecoveryPlans: leaks.filter(l => l.status === "in-recovery").length,
    completedRecoveryPlans: recovered.length, noShowCount: 0, noShowRecoveryRate: 0,
    collectionsEscalations: leaks.filter(l => l.category === "uncollected-invoice").length,
    avgRecoveryTimeDays: 14,
    topLeakCategories: [{ category: "uncollected-invoice", amountCents: totalLeaks, count: leaks.length }],
    generatedAt: new Date().toISOString(),
  };
}

