// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Runtime Health Hook
// Fetches AI health status and provides degraded state info
// ═══════════════════════════════════════════════════════════════

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AIHealthStatus {
  status: "healthy" | "degraded" | "unavailable" | "unknown";
  checks: {
    api_key_present: boolean;
    provider_reachable: boolean;
    provider_latency_ms: number | null;
    model_invocation_ok: boolean;
    structured_output_ok: boolean;
    edge_functions_healthy: Record<string, boolean>;
    rate_limit_ok: boolean;
    budget_ok: boolean;
  };
  active_provider: string;
  active_model: string;
  last_successful_call: string | null;
  last_failure: string | null;
  error_details: string | null;
  timestamp: string;
}

const DEFAULT_HEALTH: AIHealthStatus = {
  status: "unknown",
  checks: {
    api_key_present: false,
    provider_reachable: false,
    provider_latency_ms: null,
    model_invocation_ok: false,
    structured_output_ok: false,
    edge_functions_healthy: {},
    rate_limit_ok: true,
    budget_ok: true,
  },
  active_provider: "lovable-ai-gateway",
  active_model: "google/gemini-3-flash-preview",
  last_successful_call: null,
  last_failure: null,
  error_details: null,
  timestamp: new Date().toISOString(),
};

export function useAIHealth(enabled = true) {
  return useQuery<AIHealthStatus>({
    queryKey: ["ai-health"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return { ...DEFAULT_HEALTH, error_details: "Not authenticated" };

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-health`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({}),
        }
      );

      if (!resp.ok) {
        return { ...DEFAULT_HEALTH, status: "unavailable" as const, error_details: `Health check failed: ${resp.status}` };
      }

      return resp.json();
    },
    enabled,
    refetchInterval: 120_000, // every 2 min
    staleTime: 60_000,
    retry: 1,
  });
}

/** Returns a user-friendly message for the current AI health state */
export function getAIStatusMessage(health: AIHealthStatus | undefined): string {
  if (!health || health.status === "unknown") return "AI status unknown — checking...";
  if (health.status === "healthy") return "AI runtime is healthy and operational";
  if (health.status === "degraded") {
    if (!health.checks.budget_ok) return "AI budget exhausted — upgrade or wait for reset";
    if (!health.checks.rate_limit_ok) return "AI rate limited — try again shortly";
    return health.error_details || "AI runtime is degraded";
  }
  return health.error_details || "AI runtime is unavailable — configuration required";
}

/** Check if a specific AI feature is available */
export function isAIFeatureAvailable(health: AIHealthStatus | undefined): boolean {
  if (!health) return false;
  return health.status === "healthy" || health.status === "degraded";
}
