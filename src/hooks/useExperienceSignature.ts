// ═══════════════════════════════════════════════════════════════
// SITA OS — Experience Signature Hook
// Returns current tone, verbosity, visual density for components
// ═══════════════════════════════════════════════════════════════

import { useMemo } from "react";
import { useSitaOS } from "@/platform/sita/contexts/SitaOSContext";
import type { ExperienceSignature } from "@/lib/services/experience-signature/experience-signature";

export function useExperienceSignature(): ExperienceSignature {
  const kernel = useSitaOS();

  return useMemo(() => {
    const mode = kernel.sitaModes.getMode();
    const cogLoad = kernel.attentionOS.getCognitiveLoad();
    const stack = kernel.attentionOS.getAttentionStack();

    return kernel.experienceSignature.getSignature({
      mode,
      surface: "desktop",
      urgentItemCount: stack.critical.length,
      timeOfDay: new Date().getHours(),
      cognitiveLoad: cogLoad.score,
    });
  }, [kernel]);
}
