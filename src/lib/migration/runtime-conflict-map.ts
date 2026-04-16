// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime Conflict Map
// Known cross-tier conflicts and their resolution strategy.
// ═══════════════════════════════════════════════════════════════

export type ConflictResolution =
  | "use-tier-gate"
  | "use-capability-hook"
  | "extract-shared-contract"
  | "split-by-tier"
  | "isolate-via-bridge";

export interface RuntimeConflictEntry {
  id: string;
  description: string;
  involvedPaths: readonly string[];
  resolution: ConflictResolution;
  rationale: string;
  status: "open" | "resolved" | "monitoring";
}

export const RUNTIME_CONFLICT_MAP: readonly RuntimeConflictEntry[] = [
  {
    id: "boot-ux-vs-real-boot",
    description: "Boot ceremony UI is real on appliance and UX-only elsewhere.",
    involvedPaths: ["src/components/sita/boot/", "src/lib/runtime/appliance/first-boot-contract.ts"],
    resolution: "use-tier-gate",
    rationale: "Render real flow when tier === APPLIANCE_RUNTIME, otherwise show simulation badge.",
    status: "monitoring",
  },
  {
    id: "filesystem-meaning-drift",
    description: "'File system access' means different things across tiers.",
    involvedPaths: ["src/lib/files/", "electron/fs-bridge.cjs"],
    resolution: "use-capability-hook",
    rationale: "Surfaces consume `useCapability('filesystem-local')` and select picker/bridge/native path.",
    status: "monitoring",
  },
  {
    id: "kernel-claim-vs-simulation",
    description: "Nova kernel is simulated UX, not a real kernel.",
    involvedPaths: ["src/lib/nova-sdk/kernel/"],
    resolution: "extract-shared-contract",
    rationale: "Kernel stays in SIMULATION_TIER. Marketing copy must not claim host authority.",
    status: "resolved",
  },
  {
    id: "desktop-bridge-leakage",
    description: "Web pages must not import Electron preload modules.",
    involvedPaths: ["src/pages/", "electron/preload.cjs"],
    resolution: "isolate-via-bridge",
    rationale: "Use typed `ElectronBridgeContract`; web tier sees only the typed surface.",
    status: "monitoring",
  },
  {
    id: "ota-vs-auto-update",
    description: "Auto-update means desktop-update on DESKTOP_HOST and OTA on APPLIANCE_RUNTIME.",
    involvedPaths: ["src/components/admin/UpdateCenter/"],
    resolution: "split-by-tier",
    rationale: "UpdateCenter reads tier and renders the correct path.",
    status: "monitoring",
  },
];

export function getOpenConflicts(): RuntimeConflictEntry[] {
  return RUNTIME_CONFLICT_MAP.filter((c) => c.status !== "resolved");
}
