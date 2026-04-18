// ═══════════════════════════════════════════════════════════════
// SITA OS — useAdminSynthesis Hook
// Admin-grade synthesis for intelligence, audits, and workforce
// ═══════════════════════════════════════════════════════════════

import { useCallback } from "react";
import { useAICapability } from "./use-ai-capability";

interface UseAdminSynthesisOptions {
  capabilityKey?: string;
  systemPrompt?: string;
}

export function useAdminSynthesis(options: UseAdminSynthesisOptions = {}) {
  const {
    capabilityKey = "admin.synthesis",
    systemPrompt = "You are a senior internal operations analyst for SITA OS. Produce executive-grade analysis with structured findings, severity ratings, and actionable recommendations.",
  } = options;

  const ai = useAICapability();

  const synthesize = useCallback(async (contextData: string) => {
    return ai.invoke({
      capabilityKey,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: contextData },
      ],
      taskClass: "premium_synthesis",
      surface: "web.admin",
      intent: "analyze",
    });
  }, [capabilityKey, systemPrompt, ai.invoke]);

  return {
    ...ai,
    synthesize,
    regenerate: ai.retry,
  };
}
