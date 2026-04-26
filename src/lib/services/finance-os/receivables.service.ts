// ═══════════════════════════════════════════════════════════════
// SITA OS — Finance OS: Receivables Service
// AR tracking + aging analysis
// ═══════════════════════════════════════════════════════════════

import type { Receivable } from "@/packages/finance-contracts";

import type { ReceivableAgingReport } from "@/domains/finance";

// Canonical type re-exports for backward compatibility.
// New code should import from `@/domains/finance` directly.
export type { ReceivableAgingReport };

export function buildAgingReport(receivables: Receivable[]): ReceivableAgingReport {
  const outstanding = receivables.filter(r => r.status === "expected" || r.status === "overdue");
  const buckets = { current: { count: 0, totalCents: 0 }, thirtyDay: { count: 0, totalCents: 0 }, sixtyDay: { count: 0, totalCents: 0 }, ninetyPlus: { count: 0, totalCents: 0 } };

  for (const r of outstanding) {
    if (r.agingDays > 90) { buckets.ninetyPlus.count++; buckets.ninetyPlus.totalCents += r.amountCents; }
    else if (r.agingDays > 60) { buckets.sixtyDay.count++; buckets.sixtyDay.totalCents += r.amountCents; }
    else if (r.agingDays > 30) { buckets.thirtyDay.count++; buckets.thirtyDay.totalCents += r.amountCents; }
    else { buckets.current.count++; buckets.current.totalCents += r.amountCents; }
  }

  const totalAging = outstanding.reduce((s, r) => s + r.agingDays, 0);

  return {
    ...buckets,
    totalOutstandingCents: outstanding.reduce((s, r) => s + r.amountCents, 0),
    averageAgingDays: outstanding.length > 0 ? Math.round(totalAging / outstanding.length) : 0,
    generatedAt: new Date().toISOString(),
  };
}

export function flagOverdueReceivables(receivables: Receivable[], thresholdDays: number = 30): Receivable[] {
  return receivables.filter(r => r.status === "expected" && r.agingDays > thresholdDays);
}

