// ═══════════════════════════════════════════════════════════════
// SITA OS — Provider Kill-Switch Map
// Maps providers to kill-switch IDs and runbook IDs
// ═══════════════════════════════════════════════════════════════

import { type ProviderId, PROVIDER_CONTRACT_REGISTRY, PROVIDER_IDS } from "./provider-contract-registry";

export interface ProviderKillSwitchEntry {
  providerId: ProviderId;
  killSwitchId: string | null;
  runbookId: string | null;
  impactDescription: string;
}

export const PROVIDER_KILL_SWITCH_MAP: Record<ProviderId, ProviderKillSwitchEntry> = Object.fromEntries(
  PROVIDER_IDS.map(id => {
    const c = PROVIDER_CONTRACT_REGISTRY[id];
    return [id, {
      providerId: id,
      killSwitchId: c.killSwitchBinding,
      runbookId: c.runbookRef,
      impactDescription: `Disabling ${id} affects all ${c.owner}-managed operations`,
    }];
  })
) as Record<ProviderId, ProviderKillSwitchEntry>;

export function getKillSwitchForProvider(providerId: ProviderId): string | null {
  return PROVIDER_KILL_SWITCH_MAP[providerId].killSwitchId;
}