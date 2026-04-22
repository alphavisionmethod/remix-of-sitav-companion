import { useState, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  evaluatePolicy,
  classifyRiskTier,
  type PolicyEvaluationResult,
} from "@/lib/core-services/policy-engine";
import type { ReceiptService, Receipt } from "@/lib/core-services/receipt-service";
import { useSitaKernel } from "@/contexts/SitaKernelContext";
import { useDataMode } from "@/contexts/DataModeContext";

export interface AdvisorResponse {
  request_id: string;
  correlation_id: string;
  advisor: string;
  recommendation: string;
  confidence: number;
  reasoning: string;
  actions: Array<{ type: string; description?: string; priority?: string; [key: string]: unknown }>;
  source: "rules" | "ai" | "fallback" | "error" | "composed";
  requiresApproval: boolean;
  model?: string;
  tokens?: number;
  complexity?: string;
  latency_ms?: number;
}

interface UseBrainCoreOptions {
  advisor: "money" | "business" | "concierge" | "family" | "growth" | "general";
  secondaryAdvisor?: "money" | "business" | "concierge" | "family" | "growth" | "general";
}

export function useBrainCore({ advisor, secondaryAdvisor }: UseBrainCoreOptions) {
  const { session } = useAuth();
  const kernel = useSitaKernel();
  const [isLoading, setIsLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState<AdvisorResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastPolicyResult, setLastPolicyResult] = useState<PolicyEvaluationResult | null>(null);
  const [lastReceipt, setLastReceipt] = useState<Receipt | null>(null);

  const ask = useCallback(async (intent: string, context?: Record<string, unknown>): Promise<AdvisorResponse | null> => {
    if (!session?.access_token) {
      setError("Not authenticated");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Client-side policy pre-check
      const domain = advisor === "general" ? "general" : advisor;
      const riskTier = classifyRiskTier(domain, intent, context?.amount as number | undefined);
      const policyResult = evaluatePolicy({
        domain,
        capabilityId: intent,
        riskTier,
        amount: context?.amount as number | undefined,
        isSimulation: context?.isSimulation as boolean | undefined,
        hasStaleSources: context?.hasStaleSources as boolean | undefined,
        contradictionCount: context?.contradictionCount as number | undefined,
      });
      setLastPolicyResult(policyResult);

      // If policy denies, skip the network call
      if (policyResult.effect === "deny") {
        const refusalReceipt = await kernel.createReceipt(
          crypto.randomUUID(), "refusal",
          { intent, advisor, reason: policyResult.reason, riskTier }
        );
        setLastReceipt(refusalReceipt);
        await kernel.emitEvent("advisor.denied.v1", { advisor, intent, reason: policyResult.reason });
        setError(`Policy blocked: ${policyResult.reason}`);
        return null;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/brain-core`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ intent, advisor, context, secondary_advisor: secondaryAdvisor }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          setError("Rate limited — try again in a moment.");
          return null;
        }
        if (response.status === 402) {
          setError("AI credits exhausted. Add funds in Settings → Workspace → Usage.");
          return null;
        }
        const text = await response.text();
        throw new Error(`Brain Core error: ${response.status} — ${text}`);
      }

      const data: AdvisorResponse = await response.json();
      setLastResponse(data);

      // Generate execution receipt via shared kernel
      const receipt = await kernel.createReceipt(
        data.correlation_id || crypto.randomUUID(),
        "execution-summary",
        { intent, advisor, confidence: data.confidence, source: data.source, model: data.model }
      );
      setLastReceipt(receipt);

      // Emit advisor response event + store in shared memory
      await kernel.emitEvent("advisor.response.v1", {
        advisor, intent, confidence: data.confidence, source: data.source,
      }, data.correlation_id);
      kernel.storeMemory(`advisor.${advisor}.lastResponse`, {
        intent, confidence: data.confidence, recommendation: data.recommendation,
        timestamp: Date.now(),
      }, { source: `advisor-${advisor}`, tags: [advisor, "advisor-response"] });

      return data;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setError(msg);
      console.error("Brain Core error:", e);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [session, advisor, kernel]);

  return { ask, isLoading, lastResponse, error, lastPolicyResult, lastReceipt, receiptService: kernel.receipts };
}

// ── Demo Mode Hook ──────────────────────────────────────────────────────────
export function useDemoMode() {
  const { isDemoMode } = useDataMode();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: demoMode, isLoading } = useQuery({
    queryKey: ["demo-mode", user?.id],
    queryFn: async () => {
      if (!user) return true;
      const { data, error } = await fromTable("profiles")
        .select("demo_mode")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data?.demo_mode ?? true;
    },
    enabled: !!user,
  });

  const toggleDemoMode = useMutation({
    mutationFn: async (newValue: boolean) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await fromTable("profiles")
        .update({ demo_mode: newValue } as never)
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["demo-mode"] });
    },
  });

  return {
    isDemoMode: demoMode ?? true,
    isLoading,
    toggleDemoMode: () => toggleDemoMode.mutate(!(demoMode ?? true)),
    setDemoMode: (val: boolean) => toggleDemoMode.mutate(val),
  };
}

// ── Event Emitter Hook ──────────────────────────────────────────────────────
export function useEventEmitter() {
  const { session } = useAuth();

  const emit = useCallback(async (type: string, payload?: Record<string, unknown>, source?: string) => {
    if (!session?.access_token) return;

    try {
      await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/event-processor`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ mode: "emit", type, payload: payload || {}, source: source || "user" }),
        }
      );
    } catch (e) {
      console.error("Event emit error:", e);
    }
  }, [session]);

  return { emit };
}

// ── Approval Queue Hook ─────────────────────────────────────────────────────
// Canonical: reads from `ai_workforce_approval_queue` directly.
// Uses bindExecution() on approve so the full REX chain runs.
export function useApprovalQueue() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: pendingApprovals = [], isLoading } = useQuery({
    queryKey: ["approval-queue", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await (supabase as any)
        .from("ai_workforce_approval_queue")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
    refetchInterval: 30000,
  });

  const decide = useMutation({
    mutationFn: async ({ id, status, reason }: { id: string; status: "approved" | "rejected"; reason?: string }) => {
      const { data: updated, error } = await (supabase as any)
        .from("ai_workforce_approval_queue")
        .update({
          status,
          decision_at: new Date().toISOString(),
          reviewer_comments: reason || null,
          reviewer_user_id: user?.id ?? null,
        })
        .eq("id", id)
        .select("id, recommendation_id")
        .maybeSingle();
      if (error) throw error;

      // Advance the linked recommendation lifecycle + run execution chain on approve
      if (updated?.recommendation_id) {
        if (status === "approved") {
          const { data: rec } = await (supabase as any)
            .from("ai_workforce_recommendations")
            .select("id, execution_required")
            .eq("id", updated.recommendation_id)
            .maybeSingle();
          if (rec?.execution_required) {
            try {
              const { bindExecution } = await import("@/lib/services/rex/recommendation-engine");
              await bindExecution(rec.id, id, { bindingType: "remediation_task" });
            } catch (e) {
              console.error("[useApprovalQueue] bindExecution failed:", e);
            }
          } else {
            await (supabase as any)
              .from("ai_workforce_recommendations")
              .update({ lifecycle_status: "approved", approval_decision_at: new Date().toISOString(), approved_by_user_id: user?.id })
              .eq("id", updated.recommendation_id);
          }
        } else {
          await (supabase as any)
            .from("ai_workforce_recommendations")
            .update({ lifecycle_status: "rejected", approval_decision_at: new Date().toISOString(), rejected_by_user_id: user?.id })
            .eq("id", updated.recommendation_id);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approval-queue"] });
      queryClient.invalidateQueries({ queryKey: ["approvals"] });
      queryClient.invalidateQueries({ queryKey: ["pending-approvals"] });
    },
  });

  return {
    pendingApprovals,
    isLoading,
    approve: (id: string, reason?: string) => decide.mutate({ id, status: "approved", reason }),
    reject: (id: string, reason?: string) => decide.mutate({ id, status: "rejected", reason }),
  };
}
