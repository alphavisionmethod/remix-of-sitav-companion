// ═══════════════════════════════════════════════════════════════
// SITA OS — Cash Allocation AI Engine
// Deterministic allocation across 9 buckets, 3 strategies
// ═══════════════════════════════════════════════════════════════

import type { CashAllocationPlan, AllocationEntry, AllocationStrategy } from "@/packages/finance-contracts/advanced-intelligence";

import type { CashAllocatorInput } from "@/domains/finance";

// Canonical type re-exports for backward compatibility.
// New code should import from `@/domains/finance` directly.
export type { CashAllocatorInput };

const BUCKET_LABELS: Record<string, string> = {
  bills: "Bills & Obligations",
  "tax-reserve": "Tax Reserve",
  "emergency-reserve": "Emergency Reserve",
  "debt-payoff": "Debt Payoff",
  "sinking-funds": "Sinking Funds",
  "payroll-reserve": "Payroll Reserve",
  discretionary: "Discretionary",
  investments: "Investments",
  "expansion-reserve": "Expansion Reserve",
};

export function computeCashAllocations(input: CashAllocatorInput): Record<AllocationStrategy, CashAllocationPlan> {
  const strategies: AllocationStrategy[] = ["conservative", "balanced", "aggressive"];
  const result = {} as Record<AllocationStrategy, CashAllocationPlan>;

  for (const strategy of strategies) {
    const allocs: AllocationEntry[] = [];
    let remaining = input.availableCashCents;

    const alloc = (bucket: string, cents: number, reason: string) => {
      const actual = Math.min(cents, Math.max(0, remaining));
      if (actual > 0) {
        allocs.push({
          bucket: bucket as any, label: BUCKET_LABELS[bucket] || bucket,
          amountCents: actual, percentOfTotal: 0, reasoning: reason,
        });
        remaining -= actual;
      }
    };

    // Bills always first
    alloc("bills", input.billsDueCents, "Upcoming obligations must be covered first");

    // Payroll if applicable
    const payrollGap = Math.max(0, input.payrollNeededCents - input.payrollReservedCents);
    if (payrollGap > 0) alloc("payroll-reserve", payrollGap, "Payroll obligations are non-negotiable");

    // Tax reserve gap
    const taxGap = Math.max(0, input.taxOwedCents - input.taxReservedCents);
    const taxMultiplier = strategy === "conservative" ? 1 : strategy === "balanced" ? 0.8 : 0.5;
    alloc("tax-reserve", Math.round(taxGap * taxMultiplier), "Tax set-aside to prevent quarterly shortfall");

    // Emergency reserve
    const emergencyGap = Math.max(0, input.emergencyTargetCents - input.emergencyCurrentCents);
    const emergencyMultiplier = strategy === "conservative" ? 0.3 : strategy === "balanced" ? 0.2 : 0.1;
    alloc("emergency-reserve", Math.round(emergencyGap * emergencyMultiplier), "Building toward emergency fund target");

    // Debt payoff
    const debtExtra = strategy === "aggressive"
      ? Math.round(remaining * 0.4)
      : strategy === "balanced" ? Math.round(remaining * 0.2) : input.debtMinimumCents;
    alloc("debt-payoff", Math.max(input.debtMinimumCents, debtExtra), "Debt reduction to lower interest drag");

    // Sinking funds
    const sinkGap = Math.max(0, input.sinkingFundTargetCents - input.sinkingFundCurrentCents);
    alloc("sinking-funds", Math.round(sinkGap * 0.1), "Progress toward sinking fund goals");

    // Investments (aggressive puts more here)
    const investPct = strategy === "aggressive" ? 0.3 : strategy === "balanced" ? 0.15 : 0.05;
    alloc("investments", Math.round(remaining * investPct), "Long-term growth allocation");

    // Expansion
    if (strategy === "aggressive") {
      alloc("expansion-reserve", Math.round(remaining * 0.2), "Business growth and opportunity reserve");
    }

    // Remainder to discretionary
    alloc("discretionary", remaining, "Remaining safe-to-spend after all allocations");

    // Calculate percentages
    const total = allocs.reduce((s, a) => s + a.amountCents, 0);
    for (const a of allocs) a.percentOfTotal = total > 0 ? Math.round((a.amountCents / total) * 100) : 0;

    result[strategy] = {
      strategy, availableCashCents: input.availableCashCents,
      allocations: allocs, totalAllocatedCents: total,
      unallocatedCents: Math.max(0, input.availableCashCents - total),
    };
  }

  return result;
}
