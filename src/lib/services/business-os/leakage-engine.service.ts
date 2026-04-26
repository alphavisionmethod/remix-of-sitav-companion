// ═══════════════════════════════════════════════════════════════
// SITA OS — Business OS: Revenue Leakage Engine
// Detects revenue leaks across all channels
// ═══════════════════════════════════════════════════════════════

import type { Invoice, RevenueLeakRecord } from "@/domains/business";

export function detectLeakageComprehensive(invoices: Invoice[]): RevenueLeakRecord[] {
  const leaks: RevenueLeakRecord[] = [];

  // Overdue invoices
  invoices.filter(inv => inv.status === "overdue").forEach(inv => {
    const agingDays = Math.floor((Date.now() - new Date(inv.dueDate).getTime()) / 86400000);
    leaks.push({
      id: `leak-inv-${inv.id}`, category: "uncollected-invoice", entityId: inv.id, entityType: "invoice",
      leakAmountCents: inv.amount * 100, detectedAt: new Date().toISOString(),
      confidence: Math.min(95, 60 + agingDays),
      description: `Invoice ${inv.id} overdue ${agingDays} days — $${inv.amount.toFixed(2)}`,
      suggestedRecoveryAction: agingDays > 60 ? "Escalate to collections" : "Send automated reminder",
      status: "detected",
    });
  });

  // Underpriced deals (invoices significantly below average)
  const avgAmount = invoices.reduce((s, i) => s + i.amount, 0) / (invoices.length || 1);
  invoices.filter(inv => inv.amount < avgAmount * 0.5 && inv.status === "paid").forEach(inv => {
    leaks.push({
      id: `leak-price-${inv.id}`, category: "uncollected-invoice", entityId: inv.id, entityType: "invoice",
      leakAmountCents: Math.round((avgAmount - inv.amount) * 0.5 * 100),
      detectedAt: new Date().toISOString(), confidence: 45,
      description: `Invoice $${inv.amount} is 50%+ below average ($${avgAmount.toFixed(0)})`,
      suggestedRecoveryAction: "Review pricing for this account",
      status: "detected",
    });
  });

  return leaks;
}

