// ═══════════════════════════════════════════════════════════════
// SITA OS — Simulated OS Experience Contract
// The UX layer that imitates OS behavior. Never claims privilege.
// ═══════════════════════════════════════════════════════════════

import type { RuntimeTier } from "../runtime-tier-model";

export const SIMULATED_OS_TIER: RuntimeTier = "SIMULATED_OS_EXPERIENCE";

export interface SimulatedOSContract {
  tier: typeof SIMULATED_OS_TIER;
  hostAuthority: "ux-only";
  /** Which surfaces are simulated. */
  simulatedSurfaces: readonly string[];
  /** Disclosure rules — when the UI must label simulation. */
  disclosureRules: readonly {
    surface: string;
    mustDisclose: boolean;
    disclosureText?: string;
  }[];
  /** Cross-tier portability — can render on any primary tier. */
  primaryTiersHosting: readonly RuntimeTier[];
}

export const SIMULATED_OS_CONTRACT: SimulatedOSContract = {
  tier: SIMULATED_OS_TIER,
  hostAuthority: "ux-only",
  simulatedSurfaces: [
    "desktop-shell",
    "dock",
    "windows",
    "control-center",
    "lock-screen",
    "mission-control",
    "app-launcher",
    "wallpaper",
    "shell-widgets",
    "boot-sequence",
  ],
  disclosureRules: [
    { surface: "boot-sequence", mustDisclose: true, disclosureText: "Boot ceremony (UX simulation)" },
    { surface: "lock-screen", mustDisclose: false },
    { surface: "control-center", mustDisclose: false },
    { surface: "windows", mustDisclose: false },
  ],
  primaryTiersHosting: ["WEB_APP", "DESKTOP_HOST", "APPLIANCE_RUNTIME"],
} as const;
