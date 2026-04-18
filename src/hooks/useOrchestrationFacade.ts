// ═══════════════════════════════════════════════════════════════
// SITA OS — useOrchestrationFacade Hook
// Primary hook: calls facade only. No orchestration logic here.
// ═══════════════════════════════════════════════════════════════

import { useCallback, useRef, useState } from "react";
import { orchestrationFacade, type ProcessIntentRequest, type OrchestrationResult } from "@/platform/orchestration";

export function useOrchestrationFacade() {
  const [result, setResult] = useState<OrchestrationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const facadeRef = useRef(orchestrationFacade);

  const processIntent = useCallback(async (request: ProcessIntentRequest) => {
    setIsProcessing(true);
    setError(null);
    try {
      const res = await facadeRef.current.processIntent(request);
      setResult(res);
      return res;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return { processIntent, result, isProcessing, error };
}
