// ═══════════════════════════════════════════════════════════════
// SITA OS — Release Identity (Phase 20.A)
// Single source of truth for release/version/environment tags
// consumed by Sentry, error-monitoring, tracing, alerting.
// ═══════════════════════════════════════════════════════════════

const env = (typeof import.meta !== "undefined" ? import.meta.env : {}) as Record<string, string | undefined>;

/** Release identifier — git SHA or build version, falls back to "dev". */
export const APP_RELEASE: string =
  env.VITE_APP_RELEASE ||
  env.VITE_GIT_SHA ||
  env.VITE_BUILD_VERSION ||
  "dev";

/** Environment — production / staging / preview / development. */
export const APP_ENVIRONMENT: string =
  env.VITE_SENTRY_ENVIRONMENT ||
  env.MODE ||
  (env.PROD === "true" ? "production" : "development");

/** Service name used in tracing tags. */
export const SERVICE_NAME = "sita-frontend";

export function getReleaseInfo() {
  return {
    release: APP_RELEASE,
    environment: APP_ENVIRONMENT,
    service: SERVICE_NAME,
    builtAt: env.VITE_BUILD_DATE || null,
  };
}
