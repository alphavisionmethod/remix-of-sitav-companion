// ═══════════════════════════════════════════════════════════════
// SITA OS — Provider Refresh Policy
// Per-provider refresh cadence, retry backoff, and window
// ═══════════════════════════════════════════════════════════════

import { type ProviderId, PROVIDER_CONTRACT_REGISTRY, PROVIDER_IDS } from "./provider-contract-registry";

export interface ProviderRefreshEntry {
  providerId: ProviderId;
  refreshCadenceMinutes: number;
  retryBackoffMs: number[];
  maxRetries: number;
  refreshWindowMinutes: number;
  preExpiryBufferMinutes: number;
}

const REFRESH_CADENCES: Partial<Record<ProviderId, { cadence: number; window: number; buffer: number }>> = {
  gmail: { cadence: 50, window: 10, buffer: 5 },
  "google-calendar": { cadence: 50, window: 10, buffer: 5 },
  "google-drive": { cadence: 50, window: 10, buffer: 5 },
  quickbooks: { cadence: 50, window: 10, buffer: 5 },
  hubspot: { cadence: 50, window: 10, buffer: 5 },
  slack: { cadence: 720, window: 30, buffer: 60 },
  dropbox: { cadence: 240, window: 15, buffer: 10 },
};

export const PROVIDER_REFRESH_POLICIES: Record<ProviderId, ProviderRefreshEntry> = Object.fromEntries(
  PROVIDER_IDS.map(id => {
    const c = PROVIDER_CONTRACT_REGISTRY[id];
    const cadence = REFRESH_CADENCES[id];
    return [id, {
      providerId: id,
      refreshCadenceMinutes: cadence?.cadence ?? -1,
      retryBackoffMs: Array.from({ length: c.retryPolicy.maxRetries }, (_, i) => c.retryPolicy.baseDelayMs * Math.pow(2, i)),
      maxRetries: c.retryPolicy.maxRetries,
      refreshWindowMinutes: cadence?.window ?? 0,
      preExpiryBufferMinutes: cadence?.buffer ?? 0,
    }];
  })
) as Record<ProviderId, ProviderRefreshEntry>;