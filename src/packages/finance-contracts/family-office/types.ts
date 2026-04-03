export interface CapitalMap {
  totalNetWorthCents: number;
  liquidAssetsCents: number;
  illiquidAssetsCents: number;
  totalLiabilitiesCents: number;
  entities: EntityCapitalMap[];
  lastUpdated: string;
}

export interface EntityCapitalMap {
  entityId: string;
  entityName: string;
  entityType: "individual" | "trust" | "llc" | "corporation" | "foundation" | "partnership";
  assetsCents: number;
  liabilitiesCents: number;
  netWorthCents: number;
  jurisdictions: string[];
  taxStatus: string;
  beneficiaries?: string[];
}

export interface LiquiditySummary {
  immediateLiquidCents: number;
  within30DaysCents: number;
  within90DaysCents: number;
  lockedCents: number;
  totalCents: number;
  liquidityRatio: number;
  stressTestResult: "pass" | "marginal" | "fail";
  recommendations: string[];
  calculatedAt: string;
}
