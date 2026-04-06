// ═══════════════════════════════════════════════════════════════
// SITA OS — useAICapability Hook
// Canonical hook for invoking any AI capability
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback, useRef } from "react";
import { invokeAICapability } from "../ai-capability-client";
import type { AICapabilityRequest, AIResponseEnvelope, AIState } from "../ai-state-types";

interface UseAICapabilityOptions {
  /** Auto-retry on transient failure */
  retryOnFailure?: boolean;
  /** Callback on success */
  onSuccess?: (response: AIResponseEnvelope) => void;
  /** Callback on error/degraded */
  onError?: (response: AIResponseEnvelope) => void;
}

interface UseAICapabilityReturn {
  state: AIState;
  response: AIResponseEnvelope | null;
  invoke: (request: AICapabilityRequest) => Promise<AIResponseEnvelope>;
  retry: () => Promise<AIResponseEnvelope | null>;
  reset: () => void;
  isLoading: boolean;
  isSuccess: boolean;
  isDegraded: boolean;
  isError: boolean;
}

export function useAICapability(options: UseAICapabilityOptions = {}): UseAICapabilityReturn {
  const [state, setState] = useState<AIState>("idle");
  const [response, setResponse] = useState<AIResponseEnvelope | null>(null);
  const lastRequestRef = useRef<AICapabilityRequest | null>(null);

  const invoke = useCallback(async (request: AICapabilityRequest): Promise<AIResponseEnvelope> => {
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

  const retry = useCallback(async (): Promise<AIResponseEnvelope | null> => {
    if (!lastRequestRef.current) return null;
    return invoke(lastRequestRef.current);
  }, [invoke]);

  const reset = useCallback(() => {
    setState("idle");
    setResponse(null);
  }, []);

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
  };
}
