// ═══════════════════════════════════════════════════════════════
// SITA OS — Provider Health Model
// Canonical health/degraded/outage state model
// ═══════════════════════════════════════════════════════════════

import { type ProviderId, PROVIDER_CONTRACT_REGISTRY } from "./provider-contract-registry";

export type ProviderHealthStatus = "healthy" | "degraded" | "partial-outage" | "full-outage" | "maintenance" | "unknown";

export interface ProviderHealthSignals {
  lastSuccessAt: string | null;
  lastFailureAt: string | null;
  errorRatePct: number;
  latencyP95Ms: number;
  rateLimitHits: number;
  authValid: boolean;
}

export interface ProviderHealthAssessment {
  providerId: ProviderId;
  status: ProviderHealthStatus;
  signals: ProviderHealthSignals;
  assessedAt: string;
  outagePolicy: string;
  degradedUxBehavior: string;
}

export function assessProviderHealth(providerId: ProviderId, signals: ProviderHealthSignals): ProviderHealthAssessment {
  const contract = PROVIDER_CONTRACT_REGISTRY[providerId];
  let status: ProviderHealthStatus = "healthy";

  if (!signals.authValid) {
    status = "full-outage";
  } else if (signals.errorRatePct > 50) {
    status = "full-outage";
  } else if (signals.errorRatePct > 20) {
    status = "partial-outage";
  } else if (signals.errorRatePct > 5 || signals.latencyP95Ms > 5000 || signals.rateLimitHits > 10) {
    status = "degraded";
  } else if (!signals.lastSuccessAt) {
    status = "unknown";
  }

  return {
    providerId,
    status,
    signals,
    assessedAt: new Date().toISOString(),
    outagePolicy: contract.outagePolicy,
    degradedUxBehavior: contract.degradedUxBehavior,
  };
}