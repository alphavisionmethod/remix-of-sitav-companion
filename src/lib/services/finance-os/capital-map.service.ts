// ═══════════════════════════════════════════════════════════════
// SITA OS — Finance OS: Capital Map Service
// Family office capital mapping across entities
// ═══════════════════════════════════════════════════════════════

import type { CapitalMap, EntityCapitalMap } from "@/packages/finance-contracts/family-office/types";

export function buildCapitalMap(entities: EntityCapitalMap[]): CapitalMap {
  const totalAssets = entities.reduce((s, e) => s + e.assetsCents, 0);
  const totalLiabilities = entities.reduce((s, e) => s + e.liabilitiesCents, 0);

  return {
    totalNetWorthCents: totalAssets - totalLiabilities,
    liquidAssetsCents: Math.round(totalAssets * 0.6),
    illiquidAssetsCents: Math.round(totalAssets * 0.4),
    totalLiabilitiesCents: totalLiabilities,
    entities,
    lastUpdated: new Date().toISOString(),
  };
}

export function getMockCapitalMap(): CapitalMap {
  const entities: EntityCapitalMap[] = [
    { entityId: "e-personal", entityName: "Personal", entityType: "individual", assetsCents: 130000000, liabilitiesCents: 22000000, netWorthCents: 108000000, jurisdictions: ["US-CA"], taxStatus: "Individual 1040", beneficiaries: [] },
    { entityId: "e-business", entityName: "Business LLC", entityType: "llc", assetsCents: 95000000, liabilitiesCents: 10000000, netWorthCents: 85000000, jurisdictions: ["US-DE"], taxStatus: "Partnership K-1" },
    { entityId: "e-trust", entityName: "Family Trust", entityType: "trust", assetsCents: 60000000, liabilitiesCents: 0, netWorthCents: 60000000, jurisdictions: ["US-CA"], taxStatus: "Grantor Trust", beneficiaries: ["spouse", "child-1", "child-2"] },
  ];
  return buildCapitalMap(entities);
}

export function computeEntityConcentration(map: CapitalMap): { entityName: string; percent: number; warning: boolean }[] {
  const total = map.entities.reduce((s, e) => s + e.netWorthCents, 0);
  return map.entities.map(e => ({
    entityName: e.entityName,
    percent: total > 0 ? Math.round((e.netWorthCents / total) * 100) : 0,
    warning: total > 0 && e.netWorthCents / total > 0.5,
  }));
}

