// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Runtime Verification Hook
// ═══════════════════════════════════════════════════════════════

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
const db = supabase as any;
import { useAIHealth, type AIHealthStatus } from "@/platform/governance/hooks/use-ai-health";

export interface CapabilityVerification {
  capability_key: string;
  last_status: "success" | "failure" | "degraded" | "never";
  last_invoked_at: string | null;
  provider_id: string | null;
  model_id: string | null;
  latency_ms: number | null;
  prompt_tokens: number | null;
  completion_tokens: number | null;
  estimated_cost_usd: number | null;
  error_summary: string | null;
  receipt_id: string | null;
  mode: string | null;
}

const TARGET_CAPABILITIES = [
  "advisor.chat.primary",
  "boardroom.weekly.summary",
  "daily_pulse.generate",
  "classification.extract",
  "admin.synthesis",
  "utility.extract",
  "admin.ai_workforce.run",
];

export function useAIRuntimeVerification() {
  const healthQuery = useAIHealth(true);
  const queryClient = useQueryClient();

  const capabilityMatrix = useQuery<CapabilityVerification[]>({
    queryKey: ["ai-runtime-verification-matrix"],
    queryFn: async () => {
      const { data: ledgerRows } = await db
        .from("ai_usage_ledger")
        .select("capability_key, created_at, provider_id, model_id, latency_ms, prompt_tokens, completion_tokens, estimated_cost_usd, status, error_summary, error_code, receipt_id, mode")
        .in("capability_key", TARGET_CAPABILITIES)
        .order("created_at", { ascending: false })
        .limit(100) as { data: any[] | null };

      const capMap = new Map<string, CapabilityVerification>();

      for (const cap of TARGET_CAPABILITIES) {
        const lastRow = (ledgerRows ?? []).find((r: any) => r.capability_key === cap);

        const status: CapabilityVerification["last_status"] = !lastRow
          ? "never"
          : lastRow.status === "success"
            ? "success"
            : lastRow.error_code
              ? "failure"
              : "degraded";

        capMap.set(cap, {
          capability_key: cap,
          last_status: status,
          last_invoked_at: lastRow?.created_at || null,
          provider_id: lastRow?.provider_id || null,
          model_id: lastRow?.model_id || null,
          latency_ms: lastRow?.latency_ms || null,
          prompt_tokens: lastRow?.prompt_tokens || null,
          completion_tokens: lastRow?.completion_tokens || null,
          estimated_cost_usd: lastRow?.estimated_cost_usd || null,
          error_summary: lastRow?.error_summary || null,
          receipt_id: lastRow?.receipt_id || null,
          mode: lastRow?.mode || null,
        });
      }

      return Array.from(capMap.values());
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const runSmokeTest = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-health`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ run_full_matrix: true }),
        }
      );
      if (!resp.ok) throw new Error(`Health check failed: ${resp.status}`);
      return resp.json() as Promise<AIHealthStatus>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-health"] });
      queryClient.invalidateQueries({ queryKey: ["ai-runtime-verification-matrix"] });
    },
  });

  return {
    health: healthQuery.data,
    healthLoading: healthQuery.isLoading,
    capabilities: capabilityMatrix.data ?? [],
    capabilitiesLoading: capabilityMatrix.isLoading,
    runSmokeTest,
  };
}
