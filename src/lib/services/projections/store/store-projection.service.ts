// ═══════════════════════════════════════════════════════════════
// SITA OS — Store Projection Service
// Installed packs + available upgrades
// ═══════════════════════════════════════════════════════════════

export interface StoreProjection {
  timestamp: string;
  installedPacks: InstalledPackSummary[];
  availableUpgrades: UpgradeSummary[];
  currentTier: string;
  usageHighlights: { feature: string; used: number; limit: number; pct: number }[];
}

export interface InstalledPackSummary {
  packId: string;
  name: string;
  version: string;
  installedAt: string;
  capabilityCount: number;
  status: "active" | "degraded" | "expired";
}

export interface UpgradeSummary {
  packId: string;
  name: string;
  requiredTier: string;
  newCapabilities: string[];
  priceCents: number;
}

export function generateStoreProjection(): StoreProjection {
  return {
    timestamp: new Date().toISOString(),
    installedPacks: [
      { packId: "core-business", name: "Core Business", version: "1.2.0", installedAt: new Date(Date.now() - 86400000 * 30).toISOString(), capabilityCount: 3, status: "active" },
      { packId: "core-finance", name: "Core Finance", version: "1.1.0", installedAt: new Date(Date.now() - 86400000 * 30).toISOString(), capabilityCount: 1, status: "active" },
      { packId: "concierge-basic", name: "Concierge Basic", version: "1.0.0", installedAt: new Date(Date.now() - 86400000 * 14).toISOString(), capabilityCount: 1, status: "active" },
    ],
    availableUpgrades: [
      { packId: "finance-pro", name: "Finance Pro", requiredTier: "professional", newCapabilities: ["fin-payment-execute", "fin-transfer"], priceCents: 4900 },
      { packId: "concierge-pro", name: "Concierge Pro", requiredTier: "professional", newCapabilities: ["con-booking-create"], priceCents: 2900 },
    ],
    currentTier: "starter",
    usageHighlights: [
      { feature: "API Calls", used: 8432, limit: 10000, pct: 84.3 },
      { feature: "Workflows", used: 12, limit: 25, pct: 48 },
      { feature: "Connectors", used: 3, limit: 5, pct: 60 },
    ],
  };
}
