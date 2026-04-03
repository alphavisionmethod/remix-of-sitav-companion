// ═══════════════════════════════════════════════════════════════
// SITA OS — Pack Enablement Service
// Checks capabilities enabled per tenant based on packs/entitlements
// ═══════════════════════════════════════════════════════════════

import { tierIncludes, type EntitlementTier } from "@/packages/entitlements";

export interface PackDefinition {
  packId: string;
  name: string;
  requiredTier: EntitlementTier;
  capabilities: string[];
  connectors: string[];
}

export interface EnablementResult {
  capabilityId: string;
  enabled: boolean;
  reason: string;
  requiredPack?: string;
  requiredTier?: EntitlementTier;
}

const PACKS: PackDefinition[] = [
  { packId: "core-business", name: "Core Business", requiredTier: "starter", capabilities: ["biz-crm-read", "biz-crm-write", "biz-comms-send"], connectors: ["crm", "gmail"] },
  { packId: "core-finance", name: "Core Finance", requiredTier: "starter", capabilities: ["fin-accounts-read"], connectors: ["banking"] },
  { packId: "finance-pro", name: "Finance Pro", requiredTier: "professional", capabilities: ["fin-payment-execute", "fin-transfer"], connectors: ["banking"] },
  { packId: "concierge-basic", name: "Concierge Basic", requiredTier: "starter", capabilities: ["con-calendar-read"], connectors: ["calendar"] },
  { packId: "concierge-pro", name: "Concierge Pro", requiredTier: "professional", capabilities: ["con-booking-create"], connectors: ["travel", "calendar"] },
  { packId: "platform-admin", name: "Platform Admin", requiredTier: "enterprise", capabilities: ["plat-diagnostic", "plat-config-write"], connectors: [] },
];

export function checkCapabilityEnabled(
  capabilityId: string,
  userTier: EntitlementTier,
  installedPackIds: string[]
): EnablementResult {
  for (const pack of PACKS) {
    if (pack.capabilities.includes(capabilityId)) {
      const packInstalled = installedPackIds.includes(pack.packId);
      const tierOk = tierIncludes(userTier, pack.requiredTier);

      if (!packInstalled) {
        return { capabilityId, enabled: false, reason: `Pack "${pack.name}" not installed`, requiredPack: pack.packId, requiredTier: pack.requiredTier };
      }
      if (!tierOk) {
        return { capabilityId, enabled: false, reason: `Tier "${pack.requiredTier}" required, current: "${userTier}"`, requiredPack: pack.packId, requiredTier: pack.requiredTier };
      }
      return { capabilityId, enabled: true, reason: `Enabled via pack "${pack.name}"` };
    }
  }

  // Capability not in any pack — default enabled (platform-level)
  return { capabilityId, enabled: true, reason: "Not pack-gated" };
}

export function listEnabledCapabilities(userTier: EntitlementTier, installedPackIds: string[]): string[] {
  const enabled: string[] = [];
  for (const pack of PACKS) {
    if (installedPackIds.includes(pack.packId) && tierIncludes(userTier, pack.requiredTier)) {
      enabled.push(...pack.capabilities);
    }
  }
  return [...new Set(enabled)];
}

export function getPackDefinition(packId: string): PackDefinition | undefined {
  return PACKS.find((p) => p.packId === packId);
}

export function listPacks(): PackDefinition[] {
  return [...PACKS];
}
