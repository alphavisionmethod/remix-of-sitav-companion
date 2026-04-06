// ═══════════════════════════════════════════════════════════════
// SITA OS — Finance OS: Waste Detector Service
// Identifies unused/underutilized subscriptions
// ═══════════════════════════════════════════════════════════════

import type { SubscriptionRecord, WasteOpportunity } from "@/packages/finance-contracts";

import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter

export interface WasteReport {
  totalWasteAnnualCents: number;
  totalWasteMonthCents: number;
  opportunities: WasteOpportunity[];
  topCategory: string;
  actionableCount: number;
  generatedAt: string;
}

export function buildWasteReport(subscriptions: SubscriptionRecord[]): WasteReport {
  const opportunities = subscriptions
    .filter(s => s.isWaste && s.status === "active")
    .map(s => ({
      subscriptionId: s.id,
      name: s.name,
      monthlyCostCents: s.frequency === "annually" ? Math.round(s.amountCents / 12) : s.amountCents,
      annualSavingsCents: s.savingsIfCancelled,
      reason: s.wasteReason || "Low usage detected",
      confidence: 75,
      detectedAt: new Date().toISOString(),
    }));

  const totalAnnual = opportunities.reduce((s, o) => s + o.annualSavingsCents, 0);
  const categoryCount = new Map<string, number>();
  subscriptions.filter(s => s.isWaste).forEach(s => {
    categoryCount.set(s.category, (categoryCount.get(s.category) || 0) + 1);
  });
  const topCategory = Array.from(categoryCount.entries()).sort(([, a], [, b]) => b - a)[0]?.[0] || "none";

  return {
    totalWasteAnnualCents: totalAnnual,
    totalWasteMonthCents: Math.round(totalAnnual / 12),
    opportunities,
    topCategory,
    actionableCount: opportunities.length,
    generatedAt: new Date().toISOString(),
  };
}


// ── Persistence ──────────────────────────────────────────
const _serviceId = "finance-os/waste-detector";

function _serializeState(): Record<string, unknown> {
  return {
    categoryCount: Array.from(categoryCount.entries()),
  };
}

function _hydrateState(state: Record<string, unknown>): void {
  if (!state) return;
  if (state.categoryCount) { categoryCount.clear(); (state.categoryCount as any[]).forEach(([k, v]: any) => categoryCount.set(k, v)); }
}

export async function loadPersistedState(): Promise<void> {
  const state = await loadServiceState(_serviceId);
  if (state) _hydrateState(state as Record<string, unknown>);
}

export function persistState(): void {
  debouncedSaveServiceState(_serviceId, _serializeState());
}