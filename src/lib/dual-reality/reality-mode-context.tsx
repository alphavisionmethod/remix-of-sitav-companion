// ═══════════════════════════════════════════════════════════════
// SITA OS — Reality Mode React Context
// Provides current mode to entire component tree
// ═══════════════════════════════════════════════════════════════

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import type { RealityModeKey } from "./reality-mode-registry";
import { CANONICAL_MODES, getModeDefinition } from "./reality-mode-registry";
import { resolveMode, setModeOverride, clearModeOverride, persistResolution, type ModeResolution } from "./reality-mode-resolver";

interface RealityModeContextValue {
  mode: RealityModeKey;
  resolution: ModeResolution;
  definition: ReturnType<typeof getModeDefinition>;
  isReal: boolean;
  isDemo: boolean;
  isSandbox: boolean;
  scenarioKey?: string;
  scenarioId?: string;
  enterDemoMode: (scenarioKey: string, opts?: { scenarioId?: string; durationMinutes?: number }) => void;
  exitDemoMode: () => void;
  switchMode: (mode: RealityModeKey, opts?: { scenarioKey?: string; scenarioId?: string }) => void;
}

const RealityModeContext = createContext<RealityModeContextValue | null>(null);

export function RealityModeProvider({ children }: { children: React.ReactNode }) {
  const [resolution, setResolution] = useState<ModeResolution>(() => resolveMode());

  const definition = useMemo(() => getModeDefinition(resolution.mode), [resolution.mode]);

  const enterDemoMode = useCallback((scenarioKey: string, opts?: { scenarioId?: string; durationMinutes?: number }) => {
    setModeOverride("demo", { scenarioKey, scenarioId: opts?.scenarioId, durationMinutes: opts?.durationMinutes });
    const newRes = resolveMode();
    setResolution(newRes);
    persistResolution(newRes).catch(() => {});
  }, []);

  const exitDemoMode = useCallback(() => {
    clearModeOverride();
    const newRes = resolveMode();
    setResolution(newRes);
    persistResolution(newRes).catch(() => {});
  }, []);

  const switchMode = useCallback((mode: RealityModeKey, opts?: { scenarioKey?: string; scenarioId?: string }) => {
    if (mode === "real") {
      clearModeOverride();
    } else {
      setModeOverride(mode, opts);
    }
    const newRes = resolveMode();
    setResolution(newRes);
    persistResolution(newRes).catch(() => {});
  }, []);

  // Persist initial resolution
  useEffect(() => {
    persistResolution(resolution).catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const value = useMemo<RealityModeContextValue>(() => ({
    mode: resolution.mode,
    resolution,
    definition,
    isReal: resolution.mode === "real",
    isDemo: resolution.mode === "demo" || resolution.mode === "dev_demo",
    isSandbox: resolution.mode === "sandbox",
    scenarioKey: resolution.scenarioKey,
    scenarioId: resolution.scenarioId,
    enterDemoMode,
    exitDemoMode,
    switchMode,
  }), [resolution, definition, enterDemoMode, exitDemoMode, switchMode]);

  return (
    <RealityModeContext.Provider value={value}>
      {children}
    </RealityModeContext.Provider>
  );
}

export function useRealityMode(): RealityModeContextValue {
  const ctx = useContext(RealityModeContext);
  if (!ctx) throw new Error("useRealityMode must be used within RealityModeProvider");
  return ctx;
}

/** Safe hook that returns real mode defaults if outside provider */
export function useRealityModeSafe(): RealityModeContextValue {
  const ctx = useContext(RealityModeContext);
  if (ctx) return ctx;
  return {
    mode: "real",
    resolution: { mode: "real", source: "environment_default", resolvedAt: Date.now() },
    definition: CANONICAL_MODES.real,
    isReal: true,
    isDemo: false,
    isSandbox: false,
    enterDemoMode: () => {},
    exitDemoMode: () => {},
    switchMode: () => {},
  };
}
