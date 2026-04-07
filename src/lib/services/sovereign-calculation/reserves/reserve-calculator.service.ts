// SITA OS — Reserve Calculator Service
export interface ReserveAllocation { fundId: string; name: string; targetCents: number; currentCents: number; fundedPct: number; priority: number }
export interface ReserveWaterfall { allocations: ReserveAllocation[]; totalTargetCents: number; totalFundedCents: number; overallFundedPct: number; shortfallCents: number }

export function calculateReserveWaterfall(availableCents: number, funds: Omit<ReserveAllocation, "currentCents" | "fundedPct">[]): ReserveWaterfall {
  const sorted = [...funds].sort((a, b) => a.priority - b.priority);
  let remaining = availableCents;
  const allocations: ReserveAllocation[] = sorted.map((f) => {
    const allocated = Math.min(remaining, f.targetCents);
    remaining -= allocated;
    return { ...f, currentCents: allocated, fundedPct: (allocated / f.targetCents) * 100 };
  });
  const totalTarget = allocations.reduce((a, f) => a + f.targetCents, 0);
  const totalFunded = allocations.reduce((a, f) => a + f.currentCents, 0);
  return { allocations, totalTargetCents: totalTarget, totalFundedCents: totalFunded, overallFundedPct: totalTarget > 0 ? (totalFunded / totalTarget) * 100 : 0, shortfallCents: Math.max(0, totalTarget - totalFunded) };
}

