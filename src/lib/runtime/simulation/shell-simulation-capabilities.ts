// ═══════════════════════════════════════════════════════════════
// SITA OS — Shell Simulation Capabilities
// What the simulated shell layer is allowed to render.
// ═══════════════════════════════════════════════════════════════

export interface ShellSimulationEntry {
  surfaceId: string;
  componentLocation: string;
  /** True when the surface must read true runtime capability before rendering. */
  capabilityGated: boolean;
  /** Capability that gates rich behavior, if any. */
  gatingCapability?: string;
}

export const SHELL_SIMULATION_CAPABILITIES: readonly ShellSimulationEntry[] = [
  { surfaceId: "desktop-shell", componentLocation: "src/components/sita/desktop/", capabilityGated: false },
  { surfaceId: "dock", componentLocation: "src/components/sita/desktop/Dock", capabilityGated: false },
  { surfaceId: "windows", componentLocation: "src/components/sita/windows/", capabilityGated: true, gatingCapability: "window-control" },
  { surfaceId: "control-center", componentLocation: "src/components/sita/control-center/", capabilityGated: false },
  { surfaceId: "lock-screen", componentLocation: "src/components/sita/lock/", capabilityGated: false },
  { surfaceId: "mission-control", componentLocation: "src/pages/mission-control/", capabilityGated: false },
  { surfaceId: "app-launcher", componentLocation: "src/components/sita/launcher/", capabilityGated: false },
  { surfaceId: "boot-sequence", componentLocation: "src/components/sita/boot/", capabilityGated: false },
  { surfaceId: "menu-bar", componentLocation: "src/components/sita/menu-bar/", capabilityGated: true, gatingCapability: "menu-bar" },
  { surfaceId: "tray-icon", componentLocation: "src/components/sita/tray/", capabilityGated: true, gatingCapability: "tray-icon" },
];
