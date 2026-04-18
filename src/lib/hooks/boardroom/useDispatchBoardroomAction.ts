// ═══════════════════════════════════════════════════════════════
// Hook: useDispatchBoardroomAction
// Mutation wrapper that calls the canonical boardroom-followthrough-dispatch
// edge function and returns dispatch metadata.
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface DispatchActionInput {
  boardroomItemId: string;
  recommendationId?: string;
  approvalQueueId?: string;
  actionType: string;
  actionPayload: Record<string, unknown>;
  riskTier?: "standard" | "elevated" | "critical";
  metadata?: Record<string, unknown>;
}

export interface DispatchActionResult {
  ok: boolean;
  dispatch_id?: string;
  correlation_id?: string;
  command_id?: string | null;
  command_step_id?: string | null;
  executor_error?: string | null;
  error?: string;
}

export function useDispatchBoardroomAction() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DispatchActionResult | null>(null);

  const dispatch = useCallback(async (input: DispatchActionInput): Promise<DispatchActionResult> => {
    setPending(true);
    setError(null);
    try {
      const { data, error: invokeError } = await supabase.functions.invoke<DispatchActionResult>(
        "boardroom-followthrough-dispatch",
        {
          body: {
            boardroom_item_id: input.boardroomItemId,
            recommendation_id: input.recommendationId,
            approval_queue_id: input.approvalQueueId,
            action_type: input.actionType,
            action_payload: input.actionPayload,
            risk_tier: input.riskTier ?? "standard",
            metadata: input.metadata ?? {},
          },
        },
      );
      if (invokeError) {
        const msg = invokeError.message ?? "dispatch invocation failed";
        setError(msg);
        const failure: DispatchActionResult = { ok: false, error: msg };
        setResult(failure);
        return failure;
      }
      const ok = data ?? { ok: false, error: "empty response" };
      setResult(ok);
      if (!ok.ok && ok.error) setError(ok.error);
      return ok;
    } catch (e) {
      const msg = (e as Error).message;
      setError(msg);
      const failure: DispatchActionResult = { ok: false, error: msg };
      setResult(failure);
      return failure;
    } finally {
      setPending(false);
    }
  }, []);

  return { dispatch, pending, error, result };
}
