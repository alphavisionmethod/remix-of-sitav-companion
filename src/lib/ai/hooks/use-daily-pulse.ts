// ═══════════════════════════════════════════════════════════════
// SITA OS — useDailyPulse Hook
// Digest synthesis for daily pulse generation
// ═══════════════════════════════════════════════════════════════

import { useCallback } from "react";
import { useAICapability } from "./use-ai-capability";

interface UseDailyPulseOptions {
  capabilityKey?: string;
}

export function useDailyPulse(options: UseDailyPulseOptions = {}) {
  const { capabilityKey = "daily_pulse.generate" } = options;
  const ai = useAICapability();

  const generate = useCallback(async (contextData: string) => {
    return ai.invoke({
      capabilityKey,
      messages: [
        {
          role: "system",
          content: "You are a concise daily briefing generator for SITA OS. Summarize the key events, priorities, and actions for today in a calm, clear, actionable format.",
        },
        { role: "user", content: contextData },
      ],
      taskClass: "balanced_assistant",
      surface: "web.pulse",
      intent: "summarize",
      maxTokens: 800,
    });
  }, [capabilityKey, ai.invoke]);

  return {
    ...ai,
    generate,
    regenerate: ai.retry,
  };
}
