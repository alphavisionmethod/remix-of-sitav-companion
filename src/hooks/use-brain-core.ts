import { useState, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  evaluatePolicy,
  classifyRiskTier,
  type PolicyEvaluationResult,
} from "@/lib/core-services/policy-engine";
import type { ReceiptService, Receipt } from "@/lib/core-services/receipt-service";
import { useSitaKernel } from "@/contexts/SitaKernelContext";

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
        const refusalReceipt = await receiptServiceRef.current.createReceipt(
          crypto.randomUUID(), "refusal",
          { intent, advisor, reason: policyResult.reason, riskTier }
        );
        setLastReceipt(refusalReceipt);
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

      // Generate execution receipt
      const receipt = await receiptServiceRef.current.createReceipt(
        data.correlation_id || crypto.randomUUID(),
        "execution-summary",
        { intent, advisor, confidence: data.confidence, source: data.source, model: data.model }
      );
      setLastReceipt(receipt);

      return data;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setError(msg);
      console.error("Brain Core error:", e);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [session, advisor]);

  return { ask, isLoading, lastResponse, error, lastPolicyResult, lastReceipt, receiptService: receiptServiceRef.current };
}

// ── Demo Mode Hook ──────────────────────────────────────────────────────────
export function useDemoMode() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: demoMode, isLoading } = useQuery({
    queryKey: ["demo-mode", user?.id],
    queryFn: async () => {
      if (!user) return true;
      const { data, error } = await (supabase as any)
        .from("profiles")
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
      const { error } = await (supabase as any)
        .from("profiles")
        .update({ demo_mode: newValue } as any)
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
export function useApprovalQueue() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: pendingApprovals = [], isLoading } = useQuery({
    queryKey: ["approval-queue", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await (supabase as any)
        .from("approval_queue")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
    refetchInterval: 30000,
  });

  const decide = useMutation({
    mutationFn: async ({ id, status, reason }: { id: string; status: "approved" | "rejected"; reason?: string }) => {
      const { error } = await (supabase as any)
        .from("approval_queue")
        .update({
          status,
          decided_at: new Date().toISOString(),
          decision_reason: reason || null,
        } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approval-queue"] });
    },
  });

  return { pendingApprovals, isLoading, approve: (id: string, reason?: string) => decide.mutate({ id, status: "approved", reason }), reject: (id: string, reason?: string) => decide.mutate({ id, status: "rejected", reason }) };
}
