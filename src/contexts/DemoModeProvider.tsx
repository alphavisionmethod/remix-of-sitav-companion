// ═══════════════════════════════════════════════════════════════
// SITA OS — Demo Mode Provider
// Centralized demo governance — tracks which surfaces use demo data,
// provides mode registry, and enables DemoModeBadge integration
// ═══════════════════════════════════════════════════════════════

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import { useDataMode } from "./DataModeContext";
import { loadKillSwitches } from "@/lib/dual-reality/demo-policy-engine";

export type SurfaceDataSource = "real" | "demo" | "mixed" | "empty";

interface SurfaceRegistration {
  surfaceId: string;
  surfaceName: string;
  source: SurfaceDataSource;
  registeredAt: string;
}

interface DemoModeContextType {
  /** Register a surface and its data source */
  registerSurface: (surfaceId: string, surfaceName: string, source: SurfaceDataSource) => void;
  /** Get all registered surfaces */
  getSurfaces: () => SurfaceRegistration[];
  /** Get count of demo-backed surfaces */
  demoSurfaceCount: number;
  /** Get count of real-backed surfaces */
  realSurfaceCount: number;
  /** Overall data integrity score (0-100) */
  dataIntegrityScore: number;
  /** Check if a surface is demo-backed */
  isSurfaceDemo: (surfaceId: string) => boolean;
}

const DemoModeContext = createContext<DemoModeContextType | null>(null);

export function DemoModeProvider({ children }: { children: React.ReactNode }) {
  const [surfaces, setSurfaces] = useState<Map<string, SurfaceRegistration>>(new Map());

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
    // Fallback if outside provider
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
