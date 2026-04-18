// ═══════════════════════════════════════════════════════════════
// SITA OS — Canonical 4-Tier Runtime Model
//
// This is THE authoritative product reality model.
// It is intentionally separate from `product-reality-tiers.ts`
// (which classifies architectural reality of code: production,
// prototype, simulated, spec-only, experimental).
//
// The 4-Tier model classifies WHERE a feature can run truthfully.
// Every runtime-sensitive feature MUST declare its tier coverage.
// ═══════════════════════════════════════════════════════════════

/** Canonical runtime tier identifiers. */
export type RuntimeTier =
  | "WEB_APP"                 // Tier 1 — browser-first web application
  | "DESKTOP_HOST"            // Tier 2 — Electron / native host shell
  | "APPLIANCE_RUNTIME"       // Tier 3 — VMware / ISO / bootable appliance
  | "SIMULATED_OS_EXPERIENCE"; // Tier 4 — UX layer that *looks* like an OS

/** Per-tier support status for a capability or feature. */
export type TierAvailability =
  | "supported"   // Real, working capability in this tier
  | "simulated"   // Visible in this tier but backed by simulation
  | "fallback"    // Available via degraded/fallback path
  | "prohibited"  // MUST NOT be claimed or attempted in this tier
  | "roadmap";    // Planned for this tier, not yet implemented

export interface RuntimeTierDefinition {
  tier: RuntimeTier;
  ordinal: 1 | 2 | 3 | 4;
  label: string;
  shortName: string;
  description: string;
  exampleCapabilities: readonly string[];
  prohibitedCapabilities: readonly string[];
  hostAuthority: "browser-sandbox" | "host-bridge" | "appliance-runtime" | "ux-only";
  /** True if claims of "OS-level" privilege are honest in this tier. */
  honestOSAuthority: boolean;
}

export const RUNTIME_TIERS: readonly RuntimeTierDefinition[] = [
  {
    tier: "WEB_APP",
    ordinal: 1,
    label: "Web Application",
    shortName: "web",
    description:
      "SITA running as a browser-first web application. Operates under " +
      "browser sandbox constraints with no native OS authority.",
    exampleCapabilities: [
      "boardroom UI",
      "business dashboards",
      "approval flows",
      "cloud sync",
      "command palette",
      "browser-mediated uploads",
      "browser notifications (where supported)",
    ],
    prohibitedCapabilities: [
      "system-level process control",
      "unrestricted local filesystem",
      "kernel-level OS behavior",
      "native package installation",
      "true host window manager privileges",
    ],
    hostAuthority: "browser-sandbox",
    honestOSAuthority: false,
  },
  {
    tier: "DESKTOP_HOST",
    ordinal: 2,
    label: "Desktop Host",
    shortName: "desktop",
    description:
      "SITA running inside Electron or comparable desktop host wrapper. " +
      "Adds host-bridged capabilities through a typed preload contract.",
    exampleCapabilities: [
      "richer file integration via host bridge",
      "desktop windows and app shell",
      "native notifications",
      "controlled host APIs",
      "auto-update channels",
      "local backup",
    ],
    prohibitedCapabilities: [
      "kernel ownership of underlying machine",
      "OS security authority over the host",
      "arbitrary privileged process control outside the bridge",
      "claims of being the underlying OS",
    ],
    hostAuthority: "host-bridge",
    honestOSAuthority: false,
  },
  {
    tier: "APPLIANCE_RUNTIME",
    ordinal: 3,
    label: "Appliance Runtime",
    shortName: "appliance",
    description:
      "SITA running as a packaged appliance image (ISO/OVA) with first-boot " +
      "ceremony, recovery scripts, and an OTA update agent.",
    exampleCapabilities: [
      "first-boot runtime preparation",
      "appliance service startup ordering",
      "recovery scripts",
      "OTA update daemon",
      "managed local runtime services",
      "consistent packaged environment",
    ],
    prohibitedCapabilities: [
      "claiming a fully-bespoke kernel OS unless truly implemented",
      "marketing untested boot/recovery paths as production",
    ],
    hostAuthority: "appliance-runtime",
    honestOSAuthority: true,
  },
  {
    tier: "SIMULATED_OS_EXPERIENCE",
    ordinal: 4,
    label: "Simulated OS Experience",
    shortName: "simulated",
    description:
      "The UX/interaction grammar that makes SITA feel like an OS. " +
      "Pure presentation layer — never a claim about underlying privilege.",
    exampleCapabilities: [
      "desktop dock",
      "windows",
      "control center",
      "lock screen",
      "mission control",
      "ambient widgets",
      "app launcher",
    ],
    prohibitedCapabilities: [
      "any claim of host authority",
      "any claim of real OS-level privilege",
      "implying parity with appliance runtime",
    ],
    hostAuthority: "ux-only",
    honestOSAuthority: false,
  },
] as const;

export function getRuntimeTier(tier: RuntimeTier): RuntimeTierDefinition {
  const def = RUNTIME_TIERS.find((t) => t.tier === tier);
  if (!def) throw new Error(`[runtime-tier-model] Unknown tier: ${tier}`);
  return def;
}

export function listRuntimeTiers(): readonly RuntimeTier[] {
  return RUNTIME_TIERS.map((t) => t.tier);
}

export function isHostAuthorityHonest(tier: RuntimeTier): boolean {
  return getRuntimeTier(tier).honestOSAuthority;
}

// ── Re-exports of canonical tier identifiers ────────────────────
export const WEB_APP = "WEB_APP" as const;
export const DESKTOP_HOST = "DESKTOP_HOST" as const;
export const APPLIANCE_RUNTIME = "APPLIANCE_RUNTIME" as const;
export const SIMULATED_OS_EXPERIENCE = "SIMULATED_OS_EXPERIENCE" as const;
