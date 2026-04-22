/**
 * SITA OS — Action Receipt Emitter
 * Emits receipts to ai_action_receipts for any edge function action.
 * Fire-and-forget safe — catches all errors internally.
 */

interface ActionReceiptParams {
  userId: string;
  actionType: string;
  recommendationSummary: string;
  confidence?: number;
  riskTier?: string;
  status?: string;
  actionPayload?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  invocationId?: string;
}

export async function emitActionReceipt(
  serviceClient: any,
  params: ActionReceiptParams
): Promise<string | null> {
  const receiptId = crypto.randomUUID();
  try {
    const { error } = await serviceClient.from("ai_action_receipts").insert({
      user_id: params.userId,
      action_type: params.actionType,
      recommendation_summary: params.recommendationSummary,
      confidence: params.confidence ?? 0.5,
      risk_tier: params.riskTier ?? "low",
      status: params.status ?? "completed",
      action_payload: params.actionPayload ?? {},
      metadata: params.metadata ?? {},
      receipt_id: receiptId,
      invocation_id: params.invocationId ?? null,
    });
    if (error) {
      console.error("Receipt emission failed:", error.message);
      return null;
    }
    return receiptId;
  } catch (e) {
    console.error("Receipt emission error:", e);
    return null;
  }
}