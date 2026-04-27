// ═══════════════════════════════════════════════════════════════
// SITA OS — Adaptive Interface Hook
// Reads OS state and feeds density/animation/fontSize into the UI
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { useSitaOS } from "@/platform/sita/contexts/SitaOSContext";
import type { InterfaceState } from "@/lib/services/adaptive-interface/adaptive-interface";

const DEFAULT_STATE: InterfaceState = {
  density: "standard",
  animationLevel: "standard",
  prioritySections: [],
  suppressedSections: [],
  colorTemperature: "neutral",
  fontSize: "standard",
  informationDepth: "summary",
  interactionMode: "mixed",
};

export function useAdaptiveInterface(): InterfaceState {
  const kernel = useSitaOS();
  const [state, setState] = useState<InterfaceState>(DEFAULT_STATE);

  useEffect(() => {
    if (!kernel.hydrated) return;

    const mode = kernel.sitaModes.getMode();
    const cogLoad = kernel.attentionOS.getCognitiveLoad();
    const stack = kernel.attentionOS.getAttentionStack();

    const interfaceState = kernel.adaptiveInterface.getInterfaceState({
      surface: "desktop",
      cognitiveLoad: cogLoad.score,
      currentMode: mode,
      urgentItemCount: stack.critical.length + stack.active.length,
      timeOfDay: new Date().getHours(),
      isMoving: false,
      trustLevel: "high",
      roleMode: mode,
    });

    setState(interfaceState);

    // Apply CSS custom properties for density/animation/fontSize
    const root = document.documentElement;
    const densityScale: Record<string, string> = {
      calm: "1.2", standard: "1", focus: "0.95", analyst: "0.85", presentation: "1.1",
    };
    const animDuration: Record<string, string> = {
      none: "0ms", subtle: "150ms", standard: "300ms", rich: "500ms",
    };
    const fontScale: Record<string, string> = {
      compact: "0.875", standard: "1", large: "1.125",
    };

    root.style.setProperty("--os-density-scale", densityScale[interfaceState.density] ?? "1");
    root.style.setProperty("--os-animation-duration", animDuration[interfaceState.animationLevel] ?? "300ms");
    root.style.setProperty("--os-font-scale", fontScale[interfaceState.fontSize] ?? "1");
    root.style.setProperty("--os-color-temperature", interfaceState.colorTemperature);
  }, [kernel.hydrated, kernel]);

  return state;
}
