// ═══════════════════════════════════════════════════════════════
// SITA OS — Provider Retention Policy
// Per-provider data retention and environment separation rules
// ═══════════════════════════════════════════════════════════════

import { type ProviderId, PROVIDER_CONTRACT_REGISTRY, PROVIDER_IDS } from "./provider-contract-registry";

export interface ProviderRetentionEntry {
  providerId: ProviderId;
  tokenTtlDays: number;
  syncDataRetentionDays: number;
  auditLogRetentionDays: number;
  replayDataPolicy: "retain-7d" | "retain-30d" | "retain-90d" | "no-replay-data";
  supportExportRedaction: boolean;
  sandboxSupported: boolean;
  productionSupported: boolean;
}

export const PROVIDER_RETENTION_POLICIES: Record<ProviderId, ProviderRetentionEntry> = Object.fromEntries(
  PROVIDER_IDS.map(id => {
    const c = PROVIDER_CONTRACT_REGISTRY[id];
    return [id, {
      providerId: id,
      tokenTtlDays: c.retentionPolicy.tokenTtlDays,
      syncDataRetentionDays: c.retentionPolicy.syncDataRetentionDays,
      auditLogRetentionDays: c.retentionPolicy.auditLogRetentionDays,
      replayDataPolicy: c.webhookBehavior?.replaySupported ? "retain-30d" : "no-replay-data",
      supportExportRedaction: true,
      sandboxSupported: c.environments.includes("sandbox"),
      productionSupported: c.environments.includes("production"),
    }];
  })
) as Record<ProviderId, ProviderRetentionEntry>;