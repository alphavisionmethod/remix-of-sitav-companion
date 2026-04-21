// ═══════════════════════════════════════════════════════════════
// SITA OS — Integration Health Pack Builder
// Captures per-provider health diagnostics for support bundles.
// ═══════════════════════════════════════════════════════════════

import type { BundlePack } from "./support-bundle-contract";
import { applyRedactionPolicy } from "./support-redaction-policy";

export interface ProviderHealthSnapshot {
  readonly providerId: string;
  readonly displayName: string;
  readonly healthState: "healthy" | "degraded" | "failing" | "disconnected" | "unknown";
  readonly lastSuccessAt: string | null;
  readonly lastFailureAt: string | null;
  readonly lastFailureReason: string | null;
  readonly refreshStatus: "current" | "expiring-soon" | "expired" | "not-applicable";
  readonly retryCount: number;
  readonly webhookStatus: "active" | "inactive" | "not-configured";
  readonly credentialState: string;
  readonly degradedUxFlags: readonly string[];
  readonly linkedRunbookIds: readonly string[];
  readonly suggestedActions: readonly string[];
}

export interface IntegrationHealthPack {
  readonly providers: readonly ProviderHealthSnapshot[];
  readonly totalProviders: number;
  readonly healthyCount: number;
  readonly degradedCount: number;
  readonly failingCount: number;
  readonly capturedAt: string;
}

/**
 * Build an integration health pack from provider snapshots.
 */
export function buildIntegrationHealthPack(
  providers: ProviderHealthSnapshot[],
): IntegrationHealthPack {
  return {
    providers,
    totalProviders: providers.length,
    healthyCount: providers.filter((p) => p.healthState === "healthy").length,
    degradedCount: providers.filter((p) => p.healthState === "degraded").length,
    failingCount: providers.filter((p) => p.healthState === "failing").length,
    capturedAt: new Date().toISOString(),
  };
}

/** Convert to a redacted BundlePack. */
export function toIntegrationHealthPack(pack: IntegrationHealthPack): BundlePack {
  const raw = pack as unknown as Record<string, unknown>;
  const { data, redactions } = applyRedactionPolicy(raw);
  return {
    packType: "integration-health",
    capturedAt: pack.capturedAt,
    data,
    redactedFields: redactions,
  };
}