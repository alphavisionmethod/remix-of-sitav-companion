// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Gateway Callable Functions
// Direct callers for brain-core and ai-gateway edge functions.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

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
 */
export async function callBrainCore(
  advisor: string,
  intent: string,
  context?: Record<string, unknown>,
): Promise<BrainCoreResponse> {
  const { data, error } = await supabase.functions.invoke("brain-core", {
    body: { intent, advisor, context: context || {} },
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
  if (error) throw new Error((error as Error)?.message ?? String(error) || "AI Gateway error");
  return data as AIGatewayResponse;
}

