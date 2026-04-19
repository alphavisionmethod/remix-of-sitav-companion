// ═══════════════════════════════════════════════════════════════
// SITA OS — Portability Boundary Model
// Canonical classification for every shared module that touches
// (or could touch) runtime-specific APIs.
//
// Read by check-portability-boundaries.ts to enforce that:
//   • shared-portable code never trips browser globals directly
//   • leaf-browser-only code stays scoped to its leaf surface
//   • adapter-routed code goes through runtime-host-adapter only
//   • shell-specific code remains in shell-specific surfaces
// ═══════════════════════════════════════════════════════════════

export type PortabilityBoundary =
  | "leaf-browser-only" // legitimate browser-leaf hook (scoped)
  | "shared-portable" // logic that must work in any tier
  | "shell-specific" // tied to one shell (electron/native)
  | "adapter-routed"; // accesses runtime via canonical adapter

export interface PortabilityClassification {
  path: string;
  boundary: PortabilityBoundary;
  rationale: string;
}

export const PORTABILITY_CLASSIFICATIONS: readonly PortabilityClassification[] = [
  // ── Leaf-browser-only (legitimately scoped to browser UI primitives) ──
  {
    path: "src/hooks/use-mobile.tsx",
    boundary: "leaf-browser-only",
    rationale: "Reads window.matchMedia for responsive breakpoint — pure browser leaf.",
  },
  {
    path: "src/hooks/useReducedMotion.ts",
    boundary: "leaf-browser-only",
    rationale: "matchMedia('(prefers-reduced-motion)') — browser-only by spec.",
  },
  {
    path: "src/hooks/useWindowSnap.ts",
    boundary: "leaf-browser-only",
    rationale: "Window snap-guide overlay — only renders inside DESKTOP_HOST chrome.",
  },
  {
    path: "src/hooks/useElectronBridge.ts",
    boundary: "shell-specific",
    rationale: "Electron preload IPC bridge — DESKTOP_HOST shell only.",
  },

  // ── Adapter-routed (refactored as part of this closure) ──
  {
    path: "src/hooks/useAppStatePersistence.ts",
    boundary: "adapter-routed",
    rationale: "Scroll persistence routed through useRuntimeHost().",
  },
  {
    path: "src/hooks/use-zero-latency.ts",
    boundary: "adapter-routed",
    rationale: "Route-transition scroll restore routed through useRuntimeHost().",
  },
  {
    path: "src/hooks/use-session-restore.ts",
    boundary: "adapter-routed",
    rationale: "Session route + scroll restore routed through useRuntimeHost().",
  },
  {
    path: "src/hooks/useSetupOrchestration.ts",
    boundary: "adapter-routed",
    rationale: "beforeunload subscription routed through useRuntimeHost().",
  },

  // ── Canonical adapter implementations ──
  {
    path: "src/runtimes/runtime-host-adapter.ts",
    boundary: "shared-portable",
    rationale: "The canonical adapter surface — selects implementation by tier.",
  },
  {
    path: "src/runtimes/web/web-host-adapter.ts",
    boundary: "leaf-browser-only",
    rationale: "Real window.* implementation — only loaded in browser tiers.",
  },
  {
    path: "src/runtimes/noop/noop-host-adapter.ts",
    boundary: "shared-portable",
    rationale: "Inert stub for SIMULATED / SSR contexts.",
  },
  {
    path: "src/runtimes/runtime-context.tsx",
    boundary: "shared-portable",
    rationale: "Tier provider — SSR-safe.",
  },
  {
    path: "src/runtimes/runtime-detection.ts",
    boundary: "shared-portable",
    rationale: "Tier detection probes; defensive window guards keep it portable.",
  },
] as const;

export function classifyByPath(path: string): PortabilityClassification | null {
  return PORTABILITY_CLASSIFICATIONS.find((c) => c.path === path) ?? null;
}

/** Allowlist of leaf hooks that may touch window/document directly. */
export const LEAF_BROWSER_HOOK_ALLOWLIST: readonly string[] = PORTABILITY_CLASSIFICATIONS.filter(
  (c) => c.boundary === "leaf-browser-only" || c.boundary === "shell-specific",
).map((c) => c.path);
