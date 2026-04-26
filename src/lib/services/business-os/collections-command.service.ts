// ═══════════════════════════════════════════════════════════════
// SITA OS — Business OS: Collections Command Service
// Escalation logic for overdue accounts
// ═══════════════════════════════════════════════════════════════

import type { Invoice, CollectionsEscalationPacket } from "@/domains/business";

export function buildEscalationQueue(invoices: Invoice[]): CollectionsEscalationPacket[] {
  return invoices
    .filter(inv => inv.status === "overdue")
    .map(inv => {
      const agingDays = Math.floor((Date.now() - new Date(inv.dueDate).getTime()) / 86400000);
      let level: 1 | 2 | 3 = 1;
      let action: CollectionsEscalationPacket["recommendedAction"] = "final-notice";

      if (agingDays > 90) { level = 3; action = "legal-review"; }
      else if (agingDays > 60) { level = 2; action = "payment-plan"; }
      else if (agingDays > 30) { level = 1; action = "final-notice"; }

      return {
        id: `esc-${inv.id}`, invoiceId: inv.id, accountId: inv.accountId, accountName: "",
        outstandingCents: inv.amount * 100, agingDays,
        agingBucket: agingDays > 90 ? "90-plus" as const : agingDays > 60 ? "60-day" as const : "30-day" as const,
        previousAttempts: Math.min(agingDays / 15, 5), escalationLevel: level,
        recommendedAction: action, approvalRequired: level >= 2,
        createdAt: new Date().toISOString(), status: "pending" as const,
      };
    })
    .sort((a, b) => b.agingDays - a.agingDays);
}

export function computeCollectionsKpis(packets: CollectionsEscalationPacket[]) {
  return {
    totalOutstandingCents: packets.reduce((s, p) => s + p.outstandingCents, 0),
    activeEscalations: packets.length,
    level1Count: packets.filter(p => p.escalationLevel === 1).length,
    level2Count: packets.filter(p => p.escalationLevel === 2).length,
    level3Count: packets.filter(p => p.escalationLevel === 3).length,
    requiresApproval: packets.filter(p => p.approvalRequired).length,
  };
}

