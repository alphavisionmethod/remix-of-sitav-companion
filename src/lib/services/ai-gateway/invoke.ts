// ═══════════════════════════════════════════════════════════════
// SITA OS — invokeAI Convenience Wrapper
// Typed wrapper around supabase.functions.invoke("ai-gateway")
// with automatic workforce invocation logging.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";

export interface InvokeAIParams {
  messages: Array<{ role: string; content: string }>;
  model?: string;
  task_key?: string;
  role_key?: string;
  capabilityId?: string;
  taskClass?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface InvokeAIResponse {
  content: string;
  model: string;
  tokens_used: number;
  cost_cents: number;
}

/**
 * Invoke the AI gateway edge function with workforce tracking.
 * Logs a row to ai_workforce_invocations on success.
 */
export async function invokeAI(params: InvokeAIParams): Promise<InvokeAIResponse> {
  const startMs = Date.now();

  const { data, error } = await supabase.functions.invoke("ai-gateway", {
    body: {
      messages: params.messages,
      model: params.model,
      taskClass: params.taskClass ?? "balanced_assistant",
      maxTokens: params.maxTokens,
      temperature: params.temperature,
      capabilityKey: params.capabilityId,
    },
  });

  if (error) throw new Error((error as Error)?.message ?? String(error) || "AI Gateway error");

  const result = data as InvokeAIResponse;
  const durationMs = Date.now() - startMs;

  // Log workforce invocation (fire-and-forget)
  if (params.role_key || params.task_key) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      fromTable("ai_workforce_invocations").insert({
        user_id: user.id,
        role_key: params.role_key ?? "gateway",
        task_key: params.task_key ?? "ai_call",
        status: "completed",
        model_used: result.model,
        tokens_in: Math.round((result.tokens_used ?? 0) * 0.7),
        tokens_out: Math.round((result.tokens_used ?? 0) * 0.3),
        cost_cents: result.cost_cents ?? 0,
        duration_ms: durationMs,
        mode: "standard",
        budget_posture: "normal",
        scope_payload: {},
      }).then(() => {});
    }
  }

  return result;
}
