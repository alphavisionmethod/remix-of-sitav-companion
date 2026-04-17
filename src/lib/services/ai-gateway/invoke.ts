// ═══════════════════════════════════════════════════════════════
// SITA OS — invokeAI Convenience Wrapper (Phase 21 — Prompt Family Required)
// Typed wrapper around supabase.functions.invoke("ai-gateway")
// with automatic workforce invocation logging.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";

/** Risk tiers requiring registered prompt family (no inline system strings). */
const R3_PLUS_RISK_TIERS = new Set(["R3", "R4", "R5"]);

/** Capability keys requiring promptFamilyId (sovereign-ai-gateway constraint #9). */
const PROMPT_FAMILY_REQUIRED_CAPABILITIES = new Set([
  "advisor.money.system",
  "advisor.strategy.system",
  "boardroom.synthesis",
]);

export interface InvokeAIParams {
  messages: Array<{ role: string; content: string }>;
  model?: string;
  task_key?: string;
  role_key?: string;
  capabilityId?: string;
  taskClass?: string;
  maxTokens?: number;
  temperature?: number;
  /** Required for R3+ capabilities — references ai_prompt_families.family_id */
  promptFamilyId?: string;
  /** Variables to interpolate into the prompt template */
  promptVars?: Record<string, unknown>;
  /** Risk tier of this call (default R1) */
  riskTier?: "R0" | "R1" | "R2" | "R3" | "R4" | "R5";
  /** Allow inline system messages without promptFamilyId (R0/R1 only) */
  allowAdHoc?: boolean;
}

export interface InvokeAIResponse {
  content: string;
  model: string;
  tokens_used: number;
  cost_cents: number;
  promptVersionId?: string;
}

/**
 * Invoke the AI gateway edge function with workforce tracking + prompt family enforcement.
 * - R3+ capabilities MUST pass promptFamilyId (no inline system strings).
 * - Inline `system` messages allowed only for R0/R1 with allowAdHoc=true.
 */
export async function invokeAI(params: InvokeAIParams): Promise<InvokeAIResponse> {
  const startMs = Date.now();
  const riskTier = params.riskTier ?? "R1";
  const hasInlineSystem = params.messages.some(m => m.role === "system");

  // ─── Phase 21 enforcement: block raw prompts on R3+ ───
  if (R3_PLUS_RISK_TIERS.has(riskTier) || (params.capabilityId && PROMPT_FAMILY_REQUIRED_CAPABILITIES.has(params.capabilityId))) {
    if (!params.promptFamilyId) {
      throw new Error(
        `[ai-gateway] Risk tier ${riskTier} requires promptFamilyId. ` +
        `Capability "${params.capabilityId ?? "unknown"}" cannot use inline system messages.`,
      );
    }
    if (hasInlineSystem && !params.allowAdHoc) {
      throw new Error(
        `[ai-gateway] R3+ calls cannot include inline system messages. ` +
        `Remove system role or use allowAdHoc=true (R0/R1 only).`,
      );
    }
  }

  const { data, error } = await supabase.functions.invoke("ai-gateway", {
    body: {
      messages: params.messages,
      model: params.model,
      taskClass: params.taskClass ?? "balanced_assistant",
      maxTokens: params.maxTokens,
      temperature: params.temperature,
      capabilityId: params.capabilityId,
      promptFamilyId: params.promptFamilyId,
      promptVars: params.promptVars,
      riskTier,
    },
  });

  if (error) throw new Error((error as Error)?.message ?? (String(error) || "AI Gateway error"));

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
        scope_payload: { promptFamilyId: params.promptFamilyId, promptVersionId: result.promptVersionId },
      }).then(() => {});
    }
  }

  return result;
}
