// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Navigation Guards
// Auth + biometric + stale-target guards run before route reveal.
// ═══════════════════════════════════════════════════════════════

import type { DeepLinkResolution, DeepLinkContractError } from "../contracts/deep-link-contract";

export type NavigationGuardOutcome =
  | { kind: "allow"; routePath: string }
  | { kind: "deny"; error: DeepLinkContractError };

export interface NavigationGuardContext {
  isAuthenticated: boolean;
  hasBiometricUnlock: boolean;
}

export function evaluateNavigationGuards(
  resolution: DeepLinkResolution,
  ctx: NavigationGuardContext,
): NavigationGuardOutcome {
  if (resolution.authRequirement === "authenticated" && !ctx.isAuthenticated) {
    return {
      kind: "deny",
      error: {
        code: "auth-required",
        message: "Sign in to open this link.",
        fallbackRoute: "/auth?redirect=" + encodeURIComponent(resolution.routePath),
      },
    };
  }
  if (resolution.authRequirement === "biometric") {
    if (!ctx.isAuthenticated) {
      return {
        kind: "deny",
        error: {
          code: "auth-required",
          message: "Sign in to open this link.",
          fallbackRoute: "/auth?redirect=" + encodeURIComponent(resolution.routePath),
        },
      };
    }
    if (!ctx.hasBiometricUnlock) {
      return {
        kind: "deny",
        error: {
          code: "biometric-required",
          message: "Biometric verification required.",
          fallbackRoute: "/mobile",
        },
      };
    }
  }
  return { kind: "allow", routePath: resolution.routePath };
}
