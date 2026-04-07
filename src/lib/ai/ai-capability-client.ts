// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Capability Client
// The ONE canonical client for all AI invocations across SITA OS
// No surface may call providers directly. All AI routes through here.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import { normalizeGatewayResponse } from "./ai-response-normalizer";
import type { AICapabilityRequest, AIResponseEnvelope } from "./ai-state-types";

const AI_GATEWAY_FUNCTION = "ai-gateway";

/**
 * Invoke an AI capability through the sovereign gateway.
 * This is the ONLY function any frontend surface should use.
 */
export async function invokeAICapability(
  request: AICapabilityRequest,
): Promise<AIResponseEnvelope> {
  const { capabilityKey, messages, taskClass, maxTokens, temperature, stream } = request;

  try {
    const { data, error } = await supabase.functions.invoke(AI_GATEWAY_FUNCTION, {
      body: {
        capabilityId: capabilityKey,
        taskClass: taskClass ?? "balanced_assistant",
        messages,
        stream: stream ?? false,
        maxTokens,
        temperature,
      },
    });

    if (error) {
      // Supabase functions.invoke wraps HTTP errors
      const status = (error as Record<string, unknown>)?.status ?? 500;
      const errorBody = typeof data === "object" ? data : { error: error.message };
      return normalizeGatewayResponse(errorBody ?? {}, capabilityKey, status);
    }

    return normalizeGatewayResponse(data, capabilityKey, 200);
  } catch (err) {
    return normalizeGatewayResponse(
      { error: err instanceof Error ? err.message : "Network error" },
      capabilityKey,
      0,
    );
  }
}

/**
 * Invoke a one-shot synthesis capability (boardroom summary, daily pulse, etc.)
 */
export async function invokeSynthesis(
  capabilityKey: string,
  systemPrompt: string,
  userPrompt: string,
  options?: {
    taskClass?: AICapabilityRequest["taskClass"];
    maxTokens?: number;
    temperature?: number;
  },
): Promise<AIResponseEnvelope> {
  return invokeAICapability({
    capabilityKey,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    taskClass: options?.taskClass ?? "balanced_assistant",
    maxTokens: options?.maxTokens,
    temperature: options?.temperature,
    surface: "web.admin",
    intent: "summarize",
  });
}

/**
 * Invoke a utility AI capability (classify, extract, transform)
 */
export async function invokeUtility(
  capabilityKey: string,
  systemPrompt: string,
  content: string,
  options?: {
    maxTokens?: number;
    temperature?: number;
  },
): Promise<AIResponseEnvelope> {
  return invokeAICapability({
    capabilityKey,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: content },
    ],
    taskClass: "cheap_utility",
    maxTokens: options?.maxTokens ?? 500,
    temperature: options?.temperature ?? 0,
    surface: "web.utility",
    intent: "extract",
  });
}
