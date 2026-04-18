// ═══════════════════════════════════════════════════════════════
// SITA OS — useMemorySummary Hook
// Thin hook for memory.summarize capability
// ═══════════════════════════════════════════════════════════════

import { useCallback } from "react";
import { useAICapability } from "./use-ai-capability";
import type { AIResponseEnvelope } from "../ai-state-types";

interface UseMemorySummaryOptions {
  onSuccess?: (response: AIResponseEnvelope) => void;
  onError?: (response: AIResponseEnvelope) => void;
}

export function useMemorySummary(options: UseMemorySummaryOptions = {}) {
  const ai = useAICapability(options);

  const summarize = useCallback(
    async (content: string, context?: string): Promise<AIResponseEnvelope> => {
      return ai.invoke({
        capabilityKey: "memory.summarize",
        messages: [
          {
            role: "system",
            content:
              "You are a memory synthesis assistant for SITA OS. Summarize the provided content into clear, actionable insights.",
          },
          {
            role: "user",
            content: context ? `Context: ${context}\n\nContent:\n${content}` : content,
          },
        ],
        taskClass: "balanced_assistant",
        surface: "web.utility",
        intent: "summarize",
        receiptRequested: true,
      });
    },
    [ai.invoke],
  );

  return {
    ...ai,
    summarize,
  };
}
