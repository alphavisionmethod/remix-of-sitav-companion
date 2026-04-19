// ═══════════════════════════════════════════════════════════════
// SITA OS — Web Host Adapter
// Real window.* implementation. Loaded only in browser-capable tiers
// (WEB_APP, DESKTOP_HOST, APPLIANCE_RUNTIME). Defensive guards keep
// SSR-time imports safe.
// ═══════════════════════════════════════════════════════════════

import type { RuntimeHostAdapter } from "../runtime-host-adapter";

const hasWindow = typeof window !== "undefined";
const hasDocument = typeof document !== "undefined";

export const webHostAdapter: RuntimeHostAdapter = {
  isBrowserHost: true,

  getScrollY() {
    return hasWindow ? window.scrollY : 0;
  },

  setScrollY(y: number, behavior: ScrollBehavior = "instant") {
    if (!hasWindow) return;
    window.scrollTo({ top: y, behavior });
  },

  addScrollListener(fn) {
    if (!hasWindow) return () => {};
    const opts: AddEventListenerOptions = { passive: true };
    window.addEventListener("scroll", fn, opts);
    return () => window.removeEventListener("scroll", fn);
  },

  addBeforeUnload(fn) {
    if (!hasWindow) return () => {};
    window.addEventListener("beforeunload", fn);
    return () => window.removeEventListener("beforeunload", fn);
  },

  addOnlineListener(fn) {
    if (!hasWindow) return () => {};
    const onOnline = () => fn(true);
    const onOffline = () => fn(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  },

  getCurrentPath() {
    if (hasWindow && window.location?.pathname) return window.location.pathname;
    if (hasDocument && document.location?.pathname) return document.location.pathname;
    return "";
  },
};
