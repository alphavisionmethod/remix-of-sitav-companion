// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Runtime Verification Hook
// Queries ai_usage_ledger + ai_inference_receipts for per-capability
// last invocation status, plus triggers ai-health smoke tests
// ═══════════════════════════════════════════════════════════════

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAIHealth, type AIHealthStatus } from "@/hooks/use-ai-health";

export interface CapabilityVerification {
  capability_key: string;
  last_status: "success" | "failure" | "degraded" | "never";
  last_invoked_at: string | null;
  provider: string | null;
  model: string | null;
  latency_ms: number | null;
  input_tokens: number | null;
  output_tokens: number | null;
  estimated_cost_usd: number | null;
  fallback_used: boolean;
  degraded_reason: string | null;
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
      // Get last invocation per capability from usage ledger
      const { data: ledgerRows } = await supabase
        .from("ai_usage_ledger")
        .select("capability_key, created_at, provider, model, latency_ms, input_tokens, output_tokens, estimated_cost_usd, status, fallback_used, degraded_reason, mode")
        .in("capability_key", TARGET_CAPABILITIES)
        .order("created_at", { ascending: false })
        .limit(100);

      // Get last receipt per capability
      const { data: receiptRows } = await supabase
        .from("ai_receipt_records")
        .select("capability_key, id, created_at, mode, degraded_reason, provider_id, model_id")
        .in("capability_key", TARGET_CAPABILITIES)
        .order("created_at", { ascending: false })
        .limit(100);

      // Build per-capability map
      const capMap = new Map<string, CapabilityVerification>();

      for (const cap of TARGET_CAPABILITIES) {
        const lastLedger = ledgerRows?.find((r: any) => r.capability_key === cap);
        const lastReceipt = receiptRows?.find((r: any) => r.capability_key === cap);

        const status: CapabilityVerification["last_status"] = !lastLedger
          ? "never"
          : lastLedger.status === "success"
            ? "success"
            : lastLedger.degraded_reason
              ? "degraded"
              : "failure";

        capMap.set(cap, {
          capability_key: cap,
          last_status: status,
          last_invoked_at: lastLedger?.created_at || null,
          provider: lastLedger?.provider || null,
          model: lastLedger?.model || null,
          latency_ms: lastLedger?.latency_ms || null,
          input_tokens: lastLedger?.input_tokens || null,
          output_tokens: lastLedger?.output_tokens || null,
          estimated_cost_usd: lastLedger?.estimated_cost_usd || null,
          fallback_used: lastLedger?.fallback_used || false,
          degraded_reason: lastLedger?.degraded_reason || null,
          receipt_id: lastReceipt?.id || null,
          mode: lastLedger?.mode || lastReceipt?.mode || null,
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
