// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Gateway Callable Functions
// Direct callers for brain-core and ai-gateway edge functions.
// ConscienceGate pre-flight validation before edge function calls.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
const db = supabase as any;
import { conscienceGate } from "@/lib/services/conscience-gate";

export interface BrainCoreResponse {
  request_id: string;
  correlation_id: string;
  advisor: string;
  recommendation: string;
  confidence: number;
  reasoning: string;
  actions: Array<{ type: string; description?: string; priority?: string }>;
  source: "rules" | "ai" | "fallback" | "error" | "composed";
  requiresApproval: boolean;
  model?: string;
  tokens?: number;
}

export interface AIGatewayResponse {
  content: string;
  model: string;
  tokens_used: number;
  cost_cents: number;
}

/**
 * Call brain-core for advisor intelligence.
 * Runs ConscienceGate pre-flight validation before the edge function call.
 */
export async function callBrainCore(
  advisor: string,
  intent: string,
  context?: Record<string, unknown>,
): Promise<BrainCoreResponse> {
  // Pre-flight: ConscienceGate validation
  const gateVerdict = await conscienceGate.evaluate({
    taskType: `advisor.${advisor}`,
    userId: context?.userId as string || "anonymous",
    tenantId: context?.tenantId as string || "default",
    input: { intent, advisor, ...(context || {}) },
    correlationId: crypto.randomUUID(),
  });

  if (gateVerdict.decision === "block" || gateVerdict.decision === "refuse") {
    return {
      request_id: crypto.randomUUID(),
      correlation_id: gateVerdict.correlationId || crypto.randomUUID(),
      advisor,
      recommendation: `Request blocked by ConscienceGate: ${gateVerdict.reasons.join("; ")}`,
      confidence: 0,
      reasoning: gateVerdict.reasons.join("; "),
      actions: [],
      source: "error",
      requiresApproval: false,
    };
  }

  const { data, error } = await supabase.functions.invoke("brain-core", {
    body: {
      intent,
      advisor,
      context: {
        ...(context || {}),
        gateDecision: gateVerdict.decision,
        gateRiskClass: gateVerdict.riskClass,
      },
    },
  });
  if (error) throw new Error((error as Error)?.message ?? (String(error) || "Brain Core error"));
  return data as BrainCoreResponse;
}

/**
 * Call ai-gateway for general AI completions.
 */
export async function callAIGateway(
  messages: Array<{ role: string; content: string }>,
  options?: { taskClass?: string; maxTokens?: number; temperature?: number },
): Promise<AIGatewayResponse> {
  const { data, error } = await supabase.functions.invoke("ai-gateway", {
    body: {
      messages,
      taskClass: options?.taskClass ?? "balanced_assistant",
      maxTokens: options?.maxTokens,
      temperature: options?.temperature,
    },
  });
  if (error) throw new Error((error as Error)?.message ?? (String(error) || "AI Gateway error"));
  return data as AIGatewayResponse;
}
