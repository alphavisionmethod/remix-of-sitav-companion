// ═══════════════════════════════════════════════════════════════
// SITA OS — Concierge OS: Grocery Continuity Service
// ═══════════════════════════════════════════════════════════════

import type { GroceryItem, RecurringSupplyItem, ContinuityAlert } from "@/packages/concierge-contracts/grocery";

export function detectContinuityAlerts(supplies: RecurringSupplyItem[]): ContinuityAlert[] {
  const now = Date.now();
  const alerts: ContinuityAlert[] = [];

  for (const supply of supplies) {
    const nextExpected = new Date(supply.nextExpectedAt).getTime();
    const daysOverdue = Math.floor((now - nextExpected) / 86400000);

    if (daysOverdue > 0) {
      alerts.push({
        id: `alert-${supply.id}`,
        itemId: supply.id,
        itemName: supply.name,
        alertType: daysOverdue > 7 ? "overdue-purchase" : "running-low",
        severity: daysOverdue > 14 ? "urgent" : daysOverdue > 7 ? "warning" : "info",
        message: `${supply.name} is ${daysOverdue} days past expected purchase date`,
        suggestedAction: supply.autoAdd ? "Auto-added to shopping list" : "Add to shopping list",
        createdAt: new Date().toISOString(),
      });
    }
  }

  return alerts;
}

export function generateShoppingList(supplies: RecurringSupplyItem[]): GroceryItem[] {
  const now = Date.now();
  return supplies
    .filter(s => new Date(s.nextExpectedAt).getTime() <= now + 3 * 86400000)
    .map(s => ({
      id: `grocery-${s.id}`,
      name: s.name,
      category: s.category as GroceryItem["category"],
      quantity: s.quantity,
      unit: s.unit,
      store: s.preferredStore,
      addedBy: "system",
      addedAt: new Date().toISOString(),
      purchased: false,
      estimatedPriceCents: s.avgPriceCents,
      isRecurring: true,
    }));
}

export function computeMonthlyGroceryBudget(supplies: RecurringSupplyItem[]): number {
  return supplies.reduce((sum, s) => {
    const purchasesPerMonth = 30 / s.frequencyDays;
    return sum + Math.round(s.avgPriceCents * purchasesPerMonth);
  }, 0);
}
