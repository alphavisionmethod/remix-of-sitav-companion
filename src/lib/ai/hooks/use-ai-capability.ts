// ═══════════════════════════════════════════════════════════════
// SITA OS — useAICapability Hook
// Canonical hook for invoking any AI capability
// Now surfaces trust metadata from epistemic firewall
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback, useRef } from "react";
import { invokeAICapability, type TrustEnrichedResponse } from "../ai-capability-client";
import type { AICapabilityRequest, AIState } from "../ai-state-types";

interface UseAICapabilityOptions {
  /** Auto-retry on transient failure */
  retryOnFailure?: boolean;
  /** Callback on success */
  onSuccess?: (response: TrustEnrichedResponse) => void;
  /** Callback on error/degraded */
  onError?: (response: TrustEnrichedResponse) => void;
}

interface UseAICapabilityReturn {
  state: AIState;
  response: TrustEnrichedResponse | null;
  invoke: (request: AICapabilityRequest) => Promise<TrustEnrichedResponse>;
  retry: () => Promise<TrustEnrichedResponse | null>;
  reset: () => void;
  isLoading: boolean;
  isSuccess: boolean;
  isDegraded: boolean;
  isError: boolean;
  /** Trust metadata from the epistemic firewall */
  trustMetadata: TrustEnrichedResponse["trustMetadata"] | null;
  /** Whether the response has caveats */
  hasCaveats: boolean;
  /** Whether the response was blocked by safety checks */
  wasBlocked: boolean;
}

export function useAICapability(options: UseAICapabilityOptions = {}): UseAICapabilityReturn {
  const [state, setState] = useState<AIState>("idle");
  const [response, setResponse] = useState<TrustEnrichedResponse | null>(null);
  const lastRequestRef = useRef<AICapabilityRequest | null>(null);

  const invoke = useCallback(async (request: AICapabilityRequest): Promise<TrustEnrichedResponse> => {
    lastRequestRef.current = request;
    setState("loading");

    const result = await invokeAICapability(request);

    setState(result.status);
    setResponse(result);

    if (result.status.startsWith("success_")) {
      options.onSuccess?.(result);
    } else if (result.status !== "idle" && result.status !== "loading") {
      options.onError?.(result);
    }

    return result;
  }, [options.onSuccess, options.onError]);

  const retry = useCallback(async (): Promise<TrustEnrichedResponse | null> => {
    if (!lastRequestRef.current) return null;
    return invoke(lastRequestRef.current);
  }, [invoke]);

  const reset = useCallback(() => {
    setState("idle");
    setResponse(null);
  }, []);

  const trustMetadata = response?.trustMetadata ?? null;

  return {
    state,
    response,
    invoke,
    retry,
    reset,
    isLoading: state === "loading" || state === "streaming",
    isSuccess: state.startsWith("success_"),
    isDegraded: state.startsWith("degraded_") || state.startsWith("blocked_"),
    isError: state === "error" || state === "validation_failed" || state === "rate_limited" || state === "payment_required",
    trustMetadata,
    hasCaveats: (trustMetadata?.caveats?.length ?? 0) > 0,
    wasBlocked: !!trustMetadata?.negativeReceipt,
  };
}
