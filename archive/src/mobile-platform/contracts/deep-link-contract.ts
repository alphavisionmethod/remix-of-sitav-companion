// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Deep-Link Contract
// Centralized routing for sita:// + Universal/App Links.
// ═══════════════════════════════════════════════════════════════

export type DeepLinkAuthRequirement = "public" | "authenticated" | "biometric";

export interface DeepLinkRoute {
  /** Stable key referenced by push payloads + analytics. */
  key: string;
  /** sita:// path or universal-link path. */
  path: string;
  /** Internal route mapped into MobileRoutes. */
  routeTemplate: string;
  authRequirement: DeepLinkAuthRequirement;
  /** Human-readable purpose. */
  description: string;
  /** Action when target is missing/stale. */
  staleFallback: string;
}

export interface DeepLinkResolution {
  key: string;
  routePath: string;
  params: Record<string, string>;
  authRequirement: DeepLinkAuthRequirement;
}

export interface DeepLinkContractError {
  code: "unknown-route" | "auth-required" | "biometric-required" | "stale-target" | "version-mismatch";
  message: string;
  fallbackRoute: string;
}
