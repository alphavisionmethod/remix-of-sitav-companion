// ═══════════════════════════════════════════════════════════════
// SITA OS — Surface Simulation Rules
// Rules that govern when a simulated surface must degrade or label itself.
// ═══════════════════════════════════════════════════════════════

export interface SurfaceSimulationRule {
  id: string;
  surfaceId: string;
  description: string;
  /** True if the surface must show a "simulation" badge to admins/operators. */
  requiresAdminDisclosure: boolean;
  /** True if the surface must show a disclosure to end users too. */
  requiresUserDisclosure: boolean;
  remediation: string;
}

export const SURFACE_SIMULATION_RULES: readonly SurfaceSimulationRule[] = [
  {
    id: "boot-must-disclose",
    surfaceId: "boot-sequence",
    description: "Boot ceremony is UX simulation outside of appliance runtime.",
    requiresAdminDisclosure: true,
    requiresUserDisclosure: true,
    remediation: "Render `(simulation)` badge when active tier !== APPLIANCE_RUNTIME.",
  },
  {
    id: "menu-bar-must-degrade",
    surfaceId: "menu-bar",
    description: "Menu bar requires `menu-bar` capability.",
    requiresAdminDisclosure: true,
    requiresUserDisclosure: false,
    remediation: "Hide entirely or render minimal disclosure outside DESKTOP_HOST.",
  },
  {
    id: "tray-must-degrade",
    surfaceId: "tray-icon",
    description: "Tray icon requires `tray-icon` capability.",
    requiresAdminDisclosure: true,
    requiresUserDisclosure: false,
    remediation: "Hide entirely outside DESKTOP_HOST.",
  },
];
