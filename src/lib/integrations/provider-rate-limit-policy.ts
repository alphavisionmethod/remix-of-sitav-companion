// ═══════════════════════════════════════════════════════════════
// SITA OS — Provider Rate Limit Policy
// Per-provider rate limits, backoff, burst handling, queue behavior
// ═══════════════════════════════════════════════════════════════

import { type ProviderId, PROVIDER_CONTRACT_REGISTRY, PROVIDER_IDS } from "./provider-contract-registry";

export interface ProviderRateLimitEntry {
  providerId: ProviderId;
  requestsPerMinute: number;
  burstLimit: number;
  backoffStrategy: string;
  queueBehavior: "queue" | "drop" | "throttle";
  headerBasedDetection: boolean;
  retryAfterHonored: boolean;
}

export const PROVIDER_RATE_LIMIT_POLICIES: Record<ProviderId, ProviderRateLimitEntry> = Object.fromEntries(
  PROVIDER_IDS.map(id => {
    const c = PROVIDER_CONTRACT_REGISTRY[id];
    return [id, {
      providerId: id,
      requestsPerMinute: c.rateLimitPolicy.requestsPerMinute,
      burstLimit: c.rateLimitPolicy.burstLimit,
      backoffStrategy: c.rateLimitPolicy.backoffStrategy,
      queueBehavior: c.outagePolicy === "queue-and-retry" ? "queue" : "throttle",
      headerBasedDetection: true,
      retryAfterHonored: true,
    }];
  })
) as Record<ProviderId, ProviderRateLimitEntry>;