// ═══════════════════════════════════════════════════════════════
// SITA OS — useBoardroomSummary Hook
// One-shot synthesis for boardroom/weekly summaries
// ═══════════════════════════════════════════════════════════════

import { useCallback } from "react";
import { invokeSynthesis } from "../ai-capability-client";
import { useAICapability } from "./use-ai-capability";

interface UseBoardroomSummaryOptions {
  capabilityKey?: string;
  systemPrompt?: string;
}

export function useBoardroomSummary(options: UseBoardroomSummaryOptions = {}) {
  const {
    capabilityKey = "boardroom.weekly.summary",
    systemPrompt = "You are a senior business intelligence analyst for SITA OS. Generate a concise executive summary.",
  } = options;

  const ai = useAICapability();

  const generate = useCallback(async (contextData: string) => {
    return ai.invoke({
      capabilityKey,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: contextData },
      ],
      taskClass: "premium_synthesis",
      surface: "web.boardroom",
      intent: "summarize",
    });
  }, [capabilityKey, systemPrompt, ai.invoke]);

  return {
    ...ai,
    generate,
    regenerate: ai.retry,
  };
}
