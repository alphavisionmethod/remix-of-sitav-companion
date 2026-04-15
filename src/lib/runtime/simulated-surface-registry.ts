// ═══════════════════════════════════════════════════════════════
// SITA OS — Simulated Surface Registry
// Tracks which surfaces are simulated vs real
// References dual-reality/surface-class-registry
// ═══════════════════════════════════════════════════════════════

import type { RuntimeTarget } from "./runtime-detection";

export type SurfaceReality = "real" | "simulated" | "hybrid" | "planned";

export interface SimulatedSurfaceEntry {
  surfaceId: string;
  displayName: string;
  target: RuntimeTarget;
  reality: SurfaceReality;
  /** What percentage of the surface runs on real infrastructure (0-100) */
  realInfraPercent: number;
  /** What is currently simulated */
  simulatedComponents: string[];
  /** When full reality is expected */
  fullRealityTargetDate?: string;
  /** Blockers preventing full reality */
  blockers: string[];
}

export const SIMULATED_SURFACES: SimulatedSurfaceEntry[] = [
  {
    surfaceId: "web-app",
    displayName: "Web Application",
    target: "browser",
    reality: "real",
    realInfraPercent: 95,
    simulatedComponents: ["some-connector-data"],
    blockers: [],
  },
  {
    surfaceId: "desktop-app",
    displayName: "Desktop Application (Electron)",
    target: "electron",
    reality: "simulated",
    realInfraPercent: 10,
    simulatedComponents: ["electron-shell", "ipc-bridge", "file-system", "system-tray"],
    fullRealityTargetDate: "2026-Q3",
    blockers: ["Electron build pipeline", "Code signing", "Auto-updater"],
  },
  {
    surfaceId: "mobile-app",
    displayName: "Mobile Application",
    target: "capacitor",
    reality: "planned",
    realInfraPercent: 0,
    simulatedComponents: ["entire-surface"],
    fullRealityTargetDate: "2026-Q4",
    blockers: ["Flutter migration", "App store accounts", "Push notification infra"],
  },
  {
    surfaceId: "pwa-app",
    displayName: "Progressive Web App",
    target: "pwa",
    reality: "hybrid",
    realInfraPercent: 60,
    simulatedComponents: ["background-sync", "offline-mode"],
    blockers: ["Service worker stability"],
  },
];

export function getSurfaceReality(surfaceId: string): SimulatedSurfaceEntry | undefined {
  return SIMULATED_SURFACES.find((s) => s.surfaceId === surfaceId);
}

export function getRealSurfaces(): SimulatedSurfaceEntry[] {
  return SIMULATED_SURFACES.filter((s) => s.reality === "real");
}

export function getSimulatedSurfaces(): SimulatedSurfaceEntry[] {
  return SIMULATED_SURFACES.filter((s) => s.reality === "simulated" || s.reality === "planned");
}
