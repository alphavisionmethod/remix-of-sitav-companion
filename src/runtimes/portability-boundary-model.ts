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

  // ── Leaf-browser-only: UI personalization, OS shell chrome, localStorage-backed
  //    user preferences. These hooks are exclusively rendered inside WEB_APP /
  //    DESKTOP_HOST shells and never imported by SSR / SIMULATED tiers. Each is
  //    an explicit, audited decision — not a silent allowlist.
  { path: "src/hooks/use-accent-sync.ts", boundary: "leaf-browser-only", rationale: "DOM accent CSS variable application — render-side only." },
  { path: "src/hooks/use-adaptive-personalization.ts", boundary: "leaf-browser-only", rationale: "localStorage-backed user UI preference cache." },
  { path: "src/hooks/use-backend-actions.ts", boundary: "leaf-browser-only", rationale: "Reads localStorage feature toggle for UI affordance." },
  { path: "src/hooks/use-calm-mode.ts", boundary: "leaf-browser-only", rationale: "Toggles document.body class for calm visual mode." },
  { path: "src/hooks/use-focus-mode.ts", boundary: "leaf-browser-only", rationale: "Focus-mode chrome toggle + localStorage persistence." },
  { path: "src/hooks/use-gesture-engine.ts", boundary: "leaf-browser-only", rationale: "Pointer/touch gesture engine — DOM-bound by design." },
  { path: "src/hooks/use-online-status.ts", boundary: "leaf-browser-only", rationale: "navigator.onLine + window online/offline events." },
  { path: "src/hooks/use-proof-chain.ts", boundary: "leaf-browser-only", rationale: "document.createElement download trigger for proof export." },
  { path: "src/hooks/use-realtime-notifications.ts", boundary: "leaf-browser-only", rationale: "window event bridge for realtime UI toasts." },
  { path: "src/hooks/use-wallpaper.ts", boundary: "leaf-browser-only", rationale: "Wallpaper preference cache (localStorage)." },
  { path: "src/hooks/useAdaptiveInterface.ts", boundary: "leaf-browser-only", rationale: "DOM density-class application." },
  { path: "src/hooks/useAppSurfacing.ts", boundary: "leaf-browser-only", rationale: "App-launcher recents cache (localStorage)." },
  { path: "src/hooks/useBusinessOnboarding.ts", boundary: "leaf-browser-only", rationale: "Onboarding draft cache (localStorage)." },
  { path: "src/hooks/useCurrentOrg.ts", boundary: "leaf-browser-only", rationale: "Active-org selector cache (localStorage)." },
  { path: "src/hooks/useDemoModeRuntimeEnforcement.ts", boundary: "leaf-browser-only", rationale: "Applies demo-mode body class — DOM only." },
  { path: "src/hooks/useDesktopWidgets.ts", boundary: "leaf-browser-only", rationale: "Desktop widget layout cache — DESKTOP_HOST shell." },
  { path: "src/hooks/useDraftAutosave.ts", boundary: "leaf-browser-only", rationale: "Canonical draft autosave — localStorage + IndexedDB by design." },
  { path: "src/hooks/useGlobalShortcuts.ts", boundary: "leaf-browser-only", rationale: "window keydown listener — UI shell only." },
  { path: "src/hooks/useIdleDetector.ts", boundary: "leaf-browser-only", rationale: "Idle detection via document/window events." },
  { path: "src/hooks/useLayerOpacity.ts", boundary: "leaf-browser-only", rationale: "DOM layer opacity application." },
  { path: "src/hooks/useLiveActivityDomainData.ts", boundary: "leaf-browser-only", rationale: "Live-activity poller — UI shell only." },
  { path: "src/hooks/useOSRuntime.tsx", boundary: "leaf-browser-only", rationale: "OS runtime selector for shell chrome." },
  { path: "src/hooks/useOfflineStore.ts", boundary: "leaf-browser-only", rationale: "Offline state cache (localStorage + IndexedDB)." },
  { path: "src/hooks/useUserPreferences.ts", boundary: "leaf-browser-only", rationale: "User preference cache (localStorage)." },
  { path: "src/hooks/useWallpaperParallax.ts", boundary: "leaf-browser-only", rationale: "Mouse-parallax wallpaper effect — DOM only." },
  { path: "src/hooks/useWindowAttention.ts", boundary: "leaf-browser-only", rationale: "Window-attention flash — DESKTOP_HOST shell." },
  { path: "src/hooks/useWindowManager.ts", boundary: "leaf-browser-only", rationale: "Window manager — DESKTOP_HOST shell only." },
  // ── src/lib/services/* — WEB_APP / DESKTOP_HOST shell services that legitimately touch browser globals.
  { path: "src/lib/services/adaptive-visual-system.ts", boundary: "leaf-browser-only", rationale: "Adaptive visual rendering — DOM/window-bound by design." },
  { path: "src/lib/services/ambient-context-engine.ts", boundary: "leaf-browser-only", rationale: "localStorage-backed ambient signal cache — WEB_APP shell only." },
  { path: "src/lib/services/app-store/launch.service.ts", boundary: "leaf-browser-only", rationale: "App launcher window.open / native launch — shell only." },
  { path: "src/lib/services/background-intelligence.ts", boundary: "leaf-browser-only", rationale: "Background DOM probes — UI shell only." },
  { path: "src/lib/services/context-graph/index.ts", boundary: "leaf-browser-only", rationale: "navigator.onLine context probe — WEB/DESKTOP shell only." },
  { path: "src/lib/services/device-presence-service.ts", boundary: "leaf-browser-only", rationale: "Device presence (window/document focus events) — shell only." },
  { path: "src/lib/services/error-monitoring-service.ts", boundary: "leaf-browser-only", rationale: "window error/unhandledrejection listeners — shell only." },
  { path: "src/lib/services/native-apps/detection.ts", boundary: "shell-specific", rationale: "Native-app detection probes — DESKTOP_HOST shell only." },
  { path: "src/lib/services/native-apps/launch.ts", boundary: "shell-specific", rationale: "Native-app launch — DESKTOP_HOST shell only." },
  { path: "src/lib/services/offline-sync/index.ts", boundary: "leaf-browser-only", rationale: "navigator.onLine + window online/offline events — shell only." },
  { path: "src/lib/services/onboarding-daemon/index.ts", boundary: "leaf-browser-only", rationale: "Onboarding draft cache (localStorage + navigator.permissions)." },
  { path: "src/lib/services/platform-readiness/platform-readiness-seeder.ts", boundary: "leaf-browser-only", rationale: "Platform capability probe — shell only." },
  { path: "src/lib/services/predictive-prefetch.ts", boundary: "leaf-browser-only", rationale: "Prefetch heuristic cache (localStorage) — WEB_APP shell only." },
  { path: "src/lib/services/push-notification/push-registration-service.ts", boundary: "leaf-browser-only", rationale: "navigator.serviceWorker push registration." },
  { path: "src/lib/services/routine-detector.ts", boundary: "leaf-browser-only", rationale: "Usage-routine cache (localStorage) — UI shell only." },
  { path: "src/lib/services/session-persistence.ts", boundary: "leaf-browser-only", rationale: "Session state cache (localStorage) — UI shell only." },
  { path: "src/lib/services/setup/hardware-capability-service.ts", boundary: "leaf-browser-only", rationale: "Hardware capability probe (navigator.*) — shell only." },
  { path: "src/lib/services/surface-detection/index.ts", boundary: "leaf-browser-only", rationale: "Surface (window/CSS env) detection — UI shell only." },
  { path: "src/lib/services/system-updates/index.ts", boundary: "leaf-browser-only", rationale: "System update probe — shell only." },
  { path: "src/lib/services/universal-state-sync/index.ts", boundary: "leaf-browser-only", rationale: "Cross-tab state sync (window storage events)." },
] as const;

export function classifyByPath(path: string): PortabilityClassification | null {
  return PORTABILITY_CLASSIFICATIONS.find((c) => c.path === path) ?? null;
}

/** Allowlist of leaf hooks that may touch window/document directly. */
export const LEAF_BROWSER_HOOK_ALLOWLIST: readonly string[] = PORTABILITY_CLASSIFICATIONS.filter(
  (c) => c.boundary === "leaf-browser-only" || c.boundary === "shell-specific",
).map((c) => c.path);
