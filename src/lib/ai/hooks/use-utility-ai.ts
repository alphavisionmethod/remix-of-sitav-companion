// ═══════════════════════════════════════════════════════════════
// SITA OS — useUtilityAI Hook
// Lightweight utility AI: classify, extract, transform, label
// ═══════════════════════════════════════════════════════════════

import { useCallback } from "react";
import { useAICapability } from "./use-ai-capability";
import type { AIRequestIntent } from "../ai-state-types";

interface UseUtilityAIOptions {
  capabilityKey?: string;
  intent?: AIRequestIntent;
}

export function useUtilityAI(options: UseUtilityAIOptions = {}) {
  const {
    capabilityKey = "utility.extract",
    intent = "extract",
  } = options;

  const ai = useAICapability();

  const execute = useCallback(async (systemPrompt: string, input: string) => {
    return ai.invoke({
      capabilityKey,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: input },
      ],
      taskClass: "cheap_utility",
      surface: "web.utility",
      intent,
      maxTokens: 500,
      temperature: 0,
    });
  }, [capabilityKey, intent, ai.invoke]);

  return {
    ...ai,
    execute,
  };
}
