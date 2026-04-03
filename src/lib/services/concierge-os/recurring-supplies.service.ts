// ═══════════════════════════════════════════════════════════════
// SITA OS — Concierge OS: Recurring Supplies Service
// ═══════════════════════════════════════════════════════════════

import type { RecurringSupplyItem } from "@/packages/concierge-contracts/grocery";

export function detectResupplyNeeded(supplies: RecurringSupplyItem[]): RecurringSupplyItem[] {
  const now = Date.now();
  return supplies.filter(s => new Date(s.nextExpectedAt).getTime() <= now + 3 * 86400000);
}

export function estimateMonthlySupplyCost(supplies: RecurringSupplyItem[]): number {
  return supplies.reduce((s, item) => s + Math.round(item.avgPriceCents * (30 / item.frequencyDays)), 0);
}
