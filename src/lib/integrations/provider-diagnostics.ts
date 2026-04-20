// ═══════════════════════════════════════════════════════════════
// SITA OS — Provider Diagnostics
// Support diagnostics, audit export, and troubleshooting
// ═══════════════════════════════════════════════════════════════

import { type ProviderId, PROVIDER_CONTRACT_REGISTRY } from "./provider-contract-registry";
import { type ProviderHealthAssessment } from "./provider-health-model";

export interface ProviderDiagnosticBundle {
  providerId: ProviderId;
  generatedAt: string;
  credentialStatus: "valid" | "expiring" | "expired" | "missing";
  lastRefreshAt: string | null;
  lastRefreshResult: "success" | "failure" | "none";
  errorHistory: Array<{ at: string; error: string; httpStatus: number | null }>;
  latencyHistory: Array<{ at: string; p50Ms: number; p95Ms: number }>;
  rateLimitState: { currentUsage: number; limit: number; resetsAt: string | null };
  webhookDeliveryStatus: "healthy" | "degraded" | "failing" | "not-applicable";
  healthAssessment: ProviderHealthAssessment | null;
  retentionPolicy: { tokenTtlDays: number; syncDataRetentionDays: number; auditLogRetentionDays: number };
  killSwitchBinding: string | null;
  runbookRef: string | null;
}

export function generateProviderDiagnostics(
  providerId: ProviderId,
  overrides?: Partial<ProviderDiagnosticBundle>
): ProviderDiagnosticBundle {
  const contract = PROVIDER_CONTRACT_REGISTRY[providerId];
  return {
    providerId,
    generatedAt: new Date().toISOString(),
    credentialStatus: "valid",
    lastRefreshAt: null,
    lastRefreshResult: "none",
    errorHistory: [],
    latencyHistory: [],
    rateLimitState: { currentUsage: 0, limit: contract.rateLimitPolicy.requestsPerMinute, resetsAt: null },
    webhookDeliveryStatus: contract.webhookBehavior ? "healthy" : "not-applicable",
    healthAssessment: null,
    retentionPolicy: contract.retentionPolicy,
    killSwitchBinding: contract.killSwitchBinding,
    runbookRef: contract.runbookRef,
    ...overrides,
  };
}