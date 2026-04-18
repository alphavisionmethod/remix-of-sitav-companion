// ═══════════════════════════════════════════════════════════════
// SITA OS — Cross-Domain Event Registry
// Maps all canonical cross-domain event flows
// ═══════════════════════════════════════════════════════════════

import type { DomainId } from "@/packages/contracts/_contract-scaffold";

export interface CrossDomainEventFlow {
  id: string;
  sourceEvent: string;
  sourceDomain: DomainId;
  targetEvent: string;
  targetDomain: DomainId;
  description: string;
  consequence: string;
  bidirectional: boolean;
  priority: "low" | "medium" | "high" | "critical";
}

export const crossDomainEventFlows: CrossDomainEventFlow[] = [
  // Business → Finance
  { id: "biz-fin-invoice-paid", sourceEvent: "invoice.paid", sourceDomain: "business", targetEvent: "receivable.collected", targetDomain: "finance", description: "Invoice payment reconciliation", consequence: "Finance receivable marked collected, cash position updated", bidirectional: false, priority: "high" },
  { id: "biz-fin-deal-won", sourceEvent: "opportunity.won", sourceDomain: "business", targetEvent: "projection.update", targetDomain: "finance", description: "Deal close updates financial projections", consequence: "Revenue forecast adjusted, cash flow projection recalculated", bidirectional: false, priority: "high" },
  { id: "biz-fin-quote-accepted", sourceEvent: "quote.accepted", sourceDomain: "business", targetEvent: "receivable.create", targetDomain: "finance", description: "Accepted quote creates expected receivable", consequence: "New receivable tracked in finance", bidirectional: false, priority: "medium" },

  // Business → Concierge
  { id: "biz-con-booking", sourceEvent: "booking.created", sourceDomain: "business", targetEvent: "calendar.block", targetDomain: "concierge", description: "Business booking blocks personal calendar", consequence: "Concierge calendar shows blocked time, prevents conflicts", bidirectional: false, priority: "medium" },

  // Finance → Business
  { id: "fin-biz-payment", sourceEvent: "payment.executed", sourceDomain: "finance", targetEvent: "invoice.status-update", targetDomain: "business", description: "Payment execution updates invoice status", consequence: "Invoice marked as paid in business OS", bidirectional: false, priority: "high" },

  // Finance → Concierge
  { id: "fin-con-budget", sourceEvent: "cashflow.projected", sourceDomain: "finance", targetEvent: "budget.update", targetDomain: "concierge", description: "Cash flow projections update concierge spending limits", consequence: "Concierge aware of available discretionary spending", bidirectional: false, priority: "low" },

  // Concierge → Finance
  { id: "con-fin-travel", sourceEvent: "travel.booked", sourceDomain: "concierge", targetEvent: "projection.expense-added", targetDomain: "finance", description: "Travel booking creates expected expense", consequence: "Finance projections include upcoming travel cost", bidirectional: false, priority: "high" },
  { id: "con-fin-grocery", sourceEvent: "grocery.ordered", sourceDomain: "concierge", targetEvent: "transaction.auto-categorize", targetDomain: "finance", description: "Grocery order auto-categorizes in finance", consequence: "Transaction pre-categorized as groceries", bidirectional: false, priority: "low" },
  { id: "con-fin-maintenance", sourceEvent: "maintenance.completed", sourceDomain: "concierge", targetEvent: "expense.recorded", targetDomain: "finance", description: "Maintenance cost recorded in finance", consequence: "Expense logged under home maintenance category", bidirectional: false, priority: "medium" },

  // Concierge → Business
  { id: "con-biz-travel-block", sourceEvent: "travel.booked", sourceDomain: "concierge", targetEvent: "calendar.block", targetDomain: "business", description: "Personal travel blocks business calendar", consequence: "Business bookings prevented during travel dates", bidirectional: false, priority: "medium" },

  // Any → Boardroom (escalation paths)
  { id: "biz-board-deal", sourceEvent: "deal.high-value", sourceDomain: "business", targetEvent: "boardroom.item-created", targetDomain: "cross-domain", description: "High-value deal escalated to boardroom", consequence: "Boardroom item created for strategic review", bidirectional: false, priority: "high" },
  { id: "fin-board-anomaly", sourceEvent: "anomaly.detected", sourceDomain: "finance", targetEvent: "boardroom.item-created", targetDomain: "cross-domain", description: "Financial anomaly escalated", consequence: "Boardroom reviews spending anomaly with evidence", bidirectional: false, priority: "critical" },
  { id: "fin-board-reserve", sourceEvent: "reserve.critical", sourceDomain: "finance", targetEvent: "boardroom.item-created", targetDomain: "cross-domain", description: "Reserve crisis escalated", consequence: "Boardroom convened for emergency reserve review", bidirectional: false, priority: "critical" },

  // Platform → All
  { id: "plat-all-approval-completed", sourceEvent: "approval.decided", sourceDomain: "platform", targetEvent: "workflow.resume", targetDomain: "cross-domain", description: "Approval decision resumes blocked workflow", consequence: "Waiting workflow step proceeds or rolls back", bidirectional: false, priority: "high" },
  { id: "plat-all-file-routed", sourceEvent: "file.classified", sourceDomain: "platform", targetEvent: "domain.file-received", targetDomain: "cross-domain", description: "Classified file routed to domain", consequence: "Domain receives file with classification metadata", bidirectional: false, priority: "medium" },
];

// ── Helpers ──

export function getEventsForDomain(domainId: DomainId): CrossDomainEventFlow[] {
  return crossDomainEventFlows.filter(
    (e) => e.sourceDomain === domainId || e.targetDomain === domainId
  );
}

export function getEmittedEvents(domainId: DomainId): CrossDomainEventFlow[] {
  return crossDomainEventFlows.filter((e) => e.sourceDomain === domainId);
}

export function getConsumedEvents(domainId: DomainId): CrossDomainEventFlow[] {
  return crossDomainEventFlows.filter((e) => e.targetDomain === domainId);
}
