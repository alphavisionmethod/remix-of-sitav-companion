/**
 * SITA OS — Canonical AI Receipt Logger
 * Logs every AI invocation to both ai_usage_ledger and ai_inference_receipts
 * so AIG04 Budget Center and AIG05 Receipts Explorer see all usage.
 */

interface AIReceiptParams {
  userId: string;
  capabilityKey: string;
  model: string;
  provider: string;
  inputTokens: number;
  outputTokens: number;
  estimatedCostUsd: number;
  latencyMs: number;
  mode?: string;
  status?: string;
  routeReason?: string;
  correlationId?: string;
}

/**
 * Log an AI invocation to both canonical tables in parallel.
 * Fire-and-forget safe — catches all errors internally.
 */
export async function logAIReceipt(
  serviceClient: any,
  params: AIReceiptParams
): Promise<void> {
  const {
    userId,
    capabilityKey,
    model,
    provider,
    inputTokens,
    outputTokens,
    estimatedCostUsd,
    latencyMs,
    mode = "real",
    status = "success",
    routeReason = "direct_call",
    correlationId,
  } = params;

  const totalTokens = inputTokens + outputTokens;

  try {
    await Promise.allSettled([
      // 1. ai_usage_ledger — the canonical spend/token table
      serviceClient.from("ai_usage_ledger").insert({
        user_id: userId,
        capability_key: capabilityKey,
        model,
        provider,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        total_tokens: totalTokens,
        estimated_cost_usd: estimatedCostUsd,
        latency_ms: latencyMs,
        mode,
        status,
        route_reason: routeReason,
      }),

      // 2. ai_inference_receipts — detailed trace for AIG05
      serviceClient.from("ai_inference_receipts").insert({
        user_id: userId,
        model,
        provider,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        cost_estimate_cents: Math.round(estimatedCostUsd * 100),
        latency_ms: latencyMs,
        route_reason: routeReason,
        hash: correlationId || crypto.randomUUID(),
      }),
    ]);
  } catch (e) {
    console.error("AI receipt logging error:", e);
  }
}
