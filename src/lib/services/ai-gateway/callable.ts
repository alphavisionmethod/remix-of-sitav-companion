// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Gateway Callable Functions
// Direct callers for brain-core and ai-gateway edge functions.
// ConscienceGate pre-flight + Negative Receipts on block.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
const db = supabase as any;
import { conscienceGate } from "@/lib/services/conscience-gate";
import { createNegativeReceipt, type NegativeReceipt } from "@/lib/services/epistemic-firewall";

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
  /** Structured refusal record if the request was blocked */
  negativeReceipt?: NegativeReceipt;
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
 * Emits a structured NegativeReceipt on block/refuse.
 */
export async function callBrainCore(
  advisor: string,
  intent: string,
  context?: Record<string, unknown>,
): Promise<BrainCoreResponse> {
  const correlationId = crypto.randomUUID();

  // Pre-flight: ConscienceGate validation
  const gateVerdict = await conscienceGate.evaluate({
    taskType: `advisor.${advisor}`,
    userId: context?.userId as string || "anonymous",
    tenantId: context?.tenantId as string || "default",
    input: { intent, advisor, ...(context || {}) },
    correlationId,
  });

  if (gateVerdict.decision === "block" || gateVerdict.decision === "refuse") {
    // Emit structured negative receipt instead of vague error
    const negReceipt = createNegativeReceipt({
      taskType: `advisor.${advisor}`,
      domain: "platform",
      riskTier: "elevated",
      correlationId: gateVerdict.correlationId || correlationId,
      userId: context?.userId as string,
      blockedAction: `Advisor ${advisor}: ${intent}`,
      blockedDescription: `ConscienceGate ${gateVerdict.decision}: ${gateVerdict.reasons.join("; ")}`,
      refusalReasons: ["policy-blocked"],
      policyTriggered: gateVerdict.reasons,
      details: `The ConscienceGate blocked this advisor request. Risk class: ${gateVerdict.riskClass}. Reasons: ${gateVerdict.reasons.join("; ")}`,
      missingRequirements: gateVerdict.reasons,
      suggestedActions: [
        { action: "Rephrase request", description: "Try a more specific or lower-risk request.", actionType: "retry" },
        { action: "Request elevated access", description: "Contact admin for elevated permissions.", actionType: "escalate" },
      ],
      gateSource: "conscience-gate",
      severity: gateVerdict.decision === "refuse" ? "critical" : "warning",
    });

    return {
      request_id: crypto.randomUUID(),
      correlation_id: gateVerdict.correlationId || correlationId,
      advisor,
      recommendation: `Request blocked: ${gateVerdict.reasons.join("; ")}`,
      confidence: 0,
      reasoning: gateVerdict.reasons.join("; "),
      actions: [],
      source: "error",
      requiresApproval: false,
      negativeReceipt: negReceipt,
    };
  }

  const { data, error } = await db.functions.invoke("brain-core", {
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
  const { data, error } = await db.functions.invoke("ai-gateway", {
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
