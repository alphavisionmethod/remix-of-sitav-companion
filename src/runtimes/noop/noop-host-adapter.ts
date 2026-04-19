// ═══════════════════════════════════════════════════════════════
// SITA OS — No-op Host Adapter
// Safe stub for SIMULATED_OS_EXPERIENCE and SSR contexts where
// browser globals are unavailable. Returns inert values so shared
// hooks remain runtime-safe.
// ═══════════════════════════════════════════════════════════════

import type { RuntimeHostAdapter } from "../runtime-host-adapter";

export const noopHostAdapter: RuntimeHostAdapter = {
  isBrowserHost: false,
  getScrollY: () => 0,
  setScrollY: () => {},
  addScrollListener: () => () => {},
  addBeforeUnload: () => () => {},
  addOnlineListener: () => () => {},
  getCurrentPath: () => "",
};
