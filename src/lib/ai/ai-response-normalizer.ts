// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Response Normalizer
// Normalizes raw gateway responses into canonical AIResponseEnvelope
// ═══════════════════════════════════════════════════════════════

import type { AIResponseEnvelope, AIState, LaunchLevel } from "./ai-state-types";

interface RawGatewayResponse {
  content?: string;
  provider?: string;
  model?: string;
  taskClass?: string;
  inputTokens?: number;
  outputTokens?: number;
  costCents?: number;
  latencyMs?: number;
  cached?: boolean;
  fallbackUsed?: boolean;
  receiptId?: string;
  // Degraded response fields
  status?: string;
  reason?: string;
  message?: string;
  launchLevel?: string;
  policyKey?: string;
  error?: string;
}

export function normalizeGatewayResponse(
  raw: RawGatewayResponse,
  capabilityKey: string,
  httpStatus: number,
): AIResponseEnvelope {
  const timestamp = new Date().toISOString();

  // Handle non-200 responses
  if (httpStatus === 401) {
    return createEnvelope(capabilityKey, "blocked_config", {
      degradedReason: "Authentication required",
      userFacingMessage: "Please sign in to use AI features.",
      timestamp,
    });
  }

  if (httpStatus === 429) {
    const state: AIState = raw.status === "payment_required" ? "payment_required" : "rate_limited";
    return createEnvelope(capabilityKey, state, {
      degradedReason: raw.reason ?? raw.error ?? "Rate limited",
      userFacingMessage: raw.message ?? raw.error ?? "Please wait a moment and try again.",
      timestamp,
    });
  }

  if (httpStatus === 402) {
    return createEnvelope(capabilityKey, "payment_required", {
      degradedReason: "Credits exhausted",
      userFacingMessage: raw.message ?? "AI credits exhausted. Please add funds.",
      timestamp,
    });
  }

  if (httpStatus === 503) {
    return createEnvelope(capabilityKey, "unavailable_capability", {
      degradedReason: raw.reason ?? "Service unavailable",
      launchHonestyClass: (raw.launchLevel as LaunchLevel) ?? "unavailable",
      userFacingMessage: raw.message ?? "AI services are currently unavailable.",
      timestamp,
    });
  }

  if (httpStatus >= 400) {
    return createEnvelope(capabilityKey, "error", {
      degradedReason: raw.error ?? raw.reason ?? `HTTP ${httpStatus}`,
      userFacingMessage: raw.message ?? "An error occurred. Please try again.",
      timestamp,
    });
  }

  // Success responses
  const fallbackOccurred = raw.fallbackUsed ?? false;
  let status: AIState = "success_real";

  if (fallbackOccurred) {
    status = "degraded_fallback_used";
  }

  if (raw.status === "degraded") {
    if (raw.reason?.includes("budget")) status = "degraded_budget_limited";
    else if (raw.reason?.includes("config")) status = "degraded_config_missing";
    else status = "degraded_provider_unavailable";
  }

  return {
    status,
    mode: fallbackOccurred ? "degraded" : "real",
    capabilityKey,
    content: raw.content ?? "",
    degradedReason: fallbackOccurred ? "Fallback model used" : undefined,
    launchHonestyClass: (raw.launchLevel as LaunchLevel) ?? "real",
    providerUsed: raw.provider,
    modelUsed: raw.model,
    receiptId: raw.receiptId,
    usageSummary: {
      inputTokens: raw.inputTokens ?? 0,
      outputTokens: raw.outputTokens ?? 0,
      costCents: raw.costCents ?? 0,
      latencyMs: raw.latencyMs ?? 0,
      cached: raw.cached ?? false,
    },
    fallbackOccurred,
    timestamp,
  };
}

function createEnvelope(
  capabilityKey: string,
  status: AIState,
  overrides: Partial<AIResponseEnvelope>,
): AIResponseEnvelope {
  return {
    status,
    mode: status.startsWith("success_") ? "real" : "unavailable",
    capabilityKey,
    content: "",
    fallbackOccurred: false,
    timestamp: new Date().toISOString(),
    ...overrides,
  };
}
