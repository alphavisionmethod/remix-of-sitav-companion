// ═══════════════════════════════════════════════════════════════
// SITA OS — Finance OS: Entity Capital Service
// Entity-level capital tracking and analysis
// ═══════════════════════════════════════════════════════════════

import type { EntityCapitalMap } from "@/packages/finance-contracts/family-office/types";

import type { EntityCapitalReport } from "@/domains/finance";

// Canonical type re-exports for backward compatibility.
// New code should import from `@/domains/finance` directly.
export type { EntityCapitalReport };

export function analyzeEntityCapital(entity: EntityCapitalMap): EntityCapitalReport {
  const ratio = entity.assetsCents > 0 ? entity.liabilitiesCents / entity.assetsCents : 0;
  const recommendations: string[] = [];

  if (ratio > 0.5) recommendations.push(`Debt-to-asset ratio high (${(ratio * 100).toFixed(0)}%) — consider deleveraging`);
  if (entity.jurisdictions.length > 2) recommendations.push("Multi-jurisdiction entity — review compliance annually");
  if (entity.entityType === "trust" && entity.beneficiaries && entity.beneficiaries.length === 0) {
    recommendations.push("Trust has no listed beneficiaries — review with counsel");
  }

  return {
    entity,
    debtToAssetRatio: Math.round(ratio * 100) / 100,
    jurisdictionCompliance: true,
    recommendations,
  };
}

export function computeInterEntityTransfers(entities: EntityCapitalMap[]): { from: string; to: string; reason: string; amountCents: number }[] {
  const transfers: { from: string; to: string; reason: string; amountCents: number }[] = [];
  const overCapitalized = entities.filter(e => e.liabilitiesCents === 0 && e.assetsCents > 50000000);
  const underCapitalized = entities.filter(e => e.liabilitiesCents > e.assetsCents * 0.4);

  for (const from of overCapitalized) {
    for (const to of underCapitalized) {
      transfers.push({
        from: from.entityName, to: to.entityName,
        reason: `Rebalance capital — ${to.entityName} leverage is ${((to.liabilitiesCents / to.assetsCents) * 100).toFixed(0)}%`,
        amountCents: Math.round(to.liabilitiesCents * 0.2),
      });
    }
  }
  return transfers;
}

