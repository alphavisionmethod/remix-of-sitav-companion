// ═══════════════════════════════════════════════════════════════
// SITA OS — Web Runtime Minimum Browser Contract
// Phase 13 — minimum browser baseline supported by the web SPA.
// Mirrors mobile min-os-version-contract for honesty parity.
// ═══════════════════════════════════════════════════════════════

export interface MinBrowserVersion {
  readonly chrome: number;
  readonly safari: number;
  readonly firefox: number;
  readonly edge: number;
  readonly notes: string;
}

export const MIN_BROWSER_VERSION: MinBrowserVersion = {
  chrome: 109,
  safari: 16,
  firefox: 115,
  edge: 109,
  notes: "Baselines chosen for full ES2022, dynamic-import, structuredClone, OffscreenCanvas, Web Push (where vendor-supported), and CSS subgrid.",
};

export interface BrowserCheckResult {
  readonly ok: boolean;
  readonly browser: "chrome" | "safari" | "firefox" | "edge" | "other";
  readonly version: number | null;
  readonly required: number | null;
  readonly reason?: string;
}

/** Detects the current browser + version and compares against the floor. */
export function checkMinBrowserVersion(ua: string = typeof navigator !== "undefined" ? navigator.userAgent : ""): BrowserCheckResult {
  if (!ua) return { ok: false, browser: "other", version: null, required: null, reason: "No user-agent available" };

  // Order matters: Edge UA contains Chrome, Chrome UA contains Safari.
  const edge = ua.match(/Edg\/(\d+)/);
  if (edge) {
    const v = Number(edge[1]);
    return { ok: v >= MIN_BROWSER_VERSION.edge, browser: "edge", version: v, required: MIN_BROWSER_VERSION.edge };
  }
  const chrome = ua.match(/Chrome\/(\d+)/);
  if (chrome && !ua.includes("Edg/")) {
    const v = Number(chrome[1]);
    return { ok: v >= MIN_BROWSER_VERSION.chrome, browser: "chrome", version: v, required: MIN_BROWSER_VERSION.chrome };
  }
  const firefox = ua.match(/Firefox\/(\d+)/);
  if (firefox) {
    const v = Number(firefox[1]);
    return { ok: v >= MIN_BROWSER_VERSION.firefox, browser: "firefox", version: v, required: MIN_BROWSER_VERSION.firefox };
  }
  const safari = ua.match(/Version\/(\d+).*Safari/);
  if (safari) {
    const v = Number(safari[1]);
    return { ok: v >= MIN_BROWSER_VERSION.safari, browser: "safari", version: v, required: MIN_BROWSER_VERSION.safari };
  }
  return { ok: true, browser: "other", version: null, required: null, reason: "Unrecognized browser — assumed evergreen" };
}
