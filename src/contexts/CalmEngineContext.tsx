// ═══════════════════════════════════════════════════════════════
// Calm UI Engine — Orchestrator Context
// Unifies idle detection, layer opacity, window attention,
// app surfacing, and micro-interaction timings
// ═══════════════════════════════════════════════════════════════

import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import { useIdleDetector, type IdlePhase, idleOpacity } from "@/hooks/useIdleDetector";
import { useLayerOpacity, type LayerState, type LayerOpacities } from "@/platform/sita/hooks/useLayerOpacity";
import { useWindowAttention, type AttentionScore } from "@/platform/sita/hooks/useWindowAttention";
import { useAppSurfacing } from "@/platform/app-platform/hooks/useAppSurfacing";
import { injectMITimings, MI_TIMINGS } from "@/lib/engine/micro-interactions";

// ── Types ────────────────────────────────────────────────────

interface WindowInfo {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isFocused: boolean;
  lastInteraction: number;
}

export interface CalmEngineState {
  // Idle
  idlePhase: IdlePhase;
  idleOpacity: (base?: number) => number;

  // Layers
  layers: LayerOpacities;

  // Window attention
  windowAttention: Map<string, AttentionScore>;

  // App surfacing
  recordAppLaunch: (appId: string) => void;
  getSortedApps: (appIds: string[]) => string[];
  getTopApps: (n?: number) => { appId: string; count: number; lastLaunched: number }[];

  // Timings
  timings: typeof MI_TIMINGS;
}

const CalmEngineContext = createContext<CalmEngineState | null>(null);

// ── Provider ─────────────────────────────────────────────────

interface CalmEngineProviderProps {
  children: ReactNode;
  windows?: WindowInfo[];
  layerState?: LayerState;
}

export function CalmEngineProvider({
  children,
  windows = [],
  layerState = { hasOverlay: false, hasNotification: false, hasWindows: false },
}: CalmEngineProviderProps) {
  // Inject CSS custom properties once
  useEffect(() => {
    injectMITimings();
  }, []);

  const idle = useIdleDetector();
  const layers = useLayerOpacity(layerState);
  const attention = useWindowAttention(windows);
  const { recordLaunch, getSortedApps, getTopApps } = useAppSurfacing();

  // Apply idle phase as CSS class on root
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.idlePhase = idle;
  }, [idle]);

  const value = useMemo<CalmEngineState>(() => ({
    idlePhase: idle,
    idleOpacity: (base?: number) => idleOpacity(idle, base),
    layers,
    windowAttention: attention,
    recordAppLaunch: recordLaunch,
    getSortedApps,
    getTopApps,
    timings: MI_TIMINGS,
  }), [idle, layers, attention, recordLaunch, getSortedApps, getTopApps]);

  return (
    <CalmEngineContext.Provider value={value}>
      {children}
    </CalmEngineContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────

export function useCalmEngine(): CalmEngineState {
  const ctx = useContext(CalmEngineContext);
  if (!ctx) {
    // Fallback for components outside provider
    return {
      idlePhase: "active",
      idleOpacity: (base = 1) => base,
      layers: { background: 1, content: 1, interaction: 0, awareness: 0 },
      windowAttention: new Map(),
      recordAppLaunch: () => {},
      getSortedApps: (ids) => ids,
      getTopApps: () => [],
      timings: MI_TIMINGS,
    };
  }
  return ctx;
}
