// ═══════════════════════════════════════════════════════════════
// Calm UI Engine — Dynamic Layer Opacity
// Controls 4 conceptual layers independently via CSS vars
// Layer 0 (bg), Layer 1 (content), Layer 2 (interaction), Layer 3 (awareness)
// ═══════════════════════════════════════════════════════════════

import { useEffect, useMemo } from "react";

export interface LayerState {
  hasOverlay: boolean;      // menu, command palette, or modal open
  hasNotification: boolean; // active notification toast
  hasWindows: boolean;      // floating windows present
}

export interface LayerOpacities {
  background: number;
  content: number;
  interaction: number;
  awareness: number;
}

export function computeLayerOpacities(state: LayerState): LayerOpacities {
  return {
    background: 1.0,
    content: state.hasOverlay ? 0.4 : state.hasWindows ? 0.4 : 1.0,
    interaction: state.hasOverlay ? 1.0 : 0,
    awareness: state.hasNotification ? 1.0 : 0,
  };
}

export function useLayerOpacity(state: LayerState): LayerOpacities {
  const opacities = useMemo(() => computeLayerOpacities(state), [state.hasOverlay, state.hasNotification, state.hasWindows]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--layer-bg-opacity", String(opacities.background));
    root.style.setProperty("--layer-content-opacity", String(opacities.content));
    root.style.setProperty("--layer-interaction-opacity", String(opacities.interaction));
    root.style.setProperty("--layer-awareness-opacity", String(opacities.awareness));
  }, [opacities]);

  return opacities;
}
