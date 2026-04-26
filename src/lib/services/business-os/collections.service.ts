// ═══════════════════════════════════════════════════════════════
// SITA OS — Business OS: Collections Service
// Invoice collections workflow management
// ═══════════════════════════════════════════════════════════════

import type { Invoice } from "@/domains/business";

export interface CollectionsStatus {
  invoiceId: string;
  agingDays: number;
  agingBucket: "current" | "30-day" | "60-day" | "90-plus";
  attemptCount: number;
  lastAttemptAt: string | null;
  nextAction: string;
  status: "active" | "resolved" | "written-off";
}

export function categorizeByAging(invoices: Invoice[]): Record<string, Invoice[]> {
  const buckets: Record<string, Invoice[]> = { current: [], "30-day": [], "60-day": [], "90-plus": [] };
  for (const inv of invoices.filter(i => i.status === "overdue")) {
    const days = Math.floor((Date.now() - new Date(inv.dueDate).getTime()) / 86400000);
    if (days > 90) buckets["90-plus"].push(inv);
    else if (days > 60) buckets["60-day"].push(inv);
    else if (days > 30) buckets["30-day"].push(inv);
    else buckets.current.push(inv);
  }
  return buckets;
}

export function buildCollectionsStatuses(invoices: Invoice[]): CollectionsStatus[] {
  return invoices.filter(i => i.status === "overdue").map(inv => {
    const agingDays = Math.floor((Date.now() - new Date(inv.dueDate).getTime()) / 86400000);
    const bucket = agingDays > 90 ? "90-plus" as const : agingDays > 60 ? "60-day" as const : agingDays > 30 ? "30-day" as const : "current" as const;
    return {
      invoiceId: inv.id, agingDays, agingBucket: bucket, attemptCount: Math.min(Math.floor(agingDays / 15), 6),
      lastAttemptAt: agingDays > 15 ? new Date(Date.now() - 7 * 86400000).toISOString() : null,
      nextAction: agingDays > 90 ? "Legal review" : agingDays > 60 ? "Payment plan offer" : "Send reminder",
      status: "active" as const,
    };
  });
}

