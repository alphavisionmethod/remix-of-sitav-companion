// ═══════════════════════════════════════════════════════════════
// SITA OS — Demo Mode Provider (Backward-Compatible Shim)
// Now delegates demo governance to RealityModeProvider.
// useDemoMode() continues to work unchanged for all consumers.
// ═══════════════════════════════════════════════════════════════

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import { useRealityModeSafe } from "@/lib/dual-reality/reality-mode-context";
import { loadKillSwitches } from "@/lib/dual-reality/demo-policy-engine";
import { seedDemoGovernance } from "@/lib/dual-reality/demo-governance-seeder";
import { seedPlatformReadiness } from "@/lib/services/platform-readiness/platform-readiness-seeder";

export type SurfaceDataSource = "real" | "demo" | "mixed" | "empty";

interface SurfaceRegistration {
  surfaceId: string;
  surfaceName: string;
  source: SurfaceDataSource;
  registeredAt: string;
}

interface DemoModeContextType {
  registerSurface: (surfaceId: string, surfaceName: string, source: SurfaceDataSource) => void;
  getSurfaces: () => SurfaceRegistration[];
  demoSurfaceCount: number;
  realSurfaceCount: number;
  dataIntegrityScore: number;
  isSurfaceDemo: (surfaceId: string) => boolean;
}

const DemoModeContext = createContext<DemoModeContextType | null>(null);

export function DemoModeProvider({ children }: { children: React.ReactNode }) {
  const [surfaces, setSurfaces] = useState<Map<string, SurfaceRegistration>>(new Map());

  useEffect(() => {
    loadKillSwitches();
    seedDemoGovernance();
    seedPlatformReadiness();
  }, []);

  const registerSurface = useCallback((surfaceId: string, surfaceName: string, source: SurfaceDataSource) => {
    setSurfaces(prev => {
      const next = new Map(prev);
      next.set(surfaceId, { surfaceId, surfaceName, source, registeredAt: new Date().toISOString() });
      return next;
    });
  }, []);

  const getSurfaces = useCallback(() => Array.from(surfaces.values()), [surfaces]);

  const stats = useMemo(() => {
    const all = Array.from(surfaces.values());
    const demo = all.filter(s => s.source === "demo" || s.source === "mixed").length;
    const real = all.filter(s => s.source === "real").length;
    const total = all.length || 1;
    return {
      demoSurfaceCount: demo,
      realSurfaceCount: real,
      dataIntegrityScore: Math.round((real / total) * 100),
    };
  }, [surfaces]);

  const isSurfaceDemo = useCallback((surfaceId: string) => {
    const s = surfaces.get(surfaceId);
    return s?.source === "demo" || s?.source === "mixed" || !s;
  }, [surfaces]);

  return (
    <DemoModeContext.Provider value={{
      registerSurface,
      getSurfaces,
      ...stats,
      isSurfaceDemo,
    }}>
      {children}
    </DemoModeContext.Provider>
  );
}

export function useDemoMode() {
  const ctx = useContext(DemoModeContext);
  if (!ctx) {
    return {
      registerSurface: () => {},
      getSurfaces: () => [],
      demoSurfaceCount: 0,
      realSurfaceCount: 0,
      dataIntegrityScore: 0,
      isSurfaceDemo: () => true,
    };
  }
  return ctx;
}
