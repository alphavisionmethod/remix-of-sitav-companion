// ═══════════════════════════════════════════════════════════════
// SITA OS — Finance OS: Due Soon Alerts Service
// ═══════════════════════════════════════════════════════════════

import type { ObligationRecord } from "@/packages/finance-contracts";

import type { DueSoonAlert } from "@/domains/finance";

// Canonical type re-exports for backward compatibility.
// New code should import from `@/domains/finance` directly.
export type { DueSoonAlert };

export function generateDueSoonAlerts(obligations: ObligationRecord[], lookaheadDays: number = 7): DueSoonAlert[] {
  const now = Date.now();
  return obligations
    .filter(o => o.status === "upcoming" || o.status === "due")
    .map(o => {
      const dueTime = new Date(o.nextDueDate).getTime();
      const daysUntilDue = Math.floor((dueTime - now) / 86400000);
      if (daysUntilDue > lookaheadDays || daysUntilDue < -30) return null;

      let severity: DueSoonAlert["severity"] = "info";
      if (daysUntilDue <= 0) severity = "urgent";
      else if (daysUntilDue <= 2) severity = "warning";

      const message = daysUntilDue <= 0
        ? `${o.name} is overdue by ${Math.abs(daysUntilDue)} day(s)`
        : daysUntilDue === 0
        ? `${o.name} is due today`
        : `${o.name} due in ${daysUntilDue} day(s)`;

      return {
        obligationId: o.id,
        name: o.name,
        amountCents: o.amountCents,
        dueDate: o.nextDueDate,
        daysUntilDue,
        severity,
        hasAutoPay: o.autoPay,
        message,
      };
    })
    .filter(Boolean) as DueSoonAlert[];
}

export function countUpcomingTotal(alerts: DueSoonAlert[]): number {
  return alerts.reduce((s, a) => s + a.amountCents, 0);
}

