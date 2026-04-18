// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime Feature Classification Map
// File-level classification mirroring the service-authority-map pattern.
// Maps runtime-sensitive code locations to their owning runtime tier(s).
// ═══════════════════════════════════════════════════════════════

import type { RuntimeTier } from "@/lib/runtime/runtime-tier-model";

export type RuntimeOwnership =
  | "WEB_TIER_OWNED"
  | "DESKTOP_TIER_OWNED"
  | "APPLIANCE_TIER_OWNED"
  | "SIMULATION_TIER_OWNED"
  | "MULTI_TIER_SHARED"
  | "RUNTIME_NEUTRAL";

export interface RuntimeClassificationEntry {
  /** Path prefix or specific file. */
  pathPrefix: string;
  ownership: RuntimeOwnership;
  /** Tiers where the code may execute or render. */
  hostingTiers: readonly RuntimeTier[];
  /** Plain-English purpose. */
  purpose: string;
  /** True when this entry is the canonical owner for its tier. */
  canonical: boolean;
  notes?: string;
}

export const RUNTIME_FEATURE_CLASSIFICATION: readonly RuntimeClassificationEntry[] = [
  // ── Desktop tier ──
  { pathPrefix: "electron/", ownership: "DESKTOP_TIER_OWNED", hostingTiers: ["DESKTOP_HOST"], purpose: "Electron main + preload + bridges", canonical: true },
  { pathPrefix: "src/lib/runtime/desktop/", ownership: "DESKTOP_TIER_OWNED", hostingTiers: ["DESKTOP_HOST"], purpose: "Desktop tier contracts and capability probes", canonical: true },
  { pathPrefix: "src/runtimes/desktop/", ownership: "DESKTOP_TIER_OWNED", hostingTiers: ["DESKTOP_HOST"], purpose: "Desktop runtime barrel exports", canonical: true },

  // ── Appliance tier ──
  { pathPrefix: "src/lib/runtime/appliance/", ownership: "APPLIANCE_TIER_OWNED", hostingTiers: ["APPLIANCE_RUNTIME"], purpose: "Appliance runtime contracts (first-boot, recovery, OTA)", canonical: true },
  { pathPrefix: "src/runtimes/appliance/", ownership: "APPLIANCE_TIER_OWNED", hostingTiers: ["APPLIANCE_RUNTIME"], purpose: "Appliance boot-related UI components", canonical: true },
  { pathPrefix: "scripts/release/appliance/", ownership: "APPLIANCE_TIER_OWNED", hostingTiers: ["APPLIANCE_RUNTIME"], purpose: "ISO/OVA build scripts for appliance image", canonical: true },
  { pathPrefix: "src/components/sita/boot/", ownership: "MULTI_TIER_SHARED", hostingTiers: ["APPLIANCE_RUNTIME", "WEB_APP", "DESKTOP_HOST"], purpose: "Boot ceremony UI — real on appliance, simulated elsewhere", canonical: true, notes: "Must disclose simulation outside APPLIANCE_RUNTIME." },

  // ── Web tier ──
  { pathPrefix: "src/lib/runtime/web/", ownership: "WEB_TIER_OWNED", hostingTiers: ["WEB_APP"], purpose: "Web tier contracts and fallbacks", canonical: true },
  { pathPrefix: "src/pages/", ownership: "MULTI_TIER_SHARED", hostingTiers: ["WEB_APP", "DESKTOP_HOST", "APPLIANCE_RUNTIME"], purpose: "User-facing pages (must use TierGate / useCapability)", canonical: true },
  { pathPrefix: "src/pages/mobile/", ownership: "WEB_TIER_OWNED", hostingTiers: ["WEB_APP"], purpose: "Mobile-web surfaces", canonical: true },

  // ── Simulation tier ──
  { pathPrefix: "src/lib/runtime/simulation/", ownership: "SIMULATION_TIER_OWNED", hostingTiers: ["SIMULATED_OS_EXPERIENCE"], purpose: "Simulated OS contracts and disclosure rules", canonical: true },
  { pathPrefix: "src/lib/nova-sdk/kernel/", ownership: "SIMULATION_TIER_OWNED", hostingTiers: ["SIMULATED_OS_EXPERIENCE"], purpose: "Simulated kernel for architectural experience", canonical: true, notes: "Stays simulated per architecture memory." },
  { pathPrefix: "src/lib/nova-sdk/rendering/", ownership: "SIMULATION_TIER_OWNED", hostingTiers: ["SIMULATED_OS_EXPERIENCE"], purpose: "Simulated compositor", canonical: true },
  { pathPrefix: "src/components/sita/desktop/", ownership: "SIMULATION_TIER_OWNED", hostingTiers: ["SIMULATED_OS_EXPERIENCE"], purpose: "Desktop shell UI (dock, windows)", canonical: true },
  { pathPrefix: "src/components/sita/lock/", ownership: "SIMULATION_TIER_OWNED", hostingTiers: ["SIMULATED_OS_EXPERIENCE"], purpose: "Lock screen UI", canonical: true },
  { pathPrefix: "src/components/sita/control-center/", ownership: "SIMULATION_TIER_OWNED", hostingTiers: ["SIMULATED_OS_EXPERIENCE"], purpose: "Control center UI", canonical: true },
  { pathPrefix: "src/components/sita/launcher/", ownership: "SIMULATION_TIER_OWNED", hostingTiers: ["SIMULATED_OS_EXPERIENCE"], purpose: "App launcher UI", canonical: true },

  // ── Runtime-neutral platform ──
  { pathPrefix: "src/lib/runtime/runtime-tier-model.ts", ownership: "RUNTIME_NEUTRAL", hostingTiers: ["WEB_APP", "DESKTOP_HOST", "APPLIANCE_RUNTIME", "SIMULATED_OS_EXPERIENCE"], purpose: "Canonical 4-Tier model", canonical: true },
  { pathPrefix: "src/lib/runtime/runtime-context.tsx", ownership: "RUNTIME_NEUTRAL", hostingTiers: ["WEB_APP", "DESKTOP_HOST", "APPLIANCE_RUNTIME", "SIMULATED_OS_EXPERIENCE"], purpose: "Runtime context provider", canonical: true },
  { pathPrefix: "src/lib/runtime/feature-tier-registry.ts", ownership: "RUNTIME_NEUTRAL", hostingTiers: ["WEB_APP", "DESKTOP_HOST", "APPLIANCE_RUNTIME", "SIMULATED_OS_EXPERIENCE"], purpose: "Feature → tier classification", canonical: true },
  { pathPrefix: "src/lib/runtime/runtime-capability-matrix.ts", ownership: "RUNTIME_NEUTRAL", hostingTiers: ["WEB_APP", "DESKTOP_HOST", "APPLIANCE_RUNTIME"], purpose: "Cross-tier capability matrix", canonical: true },
];

export function classifyPath(filePath: string): RuntimeClassificationEntry | undefined {
  // Most-specific prefix wins
  return [...RUNTIME_FEATURE_CLASSIFICATION]
    .sort((a, b) => b.pathPrefix.length - a.pathPrefix.length)
    .find((e) => filePath.startsWith(e.pathPrefix));
}
