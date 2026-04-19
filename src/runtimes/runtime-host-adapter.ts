// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime Host Adapter (canonical portability surface)
//
// Single typed bridge for the small set of browser-only globals
// that shared/portable hooks legitimately need (scroll position,
// path, before-unload, online listeners).
//
// Implementations:
//   • web/web-host-adapter.ts   — real window.* (WEB_APP / DESKTOP_HOST)
//   • noop/noop-host-adapter.ts — safe no-op (SIMULATED / SSR)
//
// This is the ONLY canonical adapter. The portability validators
// enforce that no second abstraction file is created.
// ═══════════════════════════════════════════════════════════════

export interface RuntimeHostAdapter {
  /** Current scroll Y offset in CSS pixels. */
  getScrollY(): number;
  /** Scroll the document. `behavior: "instant"` skips animation. */
  setScrollY(y: number, behavior?: ScrollBehavior): void;
  /** Subscribe to scroll events. Returns unsubscribe. */
  addScrollListener(fn: () => void): () => void;
  /** Subscribe to beforeunload. Returns unsubscribe. */
  addBeforeUnload(fn: () => void): () => void;
  /** Subscribe to online/offline transitions. Returns unsubscribe. */
  addOnlineListener(fn: (online: boolean) => void): () => void;
  /** Current pathname (e.g. "/desktop"). Empty string if not in a browsing runtime. */
  getCurrentPath(): string;
  /** True when the adapter is a real browser host (WEB_APP or DESKTOP_HOST). */
  readonly isBrowserHost: boolean;
}

import { webHostAdapter } from "./web/web-host-adapter";
import { noopHostAdapter } from "./noop/noop-host-adapter";
import { detectActiveRuntimeTier } from "./runtime-detection";

/**
 * Pure (non-React) accessor. Hooks should prefer `useRuntimeHost()`
 * which is provided through React context for testability, but this
 * accessor exists for non-React modules.
 */
export function getRuntimeHostAdapter(): RuntimeHostAdapter {
  // Adapter selection is driven by the canonical runtime detector.
  // No second abstraction — re-uses src/runtimes/runtime-detection.ts.
  if (typeof window === "undefined") return noopHostAdapter;
  const tier = detectActiveRuntimeTier();
  if (tier === "WEB_APP" || tier === "DESKTOP_HOST" || tier === "APPLIANCE_RUNTIME") {
    return webHostAdapter;
  }
  return noopHostAdapter;
}

// React hook — thin wrapper so hooks can swap adapter via context in tests.
import { createContext, useContext, useMemo, type ReactNode, createElement } from "react";

const RuntimeHostContext = createContext<RuntimeHostAdapter | null>(null);

export function RuntimeHostProvider({
  children,
  adapter,
}: {
  children: ReactNode;
  adapter?: RuntimeHostAdapter;
}) {
  const value = useMemo(() => adapter ?? getRuntimeHostAdapter(), [adapter]);
  return createElement(RuntimeHostContext.Provider, { value }, children);
}

export function useRuntimeHost(): RuntimeHostAdapter {
  const ctx = useContext(RuntimeHostContext);
  return ctx ?? getRuntimeHostAdapter();
}
